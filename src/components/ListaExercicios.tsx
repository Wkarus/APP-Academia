import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercicio, Musculo } from '../lib/types'
import { MUSCULO_PT, NIVEL_PT, normalizar } from '../lib/exercicios'
import { MidiaExercicio } from './MidiaExercicio'
import { Chip, Esqueleto, Interruptor, cx } from './ui'
import { Icone } from './Icone'

const GRUPOS: { id: string; nome: string; m: Musculo[] }[] = [
  { id: 'peito', nome: 'Peito', m: ['chest'] },
  { id: 'costas', nome: 'Costas', m: ['lats', 'middle back', 'lower back', 'traps'] },
  { id: 'ombros', nome: 'Ombros', m: ['shoulders'] },
  { id: 'biceps', nome: 'Bíceps', m: ['biceps'] },
  { id: 'triceps', nome: 'Tríceps', m: ['triceps'] },
  { id: 'antebraco', nome: 'Antebraço', m: ['forearms'] },
  { id: 'quad', nome: 'Quadríceps', m: ['quadriceps'] },
  { id: 'post', nome: 'Posteriores', m: ['hamstrings'] },
  { id: 'gluteo', nome: 'Glúteos', m: ['glutes', 'abductors', 'adductors'] },
  { id: 'pant', nome: 'Panturrilha', m: ['calves'] },
  { id: 'abd', nome: 'Abdômen', m: ['abdominals'] },
]
const EQUIPS = [
  { id: 'dumbbell', nome: 'Halteres' },
  { id: 'barbell', nome: 'Barra' },
  { id: 'e-z curl bar', nome: 'Barra W' },
  { id: 'cable', nome: 'Polia' },
  { id: 'body only', nome: 'Peso do corpo' },
  { id: 'machine', nome: 'Máquina' },
  { id: 'other', nome: 'Outros' },
]
const NIVEIS = ['iniciante', 'intermediario', 'avancado'] as const

export interface Filtros { q: string; grupo: string | null; equip: string | null; nivel: string | null; academia: boolean; soPt: boolean }

export function useFiltrosExercicios(inicial?: Partial<Filtros>) {
  return useState<Filtros>({ q: '', grupo: null, equip: null, nivel: null, academia: true, soPt: false, ...inicial })
}

export function filtrar(lista: Exercicio[], f: Filtros) {
  const q = normalizar(f.q.trim())
  const g = GRUPOS.find((x) => x.id === f.grupo)
  return lista.filter((e) => {
    if (f.academia && !e.minhaAcademia) return false
    if (f.soPt && !e.traduzido) return false
    if (g && !e.primarios.some((m) => g.m.includes(m))) return false
    if (f.equip && e.equipamento !== f.equip) return false
    if (f.nivel && e.dificuldade !== f.nivel) return false
    if (q && !normalizar(e.nome + ' ' + e.nameEn + ' ' + e.equipamentoPt).includes(q)) return false
    return true
  })
}

export function grupoDoMusculo(m?: Musculo) {
  return m ? GRUPOS.find((g) => g.m.includes(m))?.id ?? null : null
}

export function PainelFiltros({ f, setF, total }: { f: Filtros; setF: (f: Filtros) => void; total: number }) {
  const [mais, setMais] = useState(false)
  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Buscar exercício</span>
        <Icone nome="busca" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tx2" />
        <input
          type="search"
          value={f.q}
          onChange={(e) => setF({ ...f, q: e.target.value })}
          placeholder="Buscar (ex.: supino, remada, agachamento)"
          className="min-h-12 w-full rounded-2xl border border-line bg-s2 pl-12 pr-4 text-tx placeholder:text-tx2/70"
        />
      </label>
      <div className="rounded-2xl bg-s1 px-3">
        <Interruptor ligado={f.academia} onChange={(v) => setF({ ...f, academia: v })} rotulo="Minha academia" descricao="Só o que dá para fazer com seus equipamentos" />
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar por músculo">
        <Chip ativo={!f.grupo} onClick={() => setF({ ...f, grupo: null })}>Todos</Chip>
        {GRUPOS.map((g) => <Chip key={g.id} ativo={f.grupo === g.id} onClick={() => setF({ ...f, grupo: f.grupo === g.id ? null : g.id })}>{g.nome}</Chip>)}
      </div>
      <button onClick={() => setMais(!mais)} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-amber" aria-expanded={mais}>
        <Icone nome="filtro" size={18} /> {mais ? 'Menos filtros' : 'Equipamento e dificuldade'}
      </button>
      {mais && (
        <div className="space-y-3">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar por equipamento">
            {EQUIPS.map((e) => <Chip key={e.id} ativo={f.equip === e.id} onClick={() => setF({ ...f, equip: f.equip === e.id ? null : e.id })}>{e.nome}</Chip>)}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por dificuldade">
            {NIVEIS.map((n) => <Chip key={n} ativo={f.nivel === n} onClick={() => setF({ ...f, nivel: f.nivel === n ? null : n })}>{NIVEL_PT[n]}</Chip>)}
            <Chip ativo={f.soPt} onClick={() => setF({ ...f, soPt: !f.soPt })}>Só traduzidos</Chip>
          </div>
        </div>
      )}
      <p className="text-sm text-tx2" aria-live="polite">{total} exercícios</p>
    </div>
  )
}

export function ItemExercicio({ ex, onClick, direita }: { ex: Exercicio; onClick: () => void; direita?: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex min-h-20 w-full items-center gap-3 rounded-2xl bg-s1 p-2 text-left transition-transform duration-200 active:scale-[0.99]">
      <MidiaExercicio ex={ex} tamanho="sm" className="h-16 w-16 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{ex.nome}</p>
        <p className="truncate text-sm text-tx2">
          {ex.primarios.map((m) => MUSCULO_PT[m]).join(', ')} · {ex.equipamentoPt}
        </p>
        <div className="mt-0.5 flex gap-1.5 text-[0.7rem]">
          {ex.noPlano && <span className="rounded bg-amber/15 px-1.5 py-0.5 font-semibold text-amber">MEU PLANO</span>}
          {!ex.traduzido && <span className="rounded bg-s3 px-1.5 py-0.5 text-tx2">EN</span>}
        </div>
      </div>
      {direita ?? <Icone nome="seta" size={20} className="shrink-0 text-tx2" />}
    </button>
  )
}

/** Lista com renderização incremental (rápida mesmo com ~900 itens) */
export function ListaIncremental({ itens, render }: { itens: Exercicio[]; render: (e: Exercicio) => React.ReactNode }) {
  const [n, setN] = useState(40)
  const sentinela = useRef<HTMLDivElement>(null)
  useEffect(() => setN(40), [itens])
  useEffect(() => {
    const el = sentinela.current
    if (!el) return
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setN((x) => x + 40), { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
  }, [itens])
  return (
    <ul className="space-y-2">
      {itens.slice(0, n).map((e) => <li key={e.id}>{render(e)}</li>)}
      {n < itens.length && <div ref={sentinela} className="h-10" />}
    </ul>
  )
}

export function EsqueletoLista() {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => <Esqueleto key={i} className={cx('h-20')} />)}
    </div>
  )
}

export function useListaFiltrada(lista: Exercicio[] | null, f: Filtros) {
  return useMemo(() => (lista ? filtrar(lista, f) : null), [lista, f])
}
