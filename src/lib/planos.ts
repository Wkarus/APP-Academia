import { db } from './db'
import type { Programa } from '../content/programas'
import type { Rotina } from './types'

/** Dias sugeridos por frequência semanal (0 = domingo) */
const DIAS_POR_FREQ: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
}

/** Monta as rotinas do programa já com os dias da semana distribuídos */
export function rotinasDoPrograma(p: Programa): Rotina[] {
  const dias = DIAS_POR_FREQ[p.dias] ?? DIAS_POR_FREQ[3]
  const rot: Rotina[] = p.rotinas.map((r, i) => ({
    id: `${p.id}-${i}`, nome: `${p.nome}: ${r.nome}`, dias: [], tipo: 'forca', itens: r.itens, programaId: p.id, ordem: 200 + i,
  }))
  dias.forEach((d, j) => rot[j % rot.length].dias.push(d))
  return rot
}

/** Troca o plano da semana para um programa pronto (o Meu plano fica guardado) */
export async function ativarPrograma(p: Programa) {
  const novas = rotinasDoPrograma(p)
  await db.transaction('rw', db.rotinas, db.ajustes, async () => {
    // mantém personalizações se o programa já tinha sido adicionado antes
    for (const r of novas) {
      const antiga = await db.rotinas.get(r.id)
      await db.rotinas.put(antiga ? { ...antiga, dias: r.dias } : r)
    }
    await db.ajustes.update('app', { planoAtivo: p.id })
  })
}

export async function voltarMeuPlano() {
  await db.ajustes.update('app', { planoAtivo: 'meu' })
}
