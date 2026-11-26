import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { hojeISO } from '../lib/datas'
import { useAjustes } from '../lib/hooks'
import { useRefeicoesDia } from '../lib/consultas'
import { planejarDia, lerDia, salvarDia, apagarDia, toHM, toMin, type ConfigDia, type DiaSalvo, type RefeicaoAjustada } from '../lib/diaAjustado'
import { PLANO_DIETA, totaisItens } from '../content/dieta'
import { receitasPara, fatorPara, SLOT_NOME, type Receita, type Slot } from '../content/receitas'
import { Botao, Card, Chip, Folha, Aviso, cx } from './ui'
import { Icone } from './Icone'
import { CardReceita, FolhaReceita, registrarReceita, useNaoCurto } from './Receitas'

const agoraHM = () => new Date().toTimeString().slice(0, 5)

export function useDiaAjustado(data = hojeISO()) {
  const [dia, setDia] = useState<DiaSalvo | null>(() => lerDia(data))
  useEffect(() => {
    const f = () => setDia(lerDia(data))
    addEventListener('forja-dia', f)
    return () => removeEventListener('forja-dia', f)
  }, [data])
  return dia
}

/** Próxima refeição do dia ajustado (para a tela Hoje) */
export function proximaAjustada(dia: DiaSalvo | null, feitas: { horario: string; nome: string }[]) {
  if (!dia) return null
  const ag = agoraHM()
  const pend = dia.refeicoes.filter((r) => !feitas.some((f) => f.horario === r.horario && f.nome.startsWith(r.nome)))
  return pend.find((r) => r.horario >= toHM(toMin(ag) - 60)) ?? pend[0] ?? null
}

/** Card principal: botão para ajustar ou a lista do dia ajustado */
export function CardDiaAjustado() {
  const dia = useDiaAjustado()
  const [form, setForm] = useState(false)
  const [opcoes, setOpcoes] = useState<RefeicaoAjustada | null>(null)
  const refeicoes = useRefeicoesDia()

  if (!dia) {
    return (
      <>
        <button onClick={() => setForm(true)} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-[20px] border border-dashed border-amber/60 bg-amber/5 px-4 py-3 text-left">
          <span>
            <span className="block font-semibold">Seu dia fugiu do plano?</span>
            <span className="block text-sm text-tx2">Comeu tarde, vai treinar em outro horário… Toque para remontar o resto do dia.</span>
          </span>
          <Icone nome="relogio" className="shrink-0 text-amber" />
        </button>
        {form && <FormDia onFechar={() => setForm(false)} />}
      </>
    )
  }

  const feita = (r: RefeicaoAjustada) => refeicoes.some((x) => x.horario === r.horario && x.nome.startsWith(r.nome))
  const tot = dia.refeicoes.reduce((t, r) => ({ kcal: t.kcal + r.kcal, p: t.p + r.proteina }), { kcal: 0, p: 0 })

  return (
    <Card className="border-amber/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-bold leading-tight">Seu dia ajustado</p>
          <p className="text-sm text-tx2">
            {dia.cfg.treino.tipo === 'vai' ? `Treino às ${dia.cfg.treino.hora}` : dia.cfg.treino.tipo === 'feito' ? `Treinou às ${dia.cfg.treino.hora}` : 'Sem treino hoje'} · dormir às {dia.cfg.dormir}
          </p>
          <p className="tnum text-sm text-tx2">Restante do dia: {tot.kcal} kcal · {tot.p} g de proteína</p>
        </div>
        <button onClick={() => setForm(true)} className="min-h-10 shrink-0 text-sm font-semibold text-amber">Refazer</button>
      </div>
      {dia.faltavaKcal != null && dia.faltavaKcal - tot.kcal > 150 && (
        <Aviso className="mt-3">Hoje vai ficar uns {Math.round((dia.faltavaKcal - tot.kcal) / 10) * 10} kcal abaixo da meta. Num dia atípico tudo bem — não force comer demais à noite. Priorize bater a proteína.</Aviso>
      )}
      <ul className="mt-3 space-y-2">
        {dia.refeicoes.map((r) => {
          const ok = feita(r)
          return (
            <li key={r.horario + r.nome} className={cx('rounded-2xl p-3', ok ? 'bg-ok/10' : 'bg-s2')}>
              <div className="flex items-center gap-3">
                <span className="tnum w-12 shrink-0 font-display text-lg font-bold text-amber">{r.horario}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{r.nome}</p>
                  <p className="tnum text-sm text-tx2">~{r.kcal} kcal · {r.proteina} g proteína</p>
                </div>
                {ok ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ok text-bg" aria-label="Feita"><Icone nome="check" size={20} strokeWidth={3} /></span>
                ) : (
                  <Botao className="min-h-11 shrink-0 px-3 text-sm" onClick={() => setOpcoes(r)}>Opções</Botao>
                )}
              </div>
              {!ok && <p className="mt-1 pl-15 text-xs text-tx2">{r.dica}</p>}
            </li>
          )
        })}
      </ul>
      <button onClick={() => apagarDia(hojeISO())} className="mt-3 min-h-10 text-sm text-tx2 underline underline-offset-2">Voltar ao plano padrão</button>
      {form && <FormDia onFechar={() => setForm(false)} atual={dia.cfg} />}
      {opcoes && <OpcoesRefeicao r={opcoes} onFechar={() => setOpcoes(null)} />}
    </Card>
  )
}

function FormDia({ onFechar, atual }: { onFechar: () => void; atual?: ConfigDia }) {
  const aj = useAjustes()
  const refeicoes = useRefeicoesDia()
  const sessaoHoje = useLiveQuery(() => db.sessoes.where('inicio').above(new Date(new Date().setHours(0, 0, 0, 0)).getTime()).last(), [])
  const ultimaLog = [...refeicoes].sort((a, b) => a.horario.localeCompare(b.horario)).pop()?.horario ?? null

  const [ultima, setUltima] = useState<string>(atual?.ultimaRefeicao ?? ultimaLog ?? '')
  const [registrarCafe, setRegistrarCafe] = useState(refeicoes.length === 0)
  const [tipo, setTipo] = useState<ConfigDia['treino']['tipo']>(atual?.treino.tipo ?? (sessaoHoje ? 'feito' : 'vai'))
  const [hora, setHora] = useState(atual?.treino.hora ?? (sessaoHoje ? new Date(sessaoHoje.inicio).toTimeString().slice(0, 5) : toHM(toMin(agoraHM()) + 30)))
  const [dormir, setDormir] = useState(atual?.dormir ?? '23:00')

  const cafe = PLANO_DIETA[0]
  const kcalCafe = Math.round(totaisItens(cafe.itens).kcal)
  const protCafe = Math.round(totaisItens(cafe.itens).proteina)

  const montar = async () => {
    if (registrarCafe && ultima && refeicoes.length === 0) {
      await db.refeicoes.add({ data: hojeISO(), horario: ultima, nome: cafe.nome, kcal: kcalCafe, proteina: protCafe })
    }
    const consumidoK = refeicoes.reduce((t, r) => t + r.kcal, 0) + (registrarCafe && ultima && refeicoes.length === 0 ? kcalCafe : 0)
    const consumidoP = refeicoes.reduce((t, r) => t + r.proteina, 0) + (registrarCafe && ultima && refeicoes.length === 0 ? protCafe : 0)
    const cfg: ConfigDia = { data: hojeISO(), treino: { tipo, hora, duracaoMin: 60 }, dormir, ultimaRefeicao: ultima || null }
    const lista = planejarDia(cfg, agoraHM(), { kcal: aj.metaKcal - consumidoK, proteina: aj.metaProteina - consumidoP })
    salvarDia({ cfg, refeicoes: lista, criadoEm: Date.now(), faltavaKcal: aj.metaKcal - consumidoK })
    onFechar()
  }

  const campoHora = (rotulo: string, v: string, set: (s: string) => void) => (
    <label className="block">
      <span className="mb-1 block text-sm text-tx2">{rotulo}</span>
      <input type="time" value={v} onChange={(e) => set(e.target.value)} className="tnum min-h-12 w-full rounded-2xl border border-line bg-s2 px-4 text-lg" />
    </label>
  )

  return (
    <Folha aberta onFechar={onFechar} titulo="Ajustar meu dia" alta>
      <div className="space-y-5">
        <section className="space-y-2">
          <h3 className="font-display text-lg font-semibold">1. O que você já comeu</h3>
          {refeicoes.length > 0 ? (
            <p className="text-sm text-tx2">Registrado hoje: {refeicoes.length} refeição(ões), {refeicoes.reduce((t, r) => t + r.kcal, 0)} kcal.</p>
          ) : (
            <p className="text-sm text-tx2">Nada registrado hoje ainda.</p>
          )}
          {campoHora('Horário da última refeição (deixe vazio se ainda não comeu)', ultima, setUltima)}
          {refeicoes.length === 0 && ultima && (
            <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-s2 px-3">
              <input type="checkbox" checked={registrarCafe} onChange={(e) => setRegistrarCafe(e.target.checked)} className="h-5 w-5 accent-[#FFC21A]" />
              <span className="text-sm">Foi o café do plano ({kcalCafe} kcal) — registrar às {ultima}</span>
            </label>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="font-display text-lg font-semibold">2. Treino de hoje</h3>
          <div className="flex flex-wrap gap-2">
            <Chip ativo={tipo === 'vai'} onClick={() => setTipo('vai')}>Vou treinar</Chip>
            <Chip ativo={tipo === 'feito'} onClick={() => setTipo('feito')}>Já treinei</Chip>
            <Chip ativo={tipo === 'nao'} onClick={() => setTipo('nao')}>Sem treino hoje</Chip>
          </div>
          {tipo !== 'nao' && campoHora(tipo === 'vai' ? 'Vou começar às' : 'Comecei às', hora, setHora)}
        </section>

        <section className="space-y-2">
          <h3 className="font-display text-lg font-semibold">3. Que horas vai dormir?</h3>
          {campoHora('Dormir por volta de', dormir, setDormir)}
        </section>

        <Aviso>O app divide o que falta da sua meta ({aj.metaKcal} kcal · {aj.metaProteina} g) nas próximas refeições, com pré e pós-treino nos horários certos.</Aviso>
        <Botao grande className="w-full" icone="check" onClick={montar}>Montar o resto do meu dia</Botao>
      </div>
    </Folha>
  )
}

const GRUPO: Partial<Record<Slot, string>> = { pre: 'Leve e rápido', pos: 'Rápido: whey ou lanche', almoco: 'Prato de almoço', jantar: 'Prato de jantar', lanche: 'Lanche', ceia: 'Ceia' }

function OpcoesRefeicao({ r, onFechar }: { r: RefeicaoAjustada; onFechar: () => void }) {
  const naoCurto = useNaoCurto()
  const [ver, setVer] = useState<{ rec: Receita; f: number } | null>(null)
  return (
    <Folha aberta onFechar={onFechar} titulo={`${r.horario} · ${r.nome}`} alta>
      <p className="mb-3 text-sm text-tx2">Meta desta refeição: ~{r.kcal} kcal e {r.proteina} g de proteína. As porções já vêm ajustadas.</p>
      {r.slots.map((s) => {
        const lista = receitasPara(s, naoCurto).slice(0, 5)
        if (!lista.length) return null
        return (
          <section key={s} className="mb-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber">{GRUPO[s] ?? SLOT_NOME[s]}</h3>
            <div className="space-y-2">
              {lista.map((rec) => {
                const f = fatorPara(rec, r.kcal)
                return <CardReceita key={rec.id} r={rec} fator={f} onClick={() => setVer({ rec, f })} />
              })}
            </div>
          </section>
        )
      })}
      {ver && (
        <FolhaReceita r={ver.rec} fatorInicial={ver.f} onFechar={() => setVer(null)}
          acoes={(f) => <Botao grande className="w-full" icone="check" onClick={async () => { await registrarReceita(ver.rec, f, r.horario, `${r.nome}: ${ver.rec.nome}`); setVer(null); onFechar() }}>Comi isso</Botao>} />
      )}
    </Folha>
  )
}
