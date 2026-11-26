import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAjustes, salvarAjustes } from '../lib/hooks'
import { useRotinas, useSessoes, rotinaDoDia, rotinasDoPlano, sequencia, semanaAtual, diasTreinados, useRefeicoesDia, useAguaDia, somarAgua } from '../lib/consultas'
import { useExercicios, exPorId } from '../lib/exercicios'
import { saudacao, semanaDoPlano, DIAS_CURTOS, DIAS } from '../lib/datas'
import { useTreino } from '../lib/treino'
import { seriesDaSemana } from '../content/plano'
import { PLANO_DIETA, totaisItens } from '../content/dieta'
import { DICAS_CALOR } from '../content/cuidado'
import { Card, Botao, Barra, Esqueleto, Secao, BotaoIcone, Aviso, cx } from '../components/ui'
import { Icone } from '../components/Icone'
import { MidiaExercicio } from '../components/MidiaExercicio'
import { Boasvindas } from '../components/Boasvindas'
import { ChecklistPreTreino } from '../components/ChecklistPreTreino'
import { db } from '../lib/db'
import { hojeISO } from '../lib/datas'
import { PosTreinoAgora } from '../components/Receitas'
import { useDiaAjustado, proximaAjustada } from '../components/DiaAjustado'

export default function Hoje() {
  const aj = useAjustes()
  const rotinas = useRotinas()
  const sessoes = useSessoes()
  useExercicios()
  const nav = useNavigate()
  const iniciar = useTreino((s) => s.iniciar)
  const ativa = useTreino((s) => s.ativa)
  const refeicoes = useRefeicoesDia()
  const agua = useAguaDia()
  const [checklist, setChecklist] = useState(false)

  const semana = semanaDoPlano(aj.inicioPlano)
  const plano = aj.planoAtivo ?? 'meu'
  const rotina = rotinas ? rotinaDoDia(rotinas, plano) : null
  const feitos = sessoes ? diasTreinados(sessoes) : new Set<string>()
  const treinouHoje = feitos.has(hojeISO())
  const seq = sessoes && rotinas ? sequencia(sessoes, rotinas, plano) : 0
  const kcal = refeicoes.reduce((t, r) => t + r.kcal, 0)
  const prot = refeicoes.reduce((t, r) => t + r.proteina, 0)
  const agoraHM = new Date().toTimeString().slice(0, 5)
  const proxima = PLANO_DIETA.find((r) => r.horario >= agoraHM && !refeicoes.some((x) => x.horario === r.horario)) ?? PLANO_DIETA.find((r) => !refeicoes.some((x) => x.horario === r.horario))
  const diaAj = useDiaAjustado()
  const proxAj = proximaAjustada(diaAj, refeicoes)
  const dica = DICAS_CALOR[new Date().getDate() % DICAS_CALOR.length]

  const comecar = () => {
    if (!rotina) return
    if (ativa) return nav('/treino')
    if (aj.modoCuidado) return setChecklist(true)
    iniciar(rotina, semana)
    nav('/treino')
  }

  const registrarProxima = async () => {
    if (!proxima) return
    const t = totaisItens(proxima.itens)
    await db.refeicoes.add({ data: hojeISO(), horario: proxima.horario, nome: proxima.nome, kcal: Math.round(t.kcal), proteina: Math.round(t.proteina) })
  }

  return (
    <div>
      {!aj.onboarding && <Boasvindas />}
      <header className="flex items-start justify-between pt-4">
        <div>
          <p className="flex items-center gap-2 text-tx2">
            {DIAS[new Date().getDay()]}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            <span className="rounded-full border border-amber/40 px-2 py-0.5 text-xs font-semibold text-amber" title="Versão do app">v{__APP_VERSION__}</span>
          </p>
          <h1 className="font-display text-[2.4rem] font-bold leading-none">
            {saudacao()}{aj.nome ? `, ${aj.nome}` : ''}
          </h1>
        </div>
        <Link to="/ajustes" aria-label="Ajustes" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-s2"><Icone nome="ajustes" /></Link>
      </header>

      {/* Sequência + semana */}
      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/15 text-amber"><Icone nome="fogo" size={26} /></span>
            <div>
              <p className="tnum font-display text-3xl font-bold leading-none">{seq} {seq === 1 ? 'treino' : 'treinos'}</p>
              <p className="text-sm text-tx2">em sequência · semana {semana} do plano</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {semanaAtual().map((d) => {
            const feito = feitos.has(d.iso)
            const planejado = rotinas ? rotinasDoPlano(rotinas, plano).some((r) => r.dias.includes(d.dow)) : false
            return (
              <div key={d.iso} className="flex flex-col items-center gap-1">
                <span className={cx('text-xs', d.hoje ? 'font-bold text-amber' : 'text-tx2')}>{DIAS_CURTOS[d.dow]}</span>
                <span
                  className={cx(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-xs',
                    feito ? 'border-amber bg-amber text-bg' : planejado ? 'border-line bg-s2 text-tx2' : 'border-transparent bg-transparent text-tx2/50',
                    d.hoje && !feito && 'border-amber',
                  )}
                  aria-label={`${DIAS[d.dow]}: ${feito ? 'treinado' : planejado ? 'planejado' : 'descanso'}`}
                >
                  {feito ? <Icone nome="check" size={16} strokeWidth={3} /> : planejado ? '•' : '–'}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Treino do dia */}
      <Secao titulo="Treino de hoje">
        {!rotinas ? (
          <Esqueleto className="h-56" />
        ) : rotina ? (
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-amber/20 via-s1 to-s1 p-4">
              <p className="text-sm font-medium text-amber">{aj.horarioTreino} · {rotina.tipo === 'cardio' ? 'Cardio' : `${rotina.itens.length} exercícios · ${seriesDaSemana(rotina.itens[0], rotina, semana)} séries`}</p>
              <h3 className="font-display text-4xl font-bold leading-tight">{rotina.nome}</h3>
              {rotina.subtitulo && <p className="text-tx2">{rotina.subtitulo}</p>}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
              {rotina.itens.map((it) => {
                const ex = exPorId(it.exId)
                return ex ? (
                  <Link key={it.exId} to={`/exercicios/${it.exId}`} className="w-24 shrink-0">
                    <MidiaExercicio ex={ex} tamanho="sm" className="aspect-square w-24" />
                    <p className="mt-1 line-clamp-2 text-xs text-tx2">{ex.nome}</p>
                  </Link>
                ) : (
                  <Esqueleto key={it.exId} className="h-24 w-24 shrink-0" />
                )
              })}
            </div>
            <div className="p-4 pt-3">
              {treinouHoje && <Aviso tipo="ok" className="mb-3">Treino de hoje registrado. Bom trabalho!</Aviso>}
              <Botao grande icone="play" className="w-full" onClick={comecar}>
                {ativa ? 'Continuar treino' : treinouHoje ? 'Treinar de novo' : 'Iniciar treino'}
              </Botao>
              {!ativa && (
                <Link to="/treinos" className="mt-2 flex min-h-11 items-center justify-center text-sm text-tx2 underline underline-offset-2">
                  Quer fazer outro treino hoje?
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="font-display text-2xl font-bold">Dia de descanso</p>
            <p className="mt-1 text-tx2">Recuperação também é treino. Uma caminhada leve e boa hidratação ajudam.</p>
            <Botao variante="secundario" className="mt-4 w-full" icone="halter" onClick={() => nav('/treinos')}>Ver treinos</Botao>
          </Card>
        )}
      </Secao>

      {aj.modoCuidado && (
        <Card className="mt-4 border-info/30">
          <div className="flex gap-3">
            <Icone nome="sol" className="shrink-0 text-info" />
            <div>
              <p className="font-semibold">Modo cuidado</p>
              <p className="text-sm text-tx2">{dica}</p>
              <Link to="/cuidado" className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-amber">Sinais para parar e checklist →</Link>
            </div>
          </div>
        </Card>
      )}

      {!diaAj && <div className="mt-4"><PosTreinoAgora soSeRecente /></div>}

      {/* Dieta e água */}
      <Secao titulo="Alimentação" acao={<Link to="/dieta" className="min-h-10 inline-flex items-center text-sm font-semibold text-amber">Ver dieta</Link>}>
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-tx2">Calorias</p>
              <p className="tnum font-display text-2xl font-bold">{kcal}<span className="text-base text-tx2"> / {aj.metaKcal}</span></p>
              <Barra valor={kcal} max={aj.metaKcal} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-tx2">Proteína</p>
              <p className="tnum font-display text-2xl font-bold">{prot}<span className="text-base text-tx2"> / {aj.metaProteina} g</span></p>
              <Barra valor={prot} max={aj.metaProteina} cor="bg-ok" className="mt-2" />
            </div>
          </div>
          {proxAj ? (
            <Link to="/dieta" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-s2 p-3">
              <div className="min-w-0">
                <p className="text-sm text-amber">Próxima (dia ajustado) · {proxAj.horario}</p>
                <p className="truncate font-semibold">{proxAj.nome}</p>
                <p className="tnum text-sm text-tx2">~{proxAj.kcal} kcal · {proxAj.proteina} g proteína</p>
              </div>
              <span className="flex min-h-11 items-center rounded-xl bg-amber px-3 text-sm font-semibold text-bg">Opções</span>
            </Link>
          ) : proxima && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-s2 p-3">
              <div className="min-w-0">
                <p className="text-sm text-amber">Próxima · {proxima.horario}</p>
                <p className="truncate font-semibold">{proxima.nome}</p>
                <p className="tnum text-sm text-tx2">{Math.round(totaisItens(proxima.itens).kcal)} kcal · {Math.round(totaisItens(proxima.itens).proteina)} g proteína</p>
              </div>
              <BotaoIcone icone="check" rotulo={`Registrar ${proxima.nome}`} onClick={registrarProxima} className="bg-amber text-bg" />
            </div>
          )}
          {!diaAj && (
            <Link to="/dieta" className="mt-2 flex min-h-11 items-center justify-center text-sm text-tx2 underline underline-offset-2">
              Comeu em outro horário ou vai treinar diferente? Ajustar meu dia
            </Link>
          )}
        </Card>

        <Card className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-info/15 text-info"><Icone nome="gota" size={26} /></span>
              <div>
                <p className="text-sm text-tx2">Água</p>
                <p className="tnum font-display text-2xl font-bold">{(agua / 1000).toFixed(2).replace('.', ',')} <span className="text-base text-tx2">/ {(aj.metaAguaMl / 1000).toFixed(1).replace('.', ',')} L</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <BotaoIcone icone="menos" rotulo="Remover 250 ml" onClick={() => somarAgua(-250)} />
              <Botao onClick={() => somarAgua(250)} className="tnum">+250</Botao>
            </div>
          </div>
          <Barra valor={agua} max={aj.metaAguaMl} cor="bg-info" className="mt-3" />
        </Card>
      </Secao>

      {checklist && rotina && (
        <ChecklistPreTreino
          onCancelar={() => setChecklist(false)}
          onOk={() => { setChecklist(false); iniciar(rotina, semana); nav('/treino') }}
        />
      )}
      {/* atalho para quem desligou o aviso inicial */}
      {aj.onboarding && !aj.modoCuidado && (
        <button onClick={() => salvarAjustes({ modoCuidado: true })} className="mt-4 min-h-12 w-full rounded-2xl border border-dashed border-line text-sm text-tx2">
          Sensível ao calor ou com fadiga? Ativar modo cuidado
        </button>
      )}
    </div>
  )
}
