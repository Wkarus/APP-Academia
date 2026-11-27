import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../lib/db'
import { exPorId, useExercicios } from '../lib/exercicios'
import { DIAS_CURTOS } from '../lib/datas'
import { PLANO } from '../content/plano'
import type { ItemRotina, Rotina } from '../lib/types'
import { Botao, BotaoIcone, Chip, Esqueleto, Interruptor } from '../components/ui'
import { MidiaExercicio } from '../components/MidiaExercicio'
import { SeletorExercicio } from '../components/SeletorExercicio'

function Num({ rotulo, valor, onChange, passo = 1, min = 0 }: { rotulo: string; valor: number; onChange: (n: number) => void; passo?: number; min?: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[0.7rem] uppercase text-tx2">{rotulo}</span>
      <div className="flex items-center">
        <button aria-label={`Diminuir ${rotulo}`} className="h-11 w-9 rounded-l-xl bg-s3 text-lg" onClick={() => onChange(Math.max(min, valor - passo))}>−</button>
        <span className="tnum flex h-11 w-10 items-center justify-center bg-s2 font-semibold">{valor}</span>
        <button aria-label={`Aumentar ${rotulo}`} className="h-11 w-9 rounded-r-xl bg-s3 text-lg" onClick={() => onChange(valor + passo)}>+</button>
      </div>
    </div>
  )
}

export default function EditarRotina() {
  const { id } = useParams()
  const nav = useNavigate()
  const lista = useExercicios()
  const [r, setR] = useState<Rotina | null>(null)
  const [seletor, setSeletor] = useState(false)

  useEffect(() => {
    if (id) db.rotinas.get(id).then((x) => setR(x ?? null))
  }, [id])

  if (!r) return <Esqueleto className="mt-6 h-64" />

  const salvar = async (n: Rotina) => {
    setR(n)
    await db.rotinas.put(n)
  }
  const setItem = (i: number, p: Partial<ItemRotina>) => salvar({ ...r, itens: r.itens.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const mover = (i: number, d: number) => {
    const itens = [...r.itens]
    const [x] = itens.splice(i, 1)
    itens.splice(Math.max(0, Math.min(itens.length, i + d)), 0, x)
    salvar({ ...r, itens })
  }
  const original = PLANO.find((p) => p.id === r.id)

  return (
    <div>
      <header className="flex items-center gap-3 pb-3 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav('/treinos')} />
        <h1 className="font-display text-2xl font-bold">Editar rotina</h1>
      </header>
      <label className="block">
        <span className="mb-1 block text-sm text-tx2">Nome</span>
        <input value={r.nome} onChange={(e) => salvar({ ...r, nome: e.target.value })} className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4 font-semibold" />
      </label>
      <p className="mb-2 mt-4 text-sm text-tx2">Dias da semana</p>
      <div className="flex flex-wrap gap-2">
        {DIAS_CURTOS.map((d, i) => (
          <Chip key={d} ativo={r.dias.includes(i)} onClick={() => salvar({ ...r, dias: r.dias.includes(i) ? r.dias.filter((x) => x !== i) : [...r.dias, i].sort() })}>{d}</Chip>
        ))}
      </div>
      {r.tipo === 'forca' && original && (
        <div className="mt-3 rounded-2xl bg-s1 px-3">
          <Interruptor ligado={!!r.progressaoPlano} onChange={(v) => salvar({ ...r, progressaoPlano: v })} rotulo="Séries automáticas do plano" descricao="Semanas 1-2: 2 séries · semana 3 em diante: 3 séries" />
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {r.itens.map((it, i) => {
          const ex = exPorId(it.exId)
          return (
            <li key={it.exId + i} className="rounded-[20px] bg-s1 p-3">
              <div className="flex items-center gap-3">
                {ex ? <MidiaExercicio ex={ex} tamanho="sm" className="h-14 w-14 shrink-0" /> : <Esqueleto className="h-14 w-14" />}
                <p className="min-w-0 flex-1 font-semibold leading-tight">{ex?.nome ?? it.exId}</p>
                <div className="flex gap-1">
                  <BotaoIcone icone="subir" rotulo="Mover para cima" onClick={() => mover(i, -1)} className="h-10 w-10" />
                  <BotaoIcone icone="baixar" rotulo="Mover para baixo" onClick={() => mover(i, 1)} className="h-10 w-10" />
                  <BotaoIcone icone="lixo" rotulo="Remover" onClick={() => salvar({ ...r, itens: r.itens.filter((_, j) => j !== i) })} className="h-10 w-10 text-warn" />
                </div>
              </div>
              {it.minutos != null ? (
                <div className="mt-3 flex justify-center"><Num rotulo="minutos" valor={it.minutos ?? 25} passo={5} onChange={(n) => setItem(i, { minutos: n })} /></div>
              ) : (
                <div className="mt-3 flex flex-wrap justify-between gap-2">
                  {!r.progressaoPlano && <Num rotulo="séries" valor={it.series} min={1} onChange={(n) => setItem(i, { series: n })} />}
                  <Num rotulo="reps mín" valor={it.repMin} min={1} onChange={(n) => setItem(i, { repMin: n })} />
                  <Num rotulo="reps máx" valor={it.repMax} min={1} onChange={(n) => setItem(i, { repMax: n })} />
                  <Num rotulo="descanso s" valor={it.descansoSeg} passo={15} onChange={(n) => setItem(i, { descansoSeg: n })} />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <Botao variante="secundario" icone="mais" className="mt-4 w-full" onClick={() => setSeletor(true)}>Adicionar exercício</Botao>

      <div className="mt-8 flex flex-col gap-2">
        {original && <Botao variante="secundario" onClick={() => confirm('Restaurar esta rotina como no plano original?') && salvar({ ...original })}>Restaurar original do plano</Botao>}
        <Botao variante="perigo" icone="lixo" onClick={async () => { if (confirm(`Excluir a rotina "${r.nome}"?`)) { await db.rotinas.delete(r.id); nav('/treinos') } }}>Excluir rotina</Botao>
      </div>

      {seletor && (
        <SeletorExercicio
          titulo="Adicionar exercício"
          lista={lista ?? []}
          onFechar={() => setSeletor(false)}
          onEscolher={(exId) => {
            salvar({ ...r, itens: [...r.itens, r.tipo === 'cardio' ? { exId, series: 1, repMin: 0, repMax: 0, descansoSeg: 0, minutos: 25 } : { exId, series: 3, repMin: 8, repMax: 12, descansoSeg: 90 }] })
            setSeletor(false)
          }}
        />
      )}
    </div>
  )
}
