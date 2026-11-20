#!/usr/bin/env python3
"""
FORJA — pipeline de dados de exercícios.

Baixa a free-exercise-db (domínio público / Unlicense), normaliza para o esquema
do app, aplica traduções PT-BR, marca o que existe na "Minha academia" e gera a
mídia local (WebP animado alternando início/fim do movimento + miniatura).

Uso:
    python3 scripts/build_exercises.py            # mídia para "Minha academia" + traduzidos
    python3 scripts/build_exercises.py --all      # mídia para todos os ~870 exercícios
    python3 scripts/build_exercises.py --offline  # usa só o cache local (.cache/)

Saídas:
    data/exercises.json            (fonte de verdade, versionada)
    public/data/exercises.json     (cópia servida ao app)
    public/media/ex/<id>.webp      (animação em loop, ~20-60 KB)
    public/media/thumb/<id>.webp   (miniatura estática, ~3-6 KB)

Troca de mídia (ex.: biblioteca licenciada no futuro): edite
data/media-overrides.json. Cada entrada substitui mediaUrl/poster/fonte/licença
daquele exercício sem mexer no resto. Ver docs/MIDIA-E-LICENCAS.md.
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "fedb"
DATA = ROOT / "data"
PUBLIC = ROOT / "public"
FEDB_JSON = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"
FEDB_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/{}"

ANIM_W = 320
THUMB_W = 128
MAX_BYTES = 150_000

SOURCE_FEDB = {
    "nome": "free-exercise-db",
    "url": "https://github.com/yuhonas/free-exercise-db",
    "licenca": "Unlicense (domínio público)",
}

MUSCULOS = {
    "abdominals": "Abdômen", "abductors": "Abdutores", "adductors": "Adutores",
    "biceps": "Bíceps", "calves": "Panturrilhas", "chest": "Peitoral",
    "forearms": "Antebraços", "glutes": "Glúteos", "hamstrings": "Posteriores de coxa",
    "lats": "Dorsais", "lower back": "Lombar", "middle back": "Meio das costas",
    "neck": "Pescoço", "quadriceps": "Quadríceps", "shoulders": "Ombros",
    "traps": "Trapézio", "triceps": "Tríceps",
}
EQUIP = {
    "dumbbell": "Halteres", "barbell": "Barra", "e-z curl bar": "Barra W",
    "cable": "Polia", "body only": "Peso do corpo", None: "Peso do corpo",
    "machine": "Máquina", "kettlebells": "Kettlebell", "bands": "Elástico",
    "medicine ball": "Medicine ball", "exercise ball": "Bola suíça",
    "foam roll": "Rolo de liberação", "other": "Outros",
}
NIVEL = {"beginner": "iniciante", "intermediate": "intermediario", "expert": "avancado"}
CATEG = {
    "strength": "Força", "stretching": "Alongamento", "plyometrics": "Pliometria",
    "powerlifting": "Powerlifting", "olympic weightlifting": "Levantamento olímpico",
    "strongman": "Strongman", "cardio": "Cardio",
}

# --- Minha academia -------------------------------------------------------
# Halteres, barra olímpica, barra W, rack com polia, banco, anilhas, estação
# Schwinn (supino/puxada — a confirmar), esteira, elíptico, bike, espaldar, cama
# elástica. SEM leg press e SEM cadeira extensora/flexora.
GYM_EQUIP = {"dumbbell", "barbell", "e-z curl bar", "cable", "body only", None}
GYM_MACHINE_OK = {
    "Bicycling_Stationary", "Elliptical_Trainer", "Walking_Treadmill",
    "Jogging_Treadmill", "Running_Treadmill", "Recumbent_Bike",
    "Machine_Bench_Press", "Leverage_Chest_Press",  # estação Schwinn (a confirmar)
}
GYM_OTHER_OK = {"Front_Plate_Raise", "Plate_Twist", "Plate_Pinch", "Reverse_Plate_Curls",
                "Bicycling"}
GYM_EXCLUDE = re.compile(
    r"leg.?press|leg.?extension|leg.?curl|smith|hack.?squat|chains|bands?\b|sled|"
    r"bosu|exercise.?ball|suspended|kettlebell|glute.?ham.?raise_|reverse.?band",
    re.I,
)
# Ajustes de equipamento para exercícios do plano (goblet com halter etc.)
EQUIP_OVERRIDE = {"Goblet_Squat": "dumbbell"}

# Exercícios que não existem na base (sem mídia — mostram só mapa muscular)
CUSTOM = [
    {
        "id": "forja_cama_elastica",
        "nome": "Cama elástica (jump)",
        "nameEn": "Mini trampoline (rebounder)",
        "primarios": ["calves"], "secundarios": ["quadriceps", "glutes", "abdominals"],
        "equipamento": "other", "equipamentoPt": "Cama elástica",
        "dificuldade": "iniciante", "categoria": "Cardio", "mecanica": "compound", "forca": None,
        "passos": [
            "Suba na cama elástica com os pés na largura do quadril.",
            "Faça saltos baixos e ritmados, sem tirar muito os pés da lona.",
            "Mantenha o abdômen firme e os braços acompanhando o ritmo.",
            "Comece com 3-5 minutos e aumente aos poucos.",
        ],
        "erros": ["Saltar alto demais no começo", "Travar os joelhos ao aterrissar"],
        "respiracao": "Respiração ritmada; deve ser possível conversar.",
    },
    {
        "id": "forja_espaldar_elevacao_joelhos",
        "nome": "Elevação de joelhos no espaldar",
        "nameEn": "Hanging knee raise (stall bars)",
        "primarios": ["abdominals"], "secundarios": [],
        "equipamento": "body only", "equipamentoPt": "Espaldar",
        "dificuldade": "iniciante", "categoria": "Força", "mecanica": "isolation", "forca": "pull",
        "passos": [
            "De costas para o espaldar, segure a barra mais alta que alcançar com conforto.",
            "Com as costas apoiadas, deixe as pernas penduradas.",
            "Eleve os joelhos em direção ao peito, enrolando levemente o quadril.",
            "Desça devagar, sem balançar.",
        ],
        "erros": ["Balançar o corpo", "Subir só as coxas sem enrolar o quadril"],
        "respiracao": "Solte o ar ao subir, inspire ao descer.",
        "mediaFrom": "Hanging_Leg_Raise",
    },
]

# --- Tradução automática de nomes (glossário) -----------------------------
GLOSS = [
    (r"\bdumbbells?\b", "com halteres"), (r"\bbarbell\b", "com barra"),
    (r"\bez[- ]?bar\b", "barra W"), (r"\bcable\b", "na polia"),
    (r"\bkettlebells?\b", "com kettlebell"), (r"\bsmith machine\b", "no Smith"),
    (r"\bmachine\b", "na máquina"), (r"\bseated\b", "sentado"), (r"\bstanding\b", "em pé"),
    (r"\blying\b", "deitado"), (r"\bincline\b", "inclinado"), (r"\bdecline\b", "declinado"),
    (r"\bflat bench\b", "banco reto"), (r"\bone[- ]arm\b", "unilateral"),
    (r"\bsingle[- ]arm\b", "unilateral"), (r"\bsingle[- ]leg\b", "unilateral"),
    (r"\bone[- ]leg(ged)?\b", "unilateral"), (r"\balternat(e|ing)\b", "alternado"),
    (r"\bclose[- ]grip\b", "pegada fechada"), (r"\bwide[- ]grip\b", "pegada aberta"),
    (r"\breverse grip\b", "pegada inversa"), (r"\breverse\b", "inverso"),
    (r"\bbench press\b", "supino"), (r"\bpress\b", "desenvolvimento"),
    (r"\bsquats?\b", "agachamento"), (r"\blunges?\b", "afundo"), (r"\bdeadlift\b", "terra"),
    (r"\brows?\b", "remada"), (r"\bcurls?\b", "rosca"), (r"\bflyes?\b", "crucifixo"),
    (r"\braises?\b", "elevação"), (r"\blateral\b", "lateral"), (r"\bfront\b", "frontal"),
    (r"\brear delt\b", "deltoide posterior"), (r"\bextension\b", "extensão"),
    (r"\btriceps?\b", "tríceps"), (r"\bbiceps?\b", "bíceps"), (r"\bcalf\b", "panturrilha"),
    (r"\bshrugs?\b", "encolhimento"), (r"\bcrunch(es)?\b", "abdominal"),
    (r"\bpull[- ]?ups?\b", "barra fixa"), (r"\bpush[- ]?ups?\b", "flexão"),
    (r"\bpulldowns?\b", "puxada"), (r"\bstretch\b", "alongamento"), (r"\bwrist\b", "punho"),
    (r"\bhamstrings?\b", "posteriores"), (r"\bglutes?\b", "glúteos"), (r"\bchest\b", "peito"),
    (r"\bshoulders?\b", "ombros"), (r"\bback\b", "costas"), (r"\bneck\b", "pescoço"),
    (r"\bhip\b", "quadril"), (r"\blegs?\b", "pernas"), (r"\bknees?\b", "joelhos"),
    (r"\bwith\b", "com"), (r"\band\b", "e"), (r"\bon\b", "no"), (r"\bto\b", "até"),
    (r"\bthe\b", ""), (r"\ba\b", ""), (r"\bbench\b", "banco"), (r"\brope\b", "corda"),
    (r"\bball\b", "bola"), (r"\bjump\b", "salto"), (r"\bplank\b", "prancha"),
]


def auto_pt(name: str) -> str:
    s = name
    for pat, rep in GLOSS:
        s = re.sub(pat, rep, s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" -")
    return s[:1].upper() + s[1:]


def fetch(url: str, dest: Path, offline: bool) -> bytes:
    if dest.exists():
        return dest.read_bytes()
    if offline:
        raise FileNotFoundError(dest)
    import time
    req = urllib.request.Request(url, headers={"User-Agent": "forja-build/1.0"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read()
            break
        except Exception:  # noqa: BLE001 — 429/conexão: espera e tenta de novo
            if attempt == 5:
                raise
            time.sleep(2 ** attempt)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(b)
    return b


def resize(im: Image.Image, w: int) -> Image.Image:
    im = im.convert("RGB")
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def make_media(ex_id: str, images: list[str], offline: bool) -> dict | None:
    out_anim = PUBLIC / "media" / "ex" / f"{ex_id}.webp"
    out_thumb = PUBLIC / "media" / "thumb" / f"{ex_id}.webp"
    if out_anim.exists() and out_thumb.exists():
        return {"anim": out_anim, "thumb": out_thumb}
    frames_raw = []
    for rel in images[:2]:
        b = fetch(FEDB_IMG.format(rel), CACHE / "img" / rel, offline)
        frames_raw.append(Image.open(io.BytesIO(b)))
    if not frames_raw:
        return None
    out_anim.parent.mkdir(parents=True, exist_ok=True)
    out_thumb.parent.mkdir(parents=True, exist_ok=True)
    resize(frames_raw[0], THUMB_W).save(out_thumb, "WEBP", quality=60, method=6)
    if len(frames_raw) == 1:
        resize(frames_raw[0], ANIM_W).save(out_anim, "WEBP", quality=55, method=6)
        return {"anim": out_anim, "thumb": out_thumb}
    a, b = resize(frames_raw[0], ANIM_W), resize(frames_raw[1], ANIM_W)
    if b.size != a.size:
        b = b.resize(a.size, Image.LANCZOS)
    # início (pausa) → transição → fim (pausa) → transição de volta
    for q in (55, 45, 35):
        fr, du = [a], [700]
        for t in (0.33, 0.66):
            fr.append(Image.blend(a, b, t)); du.append(110)
        fr.append(b); du.append(700)
        for t in (0.66, 0.33):
            fr.append(Image.blend(a, b, t)); du.append(110)
        fr[0].save(out_anim, "WEBP", save_all=True, append_images=fr[1:], duration=du,
                   loop=0, quality=q, method=6)
        if out_anim.stat().st_size <= MAX_BYTES:
            break
    return {"anim": out_anim, "thumb": out_thumb}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="gerar mídia para todos")
    ap.add_argument("--offline", action="store_true", help="usar só o cache")
    args = ap.parse_args()

    raw = json.loads(fetch(FEDB_JSON, CACHE / "exercises.json", args.offline))
    det = json.loads((DATA / "i18n" / "pt-detalhado.json").read_text("utf-8"))
    com = json.loads((DATA / "i18n" / "pt-comuns.json").read_text("utf-8"))
    overrides_path = DATA / "media-overrides.json"
    overrides = json.loads(overrides_path.read_text("utf-8")) if overrides_path.exists() else {}
    overrides = {k: v for k, v in overrides.items() if not k.startswith("_")}
    plan_ids = set(json.loads((DATA / "plan-ids.json").read_text("utf-8")))

    out = []
    for x in raw:
        eid = x["id"]
        eq = EQUIP_OVERRIDE.get(eid, x.get("equipment"))
        gym = (
            (eq in GYM_EQUIP or eid in GYM_MACHINE_OK or eid in GYM_OTHER_OK)
            and not GYM_EXCLUDE.search(eid)
        )
        if eq == "machine" and eid not in GYM_MACHINE_OK:
            gym = False
        rec = {
            "id": eid,
            "nome": auto_pt(x["name"]),
            "nameEn": x["name"],
            "primarios": x.get("primaryMuscles") or [],
            "secundarios": x.get("secondaryMuscles") or [],
            "equipamento": eq or "body only",
            "equipamentoPt": EQUIP.get(eq, "Outros"),
            "dificuldade": NIVEL.get(x.get("level"), "iniciante"),
            "categoria": CATEG.get(x.get("category"), "Força"),
            "mecanica": x.get("mechanic"),
            "forca": x.get("force"),
            "passos": x.get("instructions") or [],
            "passosIdioma": "en",
            "erros": [],
            "respiracao": None,
            "traduzido": False,
            "minhaAcademia": bool(gym),
            "noPlano": eid in plan_ids,
            "_images": x.get("images") or [],
        }
        if eid in det:
            d = det[eid]
            rec.update(nome=d["n"], passos=d["s"], erros=d.get("e", []),
                       respiracao=d.get("r"), passosIdioma="pt", traduzido=True)
        elif eid in com:
            n, s = com[eid]
            rec.update(nome=n, passos=s, passosIdioma="pt", traduzido=True)
        out.append(rec)

    by_id = {r["id"]: r for r in out}
    for c in CUSTOM:
        src = by_id.get(c.get("mediaFrom", ""))
        rec = {k: v for k, v in c.items() if k != "mediaFrom"}
        rec.update(passosIdioma="pt", traduzido=True, minhaAcademia=True,
                   noPlano=c["id"] in plan_ids, _images=src["_images"] if src else [])
        rec["_mediaFrom"] = c.get("mediaFrom")
        out.append(rec)

    missing = plan_ids - {r["id"] for r in out}
    if missing:
        print("ERRO: exercícios do plano sem correspondência:", missing, file=sys.stderr)
        return 1

    want_media = [r for r in out if r["_images"] and (args.all or r["minhaAcademia"] or r["traduzido"] or r["noPlano"])]
    print(f"{len(out)} exercícios; gerando mídia local para {len(want_media)}…")

    def job(r):
        try:
            return r["id"], make_media(r["id"], r["_images"], args.offline)
        except Exception as e:  # noqa: BLE001
            return r["id"], e

    results = {}
    with cf.ThreadPoolExecutor(6) as pool:
        for i, (eid, res) in enumerate(pool.map(job, want_media), 1):
            results[eid] = res
            if i % 50 == 0:
                print(f"  {i}/{len(want_media)}")

    total = 0
    for r in out:
        imgs = r.pop("_images")
        r.pop("_mediaFrom", None)
        res = results.get(r["id"])
        if isinstance(res, dict):
            total += res["anim"].stat().st_size + res["thumb"].stat().st_size
            r["media"] = {
                "tipo": "webp-animado",
                "url": f"media/ex/{r['id']}.webp",
                "poster": f"media/thumb/{r['id']}.webp",
                "local": True,
            }
        elif imgs:
            # Fora da academia: imagens remotas de início/fim alternadas em loop pelo app
            r["media"] = {
                "tipo": "quadros",
                "quadros": [FEDB_IMG.format(p) for p in imgs[:2]],
                "poster": FEDB_IMG.format(imgs[0]),
                "local": False,
            }
        else:
            r["media"] = {"tipo": "nenhuma"}
        r["mediaUrl"] = r["media"].get("url") or (r["media"].get("quadros") or [None])[0]
        r["fonte"] = SOURCE_FEDB if not r["id"].startswith("forja_") else {
            "nome": "FORJA (texto próprio)", "url": None, "licenca": "Texto próprio",
        }
        r["licenca"] = r["fonte"]["licenca"]
        if isinstance(res, Exception):
            print("  falha de mídia", r["id"], res, file=sys.stderr)
        # Troca de mídia por exercício (biblioteca licenciada no futuro)
        if r["id"] in overrides:
            ov = overrides[r["id"]]
            r["media"] = {**r.get("media", {}), **ov.get("media", {})}
            r["mediaUrl"] = r["media"].get("url") or r["mediaUrl"]
            if "fonte" in ov:
                r["fonte"] = ov["fonte"]
                r["licenca"] = ov["fonte"].get("licenca", r["licenca"])

    out.sort(key=lambda r: (not r["noPlano"], not r["traduzido"], not r["minhaAcademia"], r["nome"]))
    payload = {
        "versao": 1,
        "geradoPor": "scripts/build_exercises.py",
        "fontes": [SOURCE_FEDB],
        "exercicios": out,
    }
    s = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    (DATA / "exercises.json").write_text(s, "utf-8")
    (PUBLIC / "data").mkdir(parents=True, exist_ok=True)
    (PUBLIC / "data" / "exercises.json").write_text(s, "utf-8")
    print(f"OK: {len(out)} exercícios, {sum(r['traduzido'] for r in out)} traduzidos, "
          f"{sum(r['minhaAcademia'] for r in out)} na Minha academia, "
          f"mídia local {total/1e6:.1f} MB, JSON {len(s)/1e3:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
