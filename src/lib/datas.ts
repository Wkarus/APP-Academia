export const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function hojeISO(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export function deISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function segundaDaSemana(iso: string) {
  const d = deISO(iso)
  const dow = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - dow)
  return hojeISO(d)
}

/** Semana do plano (1, 2, 3…) a partir da segunda-feira de início */
export function semanaDoPlano(inicioISO: string, hoje = hojeISO()) {
  const diff = deISO(segundaDaSemana(hoje)).getTime() - deISO(segundaDaSemana(inicioISO)).getTime()
  return Math.max(1, Math.floor(diff / (7 * 86400000)) + 1)
}

export function saudacao(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function dataCurta(ts: number | string) {
  const d = typeof ts === 'string' ? deISO(ts) : new Date(ts)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

export function duracao(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return h ? `${h}h${String(m).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`
}
