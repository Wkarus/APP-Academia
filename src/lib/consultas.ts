import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { hojeISO, deISO } from './datas'
import type { Rotina, Sessao } from './types'

export function useRotinas() {
  return useLiveQuery(() => db.rotinas.orderBy('ordem').toArray(), []) ?? null
}

export function useSessoes() {
  return useLiveQuery(() => db.sessoes.orderBy('inicio').reverse().toArray(), []) ?? null
}

/**
 * Rotinas que valem para a agenda da semana.
 * Com o "Meu plano" ativo: as rotinas do plano. Com um programa ativo: as dele + o cardio do Meu plano.
 */
export function rotinasDoPlano(rotinas: Rotina[], planoAtivo = 'meu') {
  if (planoAtivo === 'meu') return rotinas.filter((r) => !r.programaId)
  return rotinas.filter((r) => r.programaId === planoAtivo || (!r.programaId && r.tipo === 'cardio'))
}

/** Rotina do dia da semana conforme o plano ativo (força tem prioridade sobre cardio) */
export function rotinaDoDia(rotinas: Rotina[], planoAtivo = 'meu', dow = new Date().getDay()) {
  const doDia = rotinasDoPlano(rotinas, planoAtivo).filter((r) => r.dias.includes(dow))
  return doDia.find((r) => r.tipo === 'forca') ?? doDia[0] ?? null
}

export function diasTreinados(sessoes: Sessao[]) {
  return new Set(sessoes.map((s) => hojeISO(new Date(s.inicio))))
}

/**
 * Sequência: dias planejados cumpridos em seguida (dias de descanso não quebram).
 * Hoje só conta se já treinou; se hoje é dia de treino e ainda não treinou, não quebra.
 */
export function sequencia(sessoes: Sessao[], rotinas: Rotina[], planoAtivo = 'meu') {
  const feitos = diasTreinados(sessoes)
  const planejados = new Set(rotinasDoPlano(rotinas, planoAtivo).flatMap((r) => r.dias))
  let n = 0
  const d = new Date()
  for (let i = 0; i < 400; i++) {
    const iso = hojeISO(d)
    const dow = d.getDay()
    if (feitos.has(iso)) n++
    else if (planejados.has(dow) && i > 0) break
    d.setDate(d.getDate() - 1)
  }
  return n
}

export function semanaAtual() {
  const hoje = new Date()
  const dow = (hoje.getDay() + 6) % 7
  const seg = new Date(hoje)
  seg.setDate(hoje.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg)
    d.setDate(seg.getDate() + i)
    return { iso: hojeISO(d), dow: d.getDay(), hoje: hojeISO(d) === hojeISO() }
  })
}

export function useRefeicoesDia(data = hojeISO()) {
  return useLiveQuery(() => db.refeicoes.where('data').equals(data).toArray(), [data]) ?? []
}

export function useAguaDia(data = hojeISO()) {
  return useLiveQuery(() => db.agua.get(data), [data])?.ml ?? 0
}

export async function somarAgua(ml: number, data = hojeISO()) {
  const atual = (await db.agua.get(data))?.ml ?? 0
  await db.agua.put({ data, ml: Math.max(0, atual + ml) })
}

export function idadeDias(iso: string) {
  return Math.round((deISO(hojeISO()).getTime() - deISO(iso).getTime()) / 86400000)
}
