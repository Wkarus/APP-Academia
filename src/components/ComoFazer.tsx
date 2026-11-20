import { useEffect, useState } from 'react'
import type { Exercicio } from '../lib/types'
import { MUSCULO_PT, NIVEL_PT } from '../lib/exercicios'
import { historicoExercicio, e1rm } from '../lib/treino'
import { dataCurta } from '../lib/datas'
import { MidiaExercicio } from './MidiaExercicio'
import { MapaMuscular } from './MapaMuscular'
import { Abas, Aviso, Folha } from './ui'

type Aba = 'resumo' | 'instrucoes' | 'historico'

const ERROS_GERAIS = [
  'Usar impulso em vez de controlar o peso',
  'Amplitude incompleta',
  'Carga alta demais para manter a técnica',
  'Prender a respiração por muito tempo',
]

export function ConteudoExercicio({ ex, abaInicial = 'resumo' }: { ex: Exercicio; abaInicial?: Aba }) {
  const [aba, setAba] = useState<Aba>(abaInicial)
  return (
    <div>
      <Abas
        className="sticky top-0 z-10 mb-4"
        abas={[{ id: 'resumo', nome: 'Resumo' }, { id: 'instrucoes', nome: 'Instruções' }, { id: 'historico', nome: 'Histórico' }]}
        ativa={aba}
        onChange={setAba}
      />
      {aba === 'resumo' && <Resumo ex={ex} />}
      {aba === 'instrucoes' && <Instrucoes ex={ex} />}
      {aba === 'historico' && <Historico ex={ex} />}
    </div>
  )
}

function Resumo({ ex }: { ex: Exercicio }) {
  return (
    <div className="tela-enter space-y-4">
      <MidiaExercicio ex={ex} tamanho="lg" className="aspect-[3/2] w-full" />
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-s2 px-3 py-1 text-tx2">{ex.equipamentoPt}</span>
        <span className="rounded-full bg-s2 px-3 py-1 text-tx2">{NIVEL_PT[ex.dificuldade]}</span>
        <span className="rounded-full bg-s2 px-3 py-1 text-tx2">{ex.categoria}</span>
        {ex.minhaAcademia && <span className="rounded-full bg-ok/15 px-3 py-1 text-ok">Tem na minha academia</span>}
      </div>
      <MapaMuscular primarios={ex.primarios} secundarios={ex.secundarios} />
      <p className="text-xs text-tx2">
        Mídia: {ex.fonte.nome} — {ex.licenca}. Nome original: {ex.nameEn}.
      </p>
    </div>
  )
}

function Instrucoes({ ex }: { ex: Exercicio }) {
  const erros = ex.erros.length ? ex.erros : ERROS_GERAIS
  return (
    <div className="tela-enter space-y-5">
      {ex.passosIdioma === 'en' && (
        <Aviso>Este exercício ainda não foi traduzido. Os passos estão no original em inglês; a animação e o mapa muscular ajudam a entender.</Aviso>
      )}
      <section>
        <h3 className="font-display mb-2 text-lg font-semibold">Passo a passo</h3>
        <ol className="space-y-3" lang={ex.passosIdioma === 'en' ? 'en' : 'pt-BR'}>
          {ex.passos.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber font-bold text-bg">{i + 1}</span>
              <span className="pt-1 leading-relaxed">{p}</span>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3 className="font-display mb-2 text-lg font-semibold">Erros comuns{!ex.erros.length && ' (gerais)'}</h3>
        <ul className="space-y-2">
          {erros.map((e) => (
            <li key={e} className="flex gap-2 rounded-xl bg-warn/10 p-3 text-sm"><span className="text-warn" aria-hidden>✕</span>{e}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="font-display mb-2 text-lg font-semibold">Respiração</h3>
        <p className="rounded-xl bg-s2 p-3 text-sm">
          {ex.respiracao ?? 'Solte o ar na fase de esforço (subir/empurrar/puxar) e inspire na fase de retorno. Não prenda o ar por muito tempo.'}
        </p>
      </section>
      <p className="text-sm text-tx2">Músculo principal: {ex.primarios.map((m) => MUSCULO_PT[m]).join(', ')}</p>
    </div>
  )
}

function Historico({ ex }: { ex: Exercicio }) {
  const [h, setH] = useState<Awaited<ReturnType<typeof historicoExercicio>> | null>(null)
  useEffect(() => {
    historicoExercicio(ex.id).then(setH)
  }, [ex.id])
  if (!h) return <div className="skel h-32" />
  if (!h.length) return <p className="py-8 text-center text-tx2">Nenhum registro ainda. Depois do primeiro treino suas cargas aparecem aqui.</p>
  let recorde = 0
  for (const s of h) for (const x of s.series) if (x.kg && x.reps) recorde = Math.max(recorde, e1rm(x.kg, x.reps))
  return (
    <div className="tela-enter space-y-3">
      <div className="rounded-2xl bg-amber/10 p-3 text-sm">
        Melhor 1RM estimado: <strong className="tnum text-amber">{recorde.toFixed(1).replace('.', ',')} kg</strong>
      </div>
      {h.map((s) => (
        <div key={s.id} className="rounded-2xl bg-s2 p-3">
          <div className="mb-2 flex justify-between text-sm text-tx2"><span>{s.nome}</span><span>{dataCurta(s.data)}</span></div>
          <div className="flex flex-wrap gap-2">
            {s.series.map((x, i) => (
              <span key={i} className="tnum rounded-lg bg-s1 px-2 py-1 text-sm">
                {x.kg != null ? `${String(x.kg).replace('.', ',')} kg × ` : ''}{x.reps ?? '-'}{x.recorde ? ' ★' : ''}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function FolhaComoFazer({ ex, aberta, onFechar }: { ex: Exercicio | null; aberta: boolean; onFechar: () => void }) {
  if (!ex) return null
  return (
    <Folha aberta={aberta} onFechar={onFechar} titulo={ex.nome} alta>
      <ConteudoExercicio ex={ex} />
    </Folha>
  )
}
