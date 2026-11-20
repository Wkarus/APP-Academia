# Mídia dos exercícios: fontes, licenças e decisão

Data da análise: 20/11/2026.

## Fontes comparadas

| Fonte | Conteúdo | Licença dos dados | Licença/posse da mídia | Acesso automatizado | Decisão |
|---|---|---|---|---|---|
| **free-exercise-db** (github.com/yuhonas/free-exercise-db) | ~870 exercícios, músculos, equipamento, nível, instruções em inglês, 2 fotos por exercício (início e fim) | Unlicense (domínio público): "free and unencumbered software released into the public domain… for any purpose, commercial or non-commercial" | A Unlicense cobre o repositório inteiro (JSON + imagens). Não há licença separada para as imagens. O README credita o dataset original exercises.json (Ollie Jennings). | Download direto pelo GitHub (raw) | **Usada como base** |
| **ExerciseDB V1** (exercisedb.dev, hoje AscendAPI) | ~1.500 exercícios com GIF | Código da API: AGPL-3.0. Nenhuma licença declarada para os dados. | GIFs de propriedade da AscendAPI, sem licença aberta. Os Termos de Uso (página no Notion) têm uma seção de "proibição de armazenamento" e dizem que a licença é revogável e vale só durante a assinatura. | A API V1 responde com uma verificação anti-robô da Vercel (Security Checkpoint), então o download automatizado é bloqueado | **Não usada.** Re-hospedar os GIFs dentro do app (exigência de funcionar offline) não está claramente permitido. |
| **wger** (wger.de, API aberta) | ~980 exercícios (EN), ~400 imagens, ~80 vídeos | Licença por item: CC-BY-SA 3.0/4.0, CC-BY 4.0, CC0 ou ODbL (endpoint `/api/v2/license/`) | Licença por imagem ou vídeo, com autor. Exige atribuição e, no CC-BY-SA, compartilhamento pela mesma licença. | API aberta | **Avaliada, não usada na v1.** A cobertura de mídia é menor, os vídeos são pesados (MOV HEVC de ~35 MB) e cada arquivo exige atribuição por autor. Fica como opção futura. |

Esta análise não é parecer jurídico. A conclusão é conservadora: o app usa só o material de domínio público.

## Como a mídia é gerada

`scripts/build_exercises.py`:

1. Baixa `dist/exercises.json` da free-exercise-db e guarda em cache em `.cache/`.
2. Normaliza tudo para `data/exercises.json`. Campos: id, nome (PT-BR), nameEn, primários, secundários, equipamento, dificuldade, passos, erros, respiração, media, mediaUrl, fonte, licença, minhaAcademia e noPlano.
3. Aplica as traduções de `data/i18n/pt-detalhado.json` (exercícios do plano, com erros comuns e respiração) e de `data/i18n/pt-comuns.json` (~130 exercícios comuns). Os demais recebem um nome traduzido por glossário, e os passos ficam em inglês com um aviso na tela.
4. Para os exercícios da "Minha academia", os traduzidos e os do plano (573 ao todo), gera:
   - `public/media/ex/<id>.webp`: **WebP animado em loop** que mostra o início do movimento, faz uma transição suave e mostra o fim (320 px, 20–90 KB cada, limite de 150 KB);
   - `public/media/thumb/<id>.webp`: miniatura estática (~4 KB).
5. Os exercícios restantes usam o modo `quadros`: as 2 fotos remotas alternam em loop. O app guarda essas fotos em cache depois da primeira visualização.

## Trocar a mídia de um exercício (biblioteca paga no futuro)

O campo `media` de cada exercício pode ser trocado. Edite `data/media-overrides.json`:

```json
{
  "Dumbbell_Bench_Press": {
    "media": { "tipo": "mp4", "url": "media/licenciada/supino.mp4", "poster": "media/licenciada/supino.jpg", "local": true },
    "fonte": { "nome": "Biblioteca X", "url": "https://...", "licenca": "Licença comercial nº 123" }
  }
}
```

Depois rode `npm run dados` e `npm run build`. O componente `MidiaExercicio` já aceita `webp-animado`, `mp4` (loop sem som), `gif` e `quadros`. Nada mais precisa mudar. A tela de créditos mostra a fonte e a licença de cada exercício.
