import { useState } from 'react'
import { db } from '../lib/db'
import { hojeISO } from '../lib/datas'
import { useAjustes, salvarAjustes } from '../lib/hooks'
import { normalizar } from '../lib/exercicios'
import { ALIMENTOS } from '../content/alimentos'
import {
  RECEITAS, SLOT_NOME, NAO_CURTO, TEMPEROS, CANAIS, macrosReceita, linkVideo, type Receita, type Slot,
} from '../content/receitas'
import { Botao, BotaoIcone, Chip, Folha, Aviso, Secao, cx } from './ui'
import { Icone } from './Icone'

const r0 = (n: number) => Math.round(n)
const fmtQ = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',')

export async function registrarReceita(r: Receita, fator: number, horario = new Date().toTimeString().slice(0, 5), nome?: string) {
  const m = macrosReceita(r, fator)
  await db.refeicoes.add({ data: hojeISO(), horario, nome: nome ?? r.nome, kcal: r0(m.kcal), proteina: r0(m.proteina) })
}

export function useNaoCurto() {
  const aj = useAjustes()
  return aj.naoCurto ?? []
}

export function CardReceita({ r, fator = 1, onClick, extra }: { r: Receita; fator?: number; onClick: () => void; extra?: React.ReactNode }) {
  const m = macrosReceita(r, fator)
  return (
    <div className="flex w-full items-center gap-2 rounded-2xl bg-s2 p-3">
    <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left transition-transform duration-200 active:scale-[0.99]">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber"><Icone nome="fogo" /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-tight">{r.nome}</span>
        <span className="tnum block text-sm text-tx2">
          {r0(m.kcal)} kcal · {r0(m.proteina)} g prot · {r.minutos} min{fator !== 1 && ` · porção ${fmtQ(fator)}×`}
        </span>
        <span className="block truncate text-xs text-tx2">{r.temperos.slice(0, 3).join(' · ')}</span>
      </span>
      {!extra && <Icone nome="seta" size={18} className="shrink-0 text-tx2" />}
    </button>
    {extra}
    </div>
  )
}

/** Detalhe da receita: ingredientes (com porção ajustável), temperos, passos e vídeo */
export function FolhaReceita({ r, fatorInicial = 1, onFechar, acoes }: { r: Receita; fatorInicial?: number; onFechar: () => void; acoes?: (fator: number) => React.ReactNode }) {
  const [fator, setFator] = useState(fatorInicial)
  const m = macrosReceita(r, fator)
  return (
    <Folha aberta onFechar={onFechar} titulo={r.nome} alta>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-s2 p-2"><p className="tnum font-display text-2xl font-bold text-amber">{r0(m.kcal)}</p><p className="text-xs text-tx2">kcal</p></div>
          <div className="rounded-2xl bg-s2 p-2"><p className="tnum font-display text-2xl font-bold">{r0(m.proteina)} g</p><p className="text-xs text-tx2">proteína</p></div>
          <div className="rounded-2xl bg-s2 p-2"><p className="tnum font-display text-2xl font-bold">{r.minutos}</p><p className="text-xs text-tx2">minutos</p></div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-s1 p-3">
          <span className="text-sm text-tx2">Tamanho da porção</span>
          <div className="flex items-center gap-2">
            <BotaoIcone icone="menos" rotulo="Porção menor" className="h-10 w-10" onClick={() => setFator(Math.max(0.5, fator - 0.25))} />
            <span className="tnum w-14 text-center font-display text-xl font-bold">{fmtQ(fator)}×</span>
            <BotaoIcone icone="mais" rotulo="Porção maior" className="h-10 w-10" onClick={() => setFator(Math.min(2.5, fator + 0.25))} />
          </div>
        </div>

        <section>
          <h3 className="font-display mb-2 text-lg font-semibold">Ingredientes</h3>
          <ul className="space-y-1 text-sm">
            {r.itens.map((it) => {
              const a = ALIMENTOS.find((x) => x.id === it.alimentoId)
              return a ? (
                <li key={it.alimentoId} className="flex items-center justify-between gap-2 rounded-lg bg-s2 px-3 py-2">
                  <span>{a.nome}</span>
                  <span className="tnum shrink-0 text-right">
                    <span className="block font-semibold">{Math.round((a.g * it.qtd * fator) / 5) * 5 || 1} {a.grupo === 'bebida' || a.porcao.includes('ml') ? 'ml' : 'g'}</span>
                    <span className="block text-xs text-tx2">{fmtQ(it.qtd * fator)}× {a.porcao.replace(/\s*\(.*\)/, '')}</span>
                  </span>
                </li>
              ) : null
            })}
          </ul>
        </section>

        <section>
          <h3 className="font-display mb-2 text-lg font-semibold">Temperos</h3>
          <div className="flex flex-wrap gap-2">
            {r.temperos.map((t) => <span key={t} className="rounded-full border border-amber/40 bg-amber/10 px-3 py-1 text-sm">{t}</span>)}
          </div>
        </section>

        <section>
          <h3 className="font-display mb-2 text-lg font-semibold">Modo de preparo</h3>
          <ol className="space-y-3">
            {r.passos.map((p, n) => (
              <li key={n} className="flex gap-3">
                <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber font-bold text-bg">{n + 1}</span>
                <span className="pt-1 leading-relaxed">{p}</span>
              </li>
            ))}
          </ol>
          {r.dica && <Aviso className="mt-3"><strong>Dica de sabor:</strong> {r.dica}</Aviso>}
        </section>

        <a href={linkVideo(r)} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-s2 font-semibold">
          <Icone nome="play" size={20} className="text-warn" /> Ver vídeos dessa receita no YouTube
        </a>
        <p className="-mt-3 text-center text-xs text-tx2">Abre uma busca no YouTube (precisa de internet).</p>

        {acoes?.(fator)}
      </div>
    </Folha>
  )
}

/** Aba Receitas: filtros, não curto, kit de temperos e canais */
export function AbaReceitas() {
  const naoCurto = useNaoCurto()
  const [slot, setSlot] = useState<Slot | null>(null)
  const [q, setQ] = useState('')
  const [ver, setVer] = useState<Receita | null>(null)
  const [registrado, setRegistrado] = useState(false)
  const lista = RECEITAS.filter((r) => (!slot || r.slots.includes(slot)) && !r.tags.some((t) => naoCurto.includes(t)) && (!q || normalizar(r.nome + ' ' + r.temperos.join(' ')).includes(normalizar(q))))
  const [abertoNaoCurto] = useState(naoCurto.length === 0)
  const alternar = (id: string) => salvarAjustes({ naoCurto: naoCurto.includes(id) ? naoCurto.filter((x) => x !== id) : [...naoCurto, id] })

  return (
    <div className="space-y-4">
      <p className="text-sm text-tx2">{RECEITAS.length} receitas temperadas, sem peixe. Use em qualquer refeição do plano com o botão “Trocar”.</p>

      <details className="rounded-[20px] bg-s1 p-4" open={abertoNaoCurto || undefined}>
        <summary className="min-h-10 cursor-pointer font-semibold">Não curto ({naoCurto.length})</summary>
        <p className="mb-2 mt-1 text-sm text-tx2">Marque o que você não come. Essas receitas somem das sugestões.</p>
        <div className="flex flex-wrap gap-2">
          {NAO_CURTO.map((n) => (
            <Chip key={n.id} ativo={naoCurto.includes(n.id)} onClick={() => alternar(n.id)} className={naoCurto.includes(n.id) ? '!bg-warn !border-warn !text-bg' : ''}>
              {naoCurto.includes(n.id) ? '✕ ' : ''}{n.nome}
            </Chip>
          ))}
        </div>
      </details>

      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar receita ou tempero (curry, páprica…)" className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" />
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip ativo={!slot} onClick={() => setSlot(null)}>Todas</Chip>
        {(Object.keys(SLOT_NOME) as Slot[]).map((s) => <Chip key={s} ativo={slot === s} onClick={() => setSlot(slot === s ? null : s)}>{SLOT_NOME[s]}</Chip>)}
      </div>

      {registrado && <Aviso tipo="ok">Refeição registrada em Hoje.</Aviso>}
      <div className="space-y-2">
        {lista.map((r) => <CardReceita key={r.id} r={r} onClick={() => setVer(r)} />)}
        {lista.length === 0 && <p className="py-6 text-center text-tx2">Nada encontrado com esses filtros.</p>}
      </div>

      <Secao titulo="Kit de temperos">
        <div className="space-y-2">
          {TEMPEROS.map((t) => (
            <div key={t.nome} className={cx('rounded-2xl bg-s1 p-3')}>
              <p className="font-semibold text-amber">{t.nome}</p>
              <p className="text-sm">{t.receita}</p>
              <p className="text-xs text-tx2">Use em: {t.usa}</p>
            </div>
          ))}
        </div>
        <Aviso tipo="alerta" className="mt-3">Molho inglês (Worcestershire) e molho de ostra levam peixe. Shoyu, mostarda, páprica e ervas estão liberados.</Aviso>
      </Secao>

      <Secao titulo="Vídeos e inspiração">
        <div className="space-y-2">
          {CANAIS.map((c) => (
            <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-s1 p-3">
              <span><span className="block font-semibold">{c.nome}</span><span className="block text-sm text-tx2">{c.desc}</span></span>
              <Icone nome="seta" size={18} className="shrink-0 text-tx2" />
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs text-tx2">Cada receita também tem o botão “Ver vídeos” com a busca certa no YouTube. Atenção a receitas de terceiros com peixe ou molho de ostra.</p>
      </Secao>

      {ver && (
        <FolhaReceita r={ver} onFechar={() => setVer(null)}
          acoes={(f) => <Botao grande className="w-full" icone="check" onClick={async () => { await registrarReceita(ver, f); setVer(null); setRegistrado(true) }}>Comi isso agora</Botao>} />
      )}
    </div>
  )
}
