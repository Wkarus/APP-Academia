import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from './db'
import type { ItemRotina, Rotina, SerieFeita, Sessao } from './types'
import { seriesDaSemana } from '../content/plano'

export interface ItemAtivo extends ItemRotina { seriesAlvo: number }

export interface SessaoAtiva {
  id: string
  rotinaId: string | null
  nome: string
  tipo: Rotina['tipo']
  inicio: number
  itens: ItemAtivo[]
  series: SerieFeita[]
  idx: number
  ultimaAgua: number
}

interface Estado {
  ativa: SessaoAtiva | null
  descanso: { fim: number; total: number } | null
  iniciar: (rotina: Rotina, semana: number) => void
  iniciarLivre: () => void
  setIdx: (i: number) => void
  atualizarSerie: (exId: string, idx: number, p: Partial<SerieFeita>) => void
  adicionarSerie: (exId: string) => void
  removerSerie: (exId: string) => void
  adicionarExercicio: (exId: string) => void
  trocarExercicio: (deId: string, paraId: string) => void
  iniciarDescanso: (seg: number) => void
  ajustarDescanso: (delta: number) => void
  pararDescanso: () => void
  marcarAgua: () => void
  finalizar: () => Promise<Sessao | null>
  descartar: () => void
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

function seriesIniciais(itens: ItemAtivo[]): SerieFeita[] {
  return itens.flatMap((it) => Array.from({ length: it.seriesAlvo }, (_, i) => ({ exId: it.exId, idx: i, kg: null, reps: null, feita: false })))
}

export const useTreino = create<Estado>()(
  persist(
    (set, get) => ({
      ativa: null,
      descanso: null,
      iniciar: (rotina, semana) => {
        const itens = rotina.itens.map((it) => ({ ...it, seriesAlvo: seriesDaSemana(it, rotina, semana) }))
        set({
          ativa: { id: uid(), rotinaId: rotina.id, nome: rotina.nome, tipo: rotina.tipo, inicio: Date.now(), itens, series: seriesIniciais(itens), idx: 0, ultimaAgua: Date.now() },
          descanso: null,
        })
      },
      iniciarLivre: () =>
        set({ ativa: { id: uid(), rotinaId: null, nome: 'Treino livre', tipo: 'forca', inicio: Date.now(), itens: [], series: [], idx: 0, ultimaAgua: Date.now() }, descanso: null }),
      setIdx: (i) => set((s) => (s.ativa ? { ativa: { ...s.ativa, idx: i } } : s)),
      atualizarSerie: (exId, idx, p) =>
        set((s) => {
          if (!s.ativa) return s
          return { ativa: { ...s.ativa, series: s.ativa.series.map((x) => (x.exId === exId && x.idx === idx ? { ...x, ...p } : x)) } }
        }),
      adicionarSerie: (exId) =>
        set((s) => {
          if (!s.ativa) return s
          const n = s.ativa.series.filter((x) => x.exId === exId).length
          const series = [...s.ativa.series]
          let pos = -1
          series.forEach((x, i) => { if (x.exId === exId) pos = i })
          series.splice(pos + 1, 0, { exId, idx: n, kg: null, reps: null, feita: false })
          return { ativa: { ...s.ativa, series } }
        }),
      removerSerie: (exId) =>
        set((s) => {
          if (!s.ativa) return s
          const doEx = s.ativa.series.filter((x) => x.exId === exId)
          if (doEx.length <= 1) return s
          const ultima = doEx[doEx.length - 1]
          return { ativa: { ...s.ativa, series: s.ativa.series.filter((x) => x !== ultima) } }
        }),
      adicionarExercicio: (exId) =>
        set((s) => {
          if (!s.ativa) return s
          const it: ItemAtivo = { exId, series: 3, seriesAlvo: 3, repMin: 8, repMax: 12, descansoSeg: 90 }
          return {
            ativa: {
              ...s.ativa,
              itens: [...s.ativa.itens, it],
              series: [...s.ativa.series, ...seriesIniciais([it])],
              idx: s.ativa.itens.length,
            },
          }
        }),
      trocarExercicio: (deId, paraId) =>
        set((s) => {
          if (!s.ativa) return s
          return {
            ativa: {
              ...s.ativa,
              itens: s.ativa.itens.map((i) => (i.exId === deId ? { ...i, exId: paraId } : i)),
              series: s.ativa.series.map((x) => (x.exId === deId ? { ...x, exId: paraId, kg: null, reps: null, feita: false } : x)),
            },
          }
        }),
      iniciarDescanso: (seg) => set({ descanso: { fim: Date.now() + seg * 1000, total: seg } }),
      ajustarDescanso: (delta) =>
        set((s) => (s.descanso ? { descanso: { fim: Math.max(Date.now(), s.descanso.fim + delta * 1000), total: Math.max(5, s.descanso.total + delta) } } : s)),
      pararDescanso: () => set({ descanso: null }),
      marcarAgua: () => set((s) => (s.ativa ? { ativa: { ...s.ativa, ultimaAgua: Date.now() } } : s)),
      finalizar: async () => {
        const a = get().ativa
        if (!a) return null
        const feitas = a.series.filter((x) => x.feita)
        const sessao: Sessao = {
          id: a.id,
          rotinaId: a.rotinaId,
          nome: a.nome,
          inicio: a.inicio,
          fim: Date.now(),
          series: feitas,
          cardioMin: a.tipo === 'cardio' ? feitas.reduce((t, x) => t + (x.reps ?? 0), 0) : undefined,
        }
        if (feitas.length) await db.sessoes.put(sessao)
        set({ ativa: null, descanso: null })
        return feitas.length ? sessao : null
      },
      descartar: () => set({ ativa: null, descanso: null }),
    }),
    { name: 'forja-treino-ativo' },
  ),
)

// ---------- Histórico e recordes ----------
export const e1rm = (kg: number, reps: number) => (reps <= 1 ? kg : kg * (1 + reps / 30))

export async function historicoExercicio(exId: string, limite = 20) {
  const sessoes = await db.sessoes.orderBy('inicio').reverse().toArray()
  return sessoes
    .filter((s) => s.series.some((x) => x.exId === exId))
    .slice(0, limite)
    .map((s) => ({ id: s.id, data: s.inicio, nome: s.nome, series: s.series.filter((x) => x.exId === exId) }))
}

export async function melhorE1RM(exId: string, antesDe?: string) {
  const sessoes = await db.sessoes.toArray()
  let melhor = 0
  let tem = false
  for (const s of sessoes) {
    if (s.id === antesDe) continue
    for (const x of s.series) {
      if (x.exId === exId && x.kg && x.reps) {
        tem = true
        melhor = Math.max(melhor, e1rm(x.kg, x.reps))
      }
    }
  }
  return { melhor, tem }
}

/** Sugestão de carga: se na última vez todas as séries chegaram ao topo da faixa */
export function sugerirAumento(series: SerieFeita[], repMax: number, equipamento: string) {
  const v = series.filter((x) => x.kg != null && x.reps != null)
  if (!v.length || repMax <= 0) return null
  if (!v.every((x) => (x.reps ?? 0) >= repMax)) return null
  const kg = Math.max(...v.map((x) => x.kg ?? 0))
  const passo = equipamento === 'barbell' ? 2.5 : equipamento === 'dumbbell' ? 2 : equipamento === 'body only' ? 0 : 2.5
  if (passo === 0) return { kg: null, texto: 'Você bateu o topo das repetições em todas as séries. Avance para uma variação mais difícil ou adicione carga.' }
  return { kg: kg + passo, texto: `Você bateu o topo das repetições em todas as séries. Suba para ${String(kg + passo).replace('.', ',')} kg.` }
}
