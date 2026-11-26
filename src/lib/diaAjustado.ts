/**
 * "Ajustar meu dia": quando o dia foge do plano (comeu tarde, treinou em outro horário),
 * remonta as próximas refeições dividindo o que falta da meta de calorias e proteína.
 *
 * Regras (simples e conservadoras):
 * - Refeições a cada ~3 h; a primeira não antes de ~2h30 depois da última refeição.
 * - Treino em menos de 1 h: só um pré-treino leve. Entre 1 h e 3 h: pré-treino leve.
 *   Mais de 3 h: refeição normal agora e pré-treino leve 1 h antes.
 * - Pós-treino em até ~1 h depois de terminar; se cair em horário de almoço/jantar, vira a refeição principal.
 * - A última refeição antes de dormir é a ceia (leve, rica em proteína).
 */
import type { Slot } from '../content/receitas'

export type TipoRefeicao = 'pre' | 'pos' | 'principal' | 'lanche' | 'ceia'

export interface ConfigDia {
  data: string
  treino: { tipo: 'vai' | 'feito' | 'nao'; hora: string; duracaoMin: number }
  dormir: string
  ultimaRefeicao: string | null
}

export interface RefeicaoAjustada {
  horario: string
  tipo: TipoRefeicao
  nome: string
  kcal: number
  proteina: number
  dica: string
  slots: Slot[]
}

export const toMin = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m }
export const toHM = (min: number) => {
  const m = Math.max(0, Math.min(23 * 60 + 45, Math.ceil(min / 15) * 15))
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

const PESO_KCAL: Record<TipoRefeicao, number> = { pre: 0.55, pos: 1.4, principal: 1.35, lanche: 0.75, ceia: 0.6 }
const PESO_PROT: Record<TipoRefeicao, number> = { pre: 0.7, pos: 1.4, principal: 1.25, lanche: 0.8, ceia: 1 }

const horaDeRefeicaoPrincipal = (min: number) => (min >= 11 * 60 + 15 && min <= 15 * 60) || (min >= 18 * 60 + 30 && min <= 21 * 60 + 30)
const ehAlmoco = (min: number) => min < 17 * 60

function rotulo(tipo: TipoRefeicao, min: number): { nome: string; dica: string; slots: Slot[] } {
  switch (tipo) {
    case 'pre':
      return { nome: 'Pré-treino leve', dica: 'Algo leve e rápido de digerir, 30-60 min antes. Nada pesado ou gorduroso.', slots: ['pre'] }
    case 'pos':
      return horaDeRefeicaoPrincipal(min) || min >= 15 * 60
        ? { nome: ehAlmoco(min) ? 'Pós-treino = almoço' : 'Pós-treino = jantar', dica: 'Refeição de verdade com bastante proteína. Sem fome de prato? Whey + um lanche resolve.', slots: ['pos', ehAlmoco(min) ? 'almoco' : 'jantar'] }
        : { nome: 'Pós-treino', dica: 'Proteína + carboidrato em até 1-2 h depois do treino.', slots: ['pos'] }
    case 'principal':
      return { nome: ehAlmoco(min) ? 'Almoço' : 'Jantar', dica: 'Prato completo: proteína, arroz/batata, feijão e salada.', slots: [ehAlmoco(min) ? 'almoco' : 'jantar'] }
    case 'lanche':
      return { nome: 'Lanche', dica: 'Algo prático com proteína para não chegar com fome na próxima.', slots: ['lanche'] }
    case 'ceia':
      return { nome: 'Ceia', dica: 'Leve e com proteína (iogurte, ovos, queijo).', slots: ['ceia'] }
  }
}

export function planejarDia(cfg: ConfigDia, agoraHM: string, faltam: { kcal: number; proteina: number }): RefeicaoAjustada[] {
  const agora = toMin(agoraHM)
  const dormir = Math.max(toMin(cfg.dormir), agora + 60)
  const limite = dormir - 45 // última refeição até 45 min antes de dormir
  const ultima = cfg.ultimaRefeicao ? toMin(cfg.ultimaRefeicao) : null
  const podeComerEm = ultima != null ? Math.max(agora, ultima + 150) : agora
  const eventos: { min: number; tipo: TipoRefeicao }[] = []

  let cursor = podeComerEm
  const t = cfg.treino
  if (t.tipo === 'vai') {
    const ini = toMin(t.hora)
    const fim = ini + t.duracaoMin
    const ate = ini - agora
    if (ate >= 180 && podeComerEm <= ini - 150) {
      eventos.push({ min: podeComerEm, tipo: horaDeRefeicaoPrincipal(podeComerEm) ? 'principal' : 'lanche' })
      // refeições no meio, se sobrar tempo até o pré-treino
      let c = podeComerEm
      while (c + 165 <= ini - 60 - 90) {
        c += 165
        eventos.push({ min: c, tipo: horaDeRefeicaoPrincipal(c) ? 'principal' : 'lanche' })
      }
      eventos.push({ min: ini - 60, tipo: 'pre' })
    } else if (ate > 15) {
      eventos.push({ min: Math.max(agora, Math.min(ini - 45, podeComerEm)), tipo: 'pre' })
    }
    cursor = fim + 30
    eventos.push({ min: cursor, tipo: 'pos' })
  } else if (t.tipo === 'feito') {
    const fim = toMin(t.hora) + t.duracaoMin
    cursor = Math.max(agora, Math.min(fim + 30, Math.max(agora, fim)))
    if (agora - fim < 150) eventos.push({ min: cursor, tipo: 'pos' })
    else eventos.push({ min: podeComerEm, tipo: horaDeRefeicaoPrincipal(podeComerEm) ? 'principal' : 'lanche' })
    cursor = eventos[eventos.length - 1].min
  } else {
    eventos.push({ min: podeComerEm, tipo: horaDeRefeicaoPrincipal(podeComerEm) || podeComerEm >= 18 * 60 ? 'principal' : 'lanche' })
    cursor = podeComerEm
  }

  // Preenche o resto do dia a cada ~2h45
  const principalRecente = (min: number) => eventos.some((e) => (e.tipo === 'principal' || e.tipo === 'pos') && min - e.min < 240)
  while (cursor + 120 <= limite) {
    cursor = Math.min(cursor + 165, limite)
    const tipo: TipoRefeicao = horaDeRefeicaoPrincipal(cursor) && !principalRecente(cursor) ? 'principal' : cursor >= 21 * 60 ? 'ceia' : 'lanche'
    eventos.push({ min: cursor, tipo })
  }
  // Última refeição tarde (que não seja prato principal) vira ceia
  const ultimaEv = eventos[eventos.length - 1]
  if (eventos.length > 1 && ultimaEv.min >= 20 * 60 + 30 && ultimaEv.tipo === 'lanche') ultimaEv.tipo = 'ceia'
  if (!eventos.some((e) => e.tipo === 'principal' || e.tipo === 'pos')) {
    const meio = eventos.find((e) => e.tipo === 'lanche')
    if (meio) meio.tipo = 'principal'
  }

  const evs = eventos.filter((e) => e.min <= dormir).sort((a, b) => a.min - b.min)
  const somaK = evs.reduce((s, e) => s + PESO_KCAL[e.tipo], 0) || 1
  const somaP = evs.reduce((s, e) => s + PESO_PROT[e.tipo], 0) || 1
  const kcal = Math.max(0, faltam.kcal)
  const prot = Math.max(0, faltam.proteina)

  return evs.map((e) => {
    const r = rotulo(e.tipo, e.min)
    let k = Math.round((kcal * PESO_KCAL[e.tipo]) / somaK / 10) * 10
    // limites para não forçar refeições enormes num dia atípico
    k = Math.min(k, e.tipo === 'pre' ? 300 : e.tipo === 'ceia' ? 450 : e.tipo === 'lanche' ? 550 : 900)
    return {
      horario: toHM(e.min),
      tipo: e.tipo,
      nome: r.nome,
      kcal: k,
      proteina: Math.min(e.tipo === 'pre' ? 30 : 60, Math.round((prot * PESO_PROT[e.tipo]) / somaP)),
      dica: r.dica,
      slots: r.slots,
    }
  })
}

// ---------- Guardar o dia ajustado (por aparelho, por data) ----------
const chave = (data: string) => `forja-dia-${data}`

export interface DiaSalvo { cfg: ConfigDia; refeicoes: RefeicaoAjustada[]; criadoEm: number; faltavaKcal?: number }

export function lerDia(data: string): DiaSalvo | null {
  try {
    const s = localStorage.getItem(chave(data))
    return s ? (JSON.parse(s) as DiaSalvo) : null
  } catch {
    return null
  }
}
export function salvarDia(d: DiaSalvo) {
  try { localStorage.setItem(chave(d.cfg.data), JSON.stringify(d)) } catch { /* ok */ }
  dispatchEvent(new Event('forja-dia'))
}
export function apagarDia(data: string) {
  try { localStorage.removeItem(chave(data)) } catch { /* ok */ }
  dispatchEvent(new Event('forja-dia'))
}
