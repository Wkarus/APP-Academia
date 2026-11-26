import Dexie, { type EntityTable } from 'dexie'
import type { Agua, Ajustes, Escolha, Foto, Medida, Refeicao, Rotina, Sessao } from './types'
import { segundaDaSemana, hojeISO } from './datas'
import { SUP_B_V1 } from '../content/plano'

class ForjaDB extends Dexie {
  ajustes!: EntityTable<Ajustes, 'id'>
  rotinas!: EntityTable<Rotina, 'id'>
  sessoes!: EntityTable<Sessao, 'id'>
  medidas!: EntityTable<Medida, 'id'>
  fotos!: EntityTable<Foto, 'id'>
  refeicoes!: EntityTable<Refeicao, 'id'>
  agua!: EntityTable<Agua, 'data'>
  escolhas!: EntityTable<Escolha, 'chave'>

  constructor() {
    super('forja')
    this.version(1).stores({
      ajustes: 'id',
      rotinas: 'id, ordem, programaId',
      sessoes: 'id, inicio, rotinaId',
      medidas: '++id, data',
      fotos: '++id, data',
      refeicoes: '++id, data',
      agua: 'data',
    })
    this.version(2).stores({ escolhas: 'chave, data' })
  }
}

export const db = new ForjaDB()

export const AJUSTES_PADRAO: Ajustes = {
  id: 'app',
  nome: '',
  fonteGrande: false,
  menosMovimento: false,
  modoCuidado: false,
  semPeixe: true,
  onboarding: false,
  inicioPlano: segundaDaSemana(hojeISO()),
  metaKcal: 2300,
  metaProteina: 165,
  metaAguaMl: 3000,
  horarioTreino: '09:00',
  vibrar: true,
  telaLigada: true,
  naoCurto: [],
}

export async function garantirDadosIniciais(rotinasPlano: Rotina[]) {
  await db.transaction('rw', db.ajustes, db.rotinas, async () => {
    const a = await db.ajustes.get('app')
    if (!a) await db.ajustes.put(AJUSTES_PADRAO)
    const n = await db.rotinas.count()
    if (n === 0) await db.rotinas.bulkPut(rotinasPlano)
    // Atualiza o Superior B para a versão nova se ainda estiver igual ao original
    const b = await db.rotinas.get('plano-sup-b')
    const novoB = rotinasPlano.find((r) => r.id === 'plano-sup-b')
    if (b && novoB && b.itens.map((i) => i.exId).join('|') === SUP_B_V1.join('|')) {
      await db.rotinas.put({ ...b, itens: novoB.itens, subtitulo: novoB.subtitulo })
    }
  })
}

export async function exportarTudo() {
  const [ajustes, rotinas, sessoes, medidas, refeicoes, agua, fotos, escolhas] = await Promise.all([
    db.ajustes.toArray(), db.rotinas.toArray(), db.sessoes.toArray(), db.medidas.toArray(),
    db.refeicoes.toArray(), db.agua.toArray(), db.fotos.toArray(), db.escolhas.toArray(),
  ])
  const fotosB64 = await Promise.all(
    fotos.map(async (f) => ({ ...f, blob: await blobParaDataUrl(f.blob) })),
  )
  return { app: 'forja', versao: 1, exportadoEm: new Date().toISOString(), ajustes, rotinas, sessoes, medidas, refeicoes, agua, escolhas, fotos: fotosB64 }
}

export async function importarTudo(json: unknown) {
  const d = json as Record<string, unknown[]> & { app?: string }
  if (!d || d.app !== 'forja') throw new Error('Arquivo não é um backup do FORJA.')
  const fotos = await Promise.all(
    ((d.fotos ?? []) as (Foto & { blob: string })[]).map(async (f) => ({ ...f, blob: await (await fetch(f.blob)).blob() })),
  )
  await db.transaction('rw', [db.ajustes, db.rotinas, db.sessoes, db.medidas, db.refeicoes, db.agua, db.fotos, db.escolhas], async () => {
    await Promise.all([db.ajustes.clear(), db.rotinas.clear(), db.sessoes.clear(), db.medidas.clear(), db.refeicoes.clear(), db.agua.clear(), db.fotos.clear(), db.escolhas.clear()])
    await db.ajustes.bulkPut((d.ajustes ?? []) as Ajustes[])
    await db.rotinas.bulkPut((d.rotinas ?? []) as Rotina[])
    await db.sessoes.bulkPut((d.sessoes ?? []) as Sessao[])
    await db.medidas.bulkPut((d.medidas ?? []) as Medida[])
    await db.refeicoes.bulkPut((d.refeicoes ?? []) as Refeicao[])
    await db.agua.bulkPut((d.agua ?? []) as Agua[])
    await db.fotos.bulkPut(fotos as Foto[])
    await db.escolhas.bulkPut((d.escolhas ?? []) as Escolha[])
  })
}

function blobParaDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(b)
  })
}
