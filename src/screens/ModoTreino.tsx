import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTreino, e1rm, sugerirAumento, type ItemAtivo } from '../lib/treino'
import { useExercicios, exPorId, MUSCULO_PT } from '../lib/exercicios'
import { useAjustes, useAgora, useTelaLigada } from '../lib/hooks'
import { db } from '../lib/db'
import { duracao, semanaDoPlano } from '../lib/datas'
import { faseCorrida } from '../content/plano'
import { vibrar, confeteRecorde } from '../lib/efeitos'
import type { Exercicio, SerieFeita, Sessao } from '../lib/types'
import { LEMBRETE_AGUA_MIN, SINAIS_PARAR } from '../content/cuidado'
import { MidiaExercicio } from '../components/MidiaExercicio'
import { FolhaComoFazer } from '../components/ComoFazer'
import { Descanso } from '../components/Descanso'
import { Botao, BotaoIcone, Folha, Aviso, cx, Esqueleto } from '../components/ui'
import { Icone } from '../components/Icone'
import { SeletorExercicio } from '../components/SeletorExercicio'
import { somarAgua } from '../lib/consultas'

type Anteriores = Record<string, SerieFeita[]>

const fmt = (n: number | null | undefined) => (n == null ? '' : String(n).replace('.', ','))

export default function ModoTreino() {
  const nav = useNavigate()
  const ativa = useTreino((s) => s.ativa)
  const st = useTreino()
  const aj = useAjustes()
  const lista = useExercicios()
  const agora = useAgora(1000)
  const tela = useTelaLigada(!!ativa && aj.telaLigada)

  const [anteriores, setAnteriores] = useState<Anteriores>({})
  const [melhores, setMelhores] = useState<Record<string, number>>({})
  const [comoFazer, setComoFazer] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [sinais, setSinais] = useState(false)
  const [finalizar, setFinalizar] = useState(false)
  const [seletor, setSeletor] = useState<null | 'add' | 'trocar'>(null)
  const [resumo, setResumo] = useState<Sessao | null>(null)

  // Carrega séries anteriores e recordes de cada exercício
  const ids = ativa?.itens.map((i) => i.exId).join('|') ?? ''
  useEffect(() => {
    if (!ativa) return
    db.sessoes.orderBy('inicio').reverse().toArray().then((ss) => {
      const ant: Anteriores = {}
      const mel: Record<string, number> = {}
      for (const s of ss) {
        if (s.id === ativa.id) continue
        for (const x of s.series) {
          if (!ant[x.exId]) ant[x.exId] = s.series.filter((y) => y.exId === x.exId)
          if (x.kg && x.reps) mel[x.exId] = Math.max(mel[x.exId] ?? 0, e1rm(x.kg, x.reps))
        }
      }
      setAnteriores(ant)
      setMelhores(mel)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  // Lembrete de hidratação no modo cuidado
  const precisaAgua = !!ativa && aj.modoCuidado && agora - ativa.ultimaAgua > LEMBRETE_AGUA_MIN * 60000
  useEffect(() => {
    if (precisaAgua) vibrar([60, 60, 60])
  }, [precisaAgua])

  if (resumo) return <Resumo sessao={resumo} onFechar={() => nav('/')} />

  if (!ativa) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-3xl font-bold">Nenhum treino em andamento</p>
        <Botao onClick={() => nav('/')}>Voltar para Hoje</Botao>
        <Botao variante="secundario" onClick={() => st.iniciarLivre()}>Começar treino livre</Botao>
      </div>
    )
  }

  const item: ItemAtivo | undefined = ativa.itens[ativa.idx]
  const ex = item ? exPorId(item.exId) : null
  const seriesEx = item ? ativa.series.filter((s) => s.exId === item.exId) : []
  const feitas = ativa.series.filter((s) => s.feita).length
  const total = ativa.series.length
  const cardio = !!item?.minutos

  const marcar = (s: SerieFeita) => {
    if (!item || !ex) return
    if (s.feita) {
      st.atualizarSerie(s.exId, s.idx, { feita: false, recorde: false })
      return
    }
    const ant = anteriores[s.exId]?.[s.idx]
    const kg = s.kg ?? ant?.kg ?? null
    const reps = s.reps ?? (cardio ? item.minutos ?? null : ant?.reps ?? item.repMax ?? null)
    // recorde pessoal: maior 1RM estimado que todo o histórico (e que esta sessão)
    let recorde = false
    if (kg && reps && !cardio) {
      const est = e1rm(kg, reps)
      const sessaoMax = Math.max(0, ...ativa.series.filter((x) => x.exId === s.exId && x.feita && x.kg && x.reps).map((x) => e1rm(x.kg!, x.reps!)))
      const hist = melhores[s.exId]
      if (hist && est > hist && est > sessaoMax) recorde = true
    }
    st.atualizarSerie(s.exId, s.idx, { kg, reps, feita: true, ts: Date.now(), recorde })
    vibrar(recorde ? [30, 50, 30] : 15)
    if (recorde) confeteRecorde()
    if (!cardio && item.descansoSeg > 0) st.iniciarDescanso(item.descansoSeg)
  }

  const sugestaoAntes = item && ex && !cardio ? sugerirAumento(anteriores[item.exId] ?? [], item.repMax, ex.equipamento) : null
  const doneAll = seriesEx.length > 0 && seriesEx.every((s) => s.feita)
  const sugestaoAgora = item && ex && doneAll && !cardio ? sugerirAumento(seriesEx, item.repMax, ex.equipamento) : null

  const concluir = async () => {
    setFinalizar(false)
    const s = await st.finalizar()
    if (s) setResumo(s)
    else nav('/')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col bg-bg" style={{ paddingTop: 'var(--safe-t)' }}>
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line/60 bg-bg/95 px-3 py-2 backdrop-blur">
        <BotaoIcone icone="voltar" rotulo="Minimizar treino" onClick={() => nav('/')} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold leading-tight">{ativa.nome}</p>
          <p className="tnum flex items-center gap-1.5 truncate text-sm text-tx2">
            {duracao(agora - ativa.inicio)} · {feitas}/{total} séries
            {tela.suportado && aj.telaLigada && tela.ligada && (
              <span className="text-ok" title="Tela sempre ligada" aria-label="Tela sempre ligada"><Icone nome="sol" size={14} /></span>
            )}
          </p>
        </div>
        {aj.modoCuidado && <BotaoIcone icone="alerta" rotulo="Sinais para parar" className="text-warn" onClick={() => setSinais(true)} />}
        <Botao onClick={() => setFinalizar(true)} className="px-4">Finalizar</Botao>
      </header>

      {/* Barra de progresso */}
      <div className="h-1 bg-s2"><div className="h-full bg-amber transition-[width] duration-300" style={{ width: `${total ? (feitas / total) * 100 : 0}%` }} /></div>

      {/* Exercícios do treino */}
      <nav aria-label="Exercícios do treino" className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-3">
        {ativa.itens.map((it, i) => {
          const e = exPorId(it.exId)
          const ss = ativa.series.filter((s) => s.exId === it.exId)
          const ok = ss.length > 0 && ss.every((s) => s.feita)
          return (
            <button
              key={it.exId + i}
              onClick={() => st.setIdx(i)}
              aria-current={i === ativa.idx}
              className={cx('flex min-h-12 shrink-0 items-center gap-2 rounded-2xl border px-3 text-sm transition-colors duration-200', i === ativa.idx ? 'border-amber bg-amber/10 text-tx' : 'border-line bg-s1 text-tx2')}
            >
              <span className={cx('tnum flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold', ok ? 'bg-ok text-bg' : 'bg-s3')}>{ok ? '✓' : i + 1}</span>
              <span className="max-w-[9rem] truncate">{e?.nome ?? '…'}</span>
            </button>
          )
        })}
        <button onClick={() => setSeletor('add')} className="flex min-h-12 shrink-0 items-center gap-1 rounded-2xl border border-dashed border-line px-3 text-sm text-tx2">
          <Icone nome="mais" size={18} /> Exercício
        </button>
      </nav>

      <main className="flex-1 px-3 pb-40">
        {precisaAgua && (
          <Aviso className="mb-3">
            <div className="flex items-center justify-between gap-3">
              <span>Hora de beber água. Goles pequenos, e veja se o local está fresco.</span>
              <Botao className="shrink-0" onClick={() => { st.marcarAgua(); somarAgua(200) }}>Bebi</Botao>
            </div>
          </Aviso>
        )}

        {!item ? (
          <div className="py-10 text-center text-tx2">
            <p>Adicione um exercício para começar.</p>
            <Botao className="mt-4" icone="mais" onClick={() => setSeletor('add')}>Adicionar exercício</Botao>
          </div>
        ) : !ex ? (
          <Esqueleto className="h-64" />
        ) : (
          <ExercicioAtual
            key={item.exId}
            ex={ex}
            item={item}
            series={seriesEx}
            anteriores={anteriores[item.exId] ?? []}
            cardio={cardio}
            sugestaoAntes={sugestaoAntes?.texto}
            sugestaoAgora={sugestaoAgora?.texto}
            onMarcar={marcar}
            onComoFazer={() => setComoFazer(true)}
            onZoom={() => setZoom(true)}
            onTrocar={() => setSeletor('trocar')}
          />
        )}

        {item && (
          <div className="mt-4 flex gap-2">
            <Botao variante="secundario" className="flex-1" disabled={ativa.idx === 0} onClick={() => st.setIdx(ativa.idx - 1)} icone="voltar">Anterior</Botao>
            {ativa.idx < ativa.itens.length - 1 ? (
              <Botao className={cx('flex-1', !doneAll && 'bg-s2 text-tx border border-line')} onClick={() => st.setIdx(ativa.idx + 1)}>Próximo →</Botao>
            ) : (
              <Botao className="flex-1" onClick={() => setFinalizar(true)} icone="check">Finalizar</Botao>
            )}
          </div>
        )}
      </main>

      <Descanso />

      <FolhaComoFazer ex={ex} aberta={comoFazer} onFechar={() => setComoFazer(false)} />

      {zoom && ex && (
        <div className="fade fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`Animação ampliada: ${ex.nome}`} onClick={() => setZoom(false)}>
          <MidiaExercicio ex={ex} tamanho="lg" className="aspect-[3/2] w-full max-w-xl" />
          <p className="mt-4 font-display text-2xl font-bold">{ex.nome}</p>
          <Botao variante="secundario" className="mt-6" icone="x" onClick={() => setZoom(false)}>Fechar</Botao>
        </div>
      )}

      <Folha aberta={sinais} onFechar={() => setSinais(false)} titulo="Sinais para parar">
        <ul className="space-y-2">
          {SINAIS_PARAR.map((s) => (
            <li key={s.titulo} className="rounded-2xl bg-warn/10 p-3">
              <p className="font-semibold text-warn">{s.titulo}</p>
              <p className="text-sm text-tx2">{s.detalhe}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">Se algum aparecer: pare, sente-se em local fresco, beba água e avise alguém. Se não passar em poucos minutos ou for intenso, procure atendimento (SAMU 192).</p>
        <Botao variante="perigo" className="mt-4 w-full" onClick={() => { setSinais(false); setFinalizar(true) }}>Encerrar treino agora</Botao>
      </Folha>

      <Folha aberta={finalizar} onFechar={() => setFinalizar(false)} titulo="Finalizar treino?">
        <p className="text-tx2">{feitas} de {total} séries concluídas em {duracao(agora - ativa.inicio)}.</p>
        <div className="mt-4 flex flex-col gap-2">
          <Botao grande onClick={concluir} icone="check">Salvar treino</Botao>
          <Botao variante="secundario" onClick={() => setFinalizar(false)}>Continuar treinando</Botao>
          <Botao variante="perigo" onClick={() => { if (confirm('Descartar este treino? As séries não serão salvas.')) { st.descartar(); nav('/') } }}>Descartar</Botao>
        </div>
      </Folha>

      {seletor && (
        <SeletorExercicio
          titulo={seletor === 'add' ? 'Adicionar exercício' : 'Trocar exercício'}
          musculo={seletor === 'trocar' ? ex?.primarios[0] : undefined}
          onFechar={() => setSeletor(null)}
          onEscolher={(id) => {
            if (seletor === 'add') st.adicionarExercicio(id)
            else if (item) st.trocarExercicio(item.exId, id)
            setSeletor(null)
          }}
          lista={lista ?? []}
        />
      )}
    </div>
  )
}

function ExercicioAtual(p: {
  ex: Exercicio
  item: ItemAtivo
  series: SerieFeita[]
  anteriores: SerieFeita[]
  cardio: boolean
  sugestaoAntes?: string
  sugestaoAgora?: string
  onMarcar: (s: SerieFeita) => void
  onComoFazer: () => void
  onZoom: () => void
  onTrocar: () => void
}) {
  const aj = useAjustes()
  const st = useTreino()
  const { ex, item, series, anteriores, cardio } = p
  return (
    <section aria-label={ex.nome}>
      <div className="flex gap-3">
        <MidiaExercicio ex={ex} className="aspect-square w-32 shrink-0" onClick={p.onZoom} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[1.7rem] font-bold leading-tight">{ex.nome}</h2>
          <p className="text-sm text-tx2">
            <span className="text-amber">{ex.primarios.map((m) => MUSCULO_PT[m]).join(', ')}</span>
            {ex.secundarios.length > 0 && <> · {ex.secundarios.slice(0, 3).map((m) => MUSCULO_PT[m]).join(', ')}</>}
          </p>
          <p className="tnum mt-1 text-sm text-tx2">
            {cardio && item.nota === 'fase-corrida' ? `${faseCorrida(semanaDoPlano(aj.inicioPlano))} · ritmo de conversa` : cardio ? `Meta: ${item.minutos ?? 25} min moderado` : `Meta: ${item.repMin}-${item.repMax} ${item.unidade === 'seg' ? 'segundos' : 'reps'}${item.nota ? ` ${item.nota}` : ''} · descanso ${Math.floor(item.descansoSeg / 60)}:${String(item.descansoSeg % 60).padStart(2, '0')}`}
          </p>
          <div className="mt-2 flex gap-2">
            <Botao variante="secundario" className="min-h-11 flex-1 px-3 text-sm" icone="livro" onClick={p.onComoFazer}>Como fazer</Botao>
            <BotaoIcone icone="trocar" rotulo="Trocar exercício" onClick={p.onTrocar} className="h-11 w-11" />
          </div>
        </div>
      </div>

      {p.sugestaoAntes && !p.sugestaoAgora && (
        <Aviso tipo="ok" className="mt-3"><strong>Hora de progredir.</strong> Na última vez: {p.sugestaoAntes.replace('Você bateu', 'você bateu')}</Aviso>
      )}
      {p.sugestaoAgora && (
        <Aviso tipo="ok" className="mt-3"><strong>Mandou bem!</strong> {p.sugestaoAgora.replace('Suba para', 'No próximo treino, suba para')}</Aviso>
      )}

      {/* Séries */}
      <div className="mt-4 rounded-[20px] bg-s1 p-2">
        <div className="grid grid-cols-[2.25rem_1fr_4.5rem_4.5rem_3.25rem] items-center gap-2 px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-tx2">
          <span className="text-center">Série</span>
          <span>Anterior</span>
          <span className="text-center">{cardio || item.unidade === 'seg' ? '—' : 'kg'}</span>
          <span className="text-center">{cardio ? 'min' : item.unidade === 'seg' ? 'seg' : 'reps'}</span>
          <span className="text-center">✓</span>
        </div>
        {series.map((s) => {
          const ant = anteriores[s.idx]
          return (
            <div
              key={s.idx}
              className={cx('grid grid-cols-[2.25rem_1fr_4.5rem_4.5rem_3.25rem] items-center gap-2 rounded-2xl px-1 py-1.5 transition-colors duration-200', s.feita && 'bg-ok/10')}
            >
              <span className="tnum text-center font-display text-xl font-bold">{s.recorde ? <span className="text-amber" title="Recorde pessoal">★</span> : s.idx + 1}</span>
              <span className="tnum truncate text-sm text-tx2">{ant ? (cardio ? `${ant.reps} min` : `${fmt(ant.kg)} kg × ${ant.reps}`) : '—'}</span>
              {cardio || item.unidade === 'seg' ? (
                <span className="text-center text-tx2">—</span>
              ) : (
                <input
                  inputMode="decimal"
                  aria-label={`Carga da série ${s.idx + 1} em kg`}
                  placeholder={ant?.kg != null ? fmt(ant.kg) : 'kg'}
                  value={fmt(s.kg)}
                  onChange={(e) => {
                    const v = e.target.value.replace(',', '.')
                    st.atualizarSerie(s.exId, s.idx, { kg: v === '' ? null : Number(v) || 0 })
                  }}
                  className="tnum h-12 w-full rounded-xl bg-s2 text-center text-lg font-semibold text-tx placeholder:text-tx2/60"
                />
              )}
              <input
                inputMode="numeric"
                aria-label={`${cardio ? 'Minutos' : item.unidade === 'seg' ? 'Segundos' : 'Repetições'} da série ${s.idx + 1}`}
                placeholder={cardio ? String(item.minutos ?? 25) : ant?.reps != null ? String(ant.reps) : `${item.repMin}-${item.repMax}`}
                value={s.reps ?? ''}
                onChange={(e) => st.atualizarSerie(s.exId, s.idx, { reps: e.target.value === '' ? null : parseInt(e.target.value) || 0 })}
                className="tnum h-12 w-full rounded-xl bg-s2 text-center text-lg font-semibold text-tx placeholder:text-tx2/60"
              />
              <button
                onClick={() => p.onMarcar(s)}
                aria-label={s.feita ? `Desmarcar série ${s.idx + 1}` : `Marcar série ${s.idx + 1} como feita`}
                aria-pressed={s.feita}
                className={cx('flex h-12 w-full items-center justify-center rounded-xl transition-colors duration-200', s.feita ? 'check-pop bg-ok text-bg' : 'bg-s3 text-tx2')}
              >
                <Icone nome="check" size={24} strokeWidth={3} />
              </button>
            </div>
          )
        })}
        {!cardio && (
          <div className="mt-1 flex gap-2 px-1">
            <button onClick={() => st.adicionarSerie(item.exId)} className="min-h-11 flex-1 rounded-xl text-sm font-semibold text-amber">+ Série</button>
            <button onClick={() => st.removerSerie(item.exId)} disabled={series.length <= 1} className="min-h-11 flex-1 rounded-xl text-sm text-tx2 disabled:opacity-40">− Série</button>
          </div>
        )}
      </div>
      <p className="mt-2 px-1 text-xs text-tx2">Toque em ✓ com o campo vazio para repetir a carga anterior. Toque na animação para ampliar.</p>
    </section>
  )
}

function Resumo({ sessao, onFechar }: { sessao: Sessao; onFechar: () => void }) {
  const volume = useMemo(() => sessao.series.reduce((t, s) => t + (s.kg ?? 0) * (s.reps ?? 0), 0), [sessao])
  const recordes = sessao.series.filter((s) => s.recorde)
  return (
    <div className="tela-enter mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 p-6">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber text-bg"><Icone nome="trofeu" size={40} /></span>
      <h1 className="text-center font-display text-4xl font-bold">Treino concluído</h1>
      <p className="text-center text-tx2">{sessao.nome} · {duracao((sessao.fim ?? Date.now()) - sessao.inicio)}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-s1 p-3"><p className="tnum font-display text-3xl font-bold">{sessao.series.length}</p><p className="text-xs text-tx2">séries</p></div>
        <div className="rounded-2xl bg-s1 p-3"><p className="tnum font-display text-3xl font-bold">{Math.round(volume).toLocaleString('pt-BR')}</p><p className="text-xs text-tx2">kg de volume</p></div>
        <div className="rounded-2xl bg-s1 p-3"><p className="tnum font-display text-3xl font-bold text-amber">{recordes.length}</p><p className="text-xs text-tx2">recordes</p></div>
      </div>
      {recordes.length > 0 && (
        <ul className="space-y-1 text-sm">
          {recordes.map((r, i) => <li key={i} className="rounded-xl bg-amber/10 p-2">★ {exPorId(r.exId)?.nome}: {fmt(r.kg)} kg × {r.reps}</li>)}
        </ul>
      )}
      <Botao grande onClick={() => { onFechar(); setTimeout(() => (location.hash = '#/dieta'), 0) }} icone="prato">O que comer agora</Botao>
      <Botao grande variante="secundario" onClick={onFechar}>Voltar para Hoje</Botao>
    </div>
  )
}
