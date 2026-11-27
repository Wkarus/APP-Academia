/**
 * Refeições do dia por ESTADO (comi / pulei / falta), não pelo relógio.
 * O que falta da meta é redistribuído entre as refeições que ainda não aconteceram.
 */
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { useAjustes } from './hooks'
import { useRefeicoesDia } from './consultas'
import { PLANO_DIETA, totaisItens, type RefeicaoPlano } from '../content/dieta'
import type { Refeicao } from './types'
import type { Slot } from '../content/receitas'

export type StatusRefeicao = 'feita' | 'pulada' | 'falta'

export interface RefeicaoDoDia {
  plano: RefeicaoPlano
  slots: Slot[]
  registros: Refeicao[]
  status: StatusRefeicao
  /** meta original do plano */
  planoKcal: number
  planoProt: number
  /** meta ajustada pelo que já foi comido/pulado */
  alvoKcal: number
  alvoProt: number
}

/** Tipos de receita que combinam com cada refeição do plano (pela ordem do dia) */
const SLOTS: Slot[][] = [['cafe'], ['lanche', 'pos'], ['almoco'], ['lanche', 'pos'], ['jantar'], ['ceia']]

export const pertence = (r: Refeicao, p: RefeicaoPlano) =>
  r.planoHorario ? r.planoHorario === p.horario : r.horario === p.horario && r.nome.startsWith(p.nome)

export function calcularDia(refs: Refeicao[], meta: { kcal: number; proteina: number }) {
  const itens: RefeicaoDoDia[] = PLANO_DIETA.map((p, i) => {
    const registros = refs.filter((r) => pertence(r, p))
    const t = totaisItens(p.itens)
    const status: StatusRefeicao = registros.some((r) => !r.pulada) ? 'feita' : registros.some((r) => r.pulada) ? 'pulada' : 'falta'
    return { plano: p, slots: SLOTS[i] ?? ['lanche'], registros, status, planoKcal: t.kcal, planoProt: t.proteina, alvoKcal: 0, alvoProt: 0 }
  })
  const consumidoK = refs.filter((r) => !r.pulada).reduce((s, r) => s + r.kcal, 0)
  const consumidoP = refs.filter((r) => !r.pulada).reduce((s, r) => s + r.proteina, 0)
  const faltamK = Math.max(0, meta.kcal - consumidoK)
  const faltamP = Math.max(0, meta.proteina - consumidoP)
  const pend = itens.filter((x) => x.status === 'falta')
  const somaK = pend.reduce((s, x) => s + x.planoKcal, 0) || 1
  const somaP = pend.reduce((s, x) => s + x.planoProt, 0) || 1
  let limitado = false
  for (const x of pend) {
    const k = (faltamK * x.planoKcal) / somaK
    const p = (faltamP * x.planoProt) / somaP
    // não força refeições gigantes: no máximo ~1,6× o tamanho original (e 900 kcal)
    const tetoK = Math.min(900, x.planoKcal * 1.6)
    if (k > tetoK) limitado = true
    x.alvoKcal = Math.round(Math.min(k, tetoK) / 10) * 10
    x.alvoProt = Math.round(Math.min(p, Math.max(x.planoProt * 1.6, 45)))
  }
  const avulsas = refs.filter((r) => !r.pulada && !PLANO_DIETA.some((p) => pertence(r, p)))
  return { itens, proxima: pend[0] ?? null, faltamK, faltamP, consumidoK, consumidoP, avulsas, limitado }
}

export function useDiaRefeicoes() {
  const refs = useRefeicoesDia()
  const aj = useAjustes()
  return calcularDia(refs, { kcal: aj.metaKcal, proteina: aj.metaProteina })
}

/** Treinou nas últimas 3 horas? (para priorizar pós-treino) */
export function useTreinoRecente() {
  const ultima = useLiveQuery(() => db.sessoes.orderBy('inicio').last(), [])
  const fim = ultima?.fim ?? 0
  return fim && Date.now() - fim < 3 * 3600e3 ? fim : null
}
