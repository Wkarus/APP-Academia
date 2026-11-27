import { useMemo, useState } from 'react'
import { db } from '../lib/db'
import { hojeISO, duracao } from '../lib/datas'
import { useAjustes } from '../lib/hooks'
import { normalizar } from '../lib/exercicios'
import { useDiaRefeicoes, useTreinoRecente, type RefeicaoDoDia } from '../lib/refeicoesDia'
import { ALIMENTOS, type Alimento } from '../content/alimentos'
import { RECEITAS, fatorPara, macrosReceita, type Receita } from '../content/receitas'
import { Botao, BotaoIcone, Card, Chip, Folha, Aviso, Secao, cx } from './ui'
import { Icone } from './Icone'
import { CardReceita, FolhaReceita, useNaoCurto } from './Receitas'

const COM_PEIXE = new Set(['pizza-aliche', 'caesar'])
const r0 = (n: number) => Math.round(n)
const agoraHM = () => new Date().toTimeString().slice(0, 5)

async function registrar(ref: RefeicaoDoDia | null, nome: string, kcal: number, proteina: number) {
  await db.refeicoes.add({
    data: hojeISO(), horario: agoraHM(), nome: ref ? `${ref.plano.nome}: ${nome}` : nome,
    kcal: r0(kcal), proteina: r0(proteina), planoHorario: ref?.plano.horario,
  })
}

async function pular(ref: RefeicaoDoDia) {
  await db.refeicoes.add({ data: hojeISO(), horario: agoraHM(), nome: `${ref.plano.nome} (pulada)`, kcal: 0, proteina: 0, planoHorario: ref.plano.horario, pulada: true })
}

/** Botão grande que abre o "O que eu como agora?" */
export function BotaoComerAgora({ className }: { className?: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <>
      <Botao grande icone="prato" className={cx('w-full', className)} onClick={() => setAberto(true)}>O que eu como agora?</Botao>
      {aberto && <FolhaComerAgora onFechar={() => setAberto(false)} />}
    </>
  )
}

type Tenho = 'rapido' | 'comida' | 'fora'

/** Pergunta o que a pessoa tem em mãos e sugere, com base no que falta da meta */
export function FolhaComerAgora({ onFechar, inicial }: { onFechar: () => void; inicial?: string }) {
  const dia = useDiaRefeicoes()
  const treino = useTreinoRecente()
  const naoCurto = useNaoCurto()
  const pend = dia.itens.filter((x) => x.status === 'falta')
  // undefined = ainda não escolheu → usa a próxima que falta (a lista pode carregar depois de abrir)
  const [escolhido, setAlvoH] = useState<string | null | undefined>(inicial)
  const alvoH = escolhido !== undefined && (escolhido === null || pend.some((x) => x.plano.horario === escolhido)) ? escolhido : dia.proxima?.plano.horario ?? null
  const [tenho, setTenho] = useState<Tenho | null>(null)
  const [ver, setVer] = useState<{ rec: Receita; f: number } | null>(null)
  const [montar, setMontar] = useState(false)
  const ref = pend.find((x) => x.plano.horario === alvoH) ?? null
  const kcal = ref?.alvoKcal ?? Math.min(600, dia.faltamK)
  const prot = ref?.alvoProt ?? Math.min(45, dia.faltamP)

  const opcoes = useMemo(() => {
    const ok = (r: Receita) => !r.tags.some((t) => naoCurto.includes(t))
    if (tenho === 'rapido') {
      const rapidas = RECEITAS.filter((r) => ok(r) && r.minutos <= 5)
      // pós-treino primeiro quando treinou há pouco
      return rapidas.sort((a, b) => Number(b.slots.includes('pos') && !!treino) - Number(a.slots.includes('pos') && !!treino)).slice(0, 6)
    }
    if (tenho === 'comida') {
      const slots = ref?.slots ?? ['almoco']
      const doTipo = RECEITAS.filter((r) => ok(r) && r.slots.some((s) => slots.includes(s)))
      const pratos = kcal >= 450 ? RECEITAS.filter((r) => ok(r) && (r.slots.includes('almoco') || r.slots.includes('jantar'))) : []
      return [...new Map([...doTipo, ...pratos].map((r) => [r.id, r])).values()].slice(0, 8)
    }
    return []
  }, [tenho, naoCurto, ref, kcal, treino])

  const comi = async (rec: Receita, f: number) => {
    const m = macrosReceita(rec, f)
    await registrar(ref, rec.nome, m.kcal, m.proteina)
    setVer(null)
    onFechar()
  }

  return (
    <Folha aberta onFechar={onFechar} titulo="O que eu como agora?" alta>
      <div className="space-y-5">
        {treino && <Aviso tipo="ok">Você treinou há {duracao(Date.now() - treino)}. Agora é hora de <strong>proteína + carboidrato</strong> — mesmo que seja só um whey.</Aviso>}

        <section>
          <p className="mb-2 text-sm text-tx2">Vai contar como qual refeição?</p>
          {pend.length ? (
            <div className="flex flex-wrap gap-2">
              {pend.map((x) => <Chip key={x.plano.horario} ativo={alvoH === x.plano.horario} onClick={() => setAlvoH(x.plano.horario)}>{x.plano.nome.replace(/ \(.*\)/, '')}</Chip>)}
              <Chip ativo={alvoH === null} onClick={() => setAlvoH(null)}>Extra</Chip>
            </div>
          ) : (
            <p className="text-sm">Todas as refeições do plano já foram marcadas. Isso conta como extra.</p>
          )}
          <p className="tnum mt-2 rounded-xl bg-s2 p-3 text-sm">
            Meta para agora: <strong className="text-amber">~{r0(kcal)} kcal · {r0(prot)} g de proteína</strong>
            <span className="block text-xs text-tx2">Falta no dia: {r0(dia.faltamK)} kcal · {r0(dia.faltamP)} g</span>
          </p>
        </section>

        <section>
          <p className="mb-2 text-sm text-tx2">O que você tem aí?</p>
          <div className="grid gap-2">
            {([
              ['rapido', 'Só whey / lanche rápido', 'Sem comida pronta, pouco tempo'],
              ['comida', 'Tenho comida / vou cozinhar', 'Arroz, carne, frango, ovos…'],
              ['fora', 'Vou comprar ou pedir', 'Padaria, restaurante, delivery'],
            ] as const).map(([id, t, d]) => (
              <button key={id} onClick={() => setTenho(id)} aria-pressed={tenho === id}
                className={cx('flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left', tenho === id ? 'border-amber bg-amber/10' : 'border-line bg-s2')}>
                <span><span className="block font-semibold">{t}</span><span className="block text-xs text-tx2">{d}</span></span>
                <Icone nome="seta" size={18} className="text-tx2" />
              </button>
            ))}
          </div>
        </section>

        {(tenho === 'rapido' || tenho === 'comida') && (
          <section className="space-y-2">
            {opcoes.map((r) => {
              const f = Math.min(2, fatorPara(r, kcal))
              return <CardReceita key={r.id} r={r} fator={f} onClick={() => setVer({ rec: r, f })} />
            })}
            {tenho === 'rapido' && <p className="text-xs text-tx2">Só whey? Também vale: 1-2 scoops com água ou leite. Depois, faça uma refeição de verdade quando puder.</p>}
          </section>
        )}
        {tenho === 'fora' && <ComprarFora kcal={kcal} onEscolher={async (a, q) => { await registrar(ref, a.nome + (q !== 1 ? ` (${String(q).replace('.', ',')}×)` : ''), a.kcal * q, a.proteina * q); onFechar() }} />}

        <div className="grid gap-2 border-t border-line pt-4">
          <Botao variante="secundario" icone="mais" onClick={() => setMontar(true)}>Registrar o que eu comi (vários alimentos)</Botao>
          {ref && <Botao variante="fantasma" onClick={async () => { await pular(ref); onFechar() }}>Pular {ref.plano.nome.replace(/ \(.*\)/, '').toLowerCase()} hoje</Botao>}
        </div>
      </div>

      {ver && (
        <FolhaReceita r={ver.rec} fatorInicial={ver.f} onFechar={() => setVer(null)}
          acoes={(f) => <Botao grande className="w-full" icone="check" onClick={() => comi(ver.rec, f)}>Comi isso</Botao>} />
      )}
      {montar && <MontarRefeicao refeicao={ref} onFechar={() => setMontar(false)} onSalvo={onFechar} />}
    </Folha>
  )
}

function ComprarFora({ kcal, onEscolher }: { kcal: number; onEscolher: (a: Alimento, qtd: number) => void }) {
  const aj = useAjustes()
  const prontos = ALIMENTOS.filter((a) => (a.grupo === 'pronto' || ['frango-grelhado', 'hamburguer-caseiro', 'barra-proteina', 'iogurte-grego-0', 'coxinha', 'pao-queijo'].includes(a.id)) && (!aj.semPeixe || !COM_PEIXE.has(a.id)))
  return (
    <section className="space-y-3">
      <Card className="text-sm">
        <p className="mb-1 font-semibold">Como escolher (~{r0(kcal)} kcal)</p>
        <ul className="list-disc space-y-1 pl-5 text-tx2">
          <li><strong className="text-tx">Restaurante/PF:</strong> grelhado (frango, carne, porco) + arroz + feijão + salada. Peça "sem fritura".</li>
          <li><strong className="text-tx">Padaria:</strong> sanduíche natural de frango ou peito de peru + iogurte proteico ou um café com leite.</li>
          <li><strong className="text-tx">Mercado:</strong> frango assado + pão ou batata; iogurte proteico; barra de proteína.</li>
          <li>Evite molho de ostra/shoyu de restaurante oriental se não souber os ingredientes (podem levar peixe).</li>
        </ul>
      </Card>
      <p className="text-sm text-tx2">Toque no que você pegou para registrar:</p>
      <ul className="space-y-1">
        {prontos.map((a) => (
          <li key={a.id}>
            <button onClick={() => onEscolher(a, 1)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-s2 px-3 text-left">
              <span className="min-w-0"><span className="block truncate">{a.nome}{a.alerta && <span className="ml-1 text-warn" title={a.alerta}>⚠</span>}</span><span className="text-xs text-tx2">{a.porcao}</span></span>
              <span className="tnum shrink-0 text-sm text-tx2">{a.kcal} kcal · {a.proteina} g</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Montar uma refeição com vários alimentos (ex.: 3 ovos mexidos + cappuccino + 4 pães de queijo) */
export function MontarRefeicao({ refeicao, onFechar, onSalvo }: { refeicao: RefeicaoDoDia | null; onFechar: () => void; onSalvo?: () => void }) {
  const aj = useAjustes()
  const [q, setQ] = useState('')
  const [itens, setItens] = useState<{ a: Alimento; qtd: number }[]>([])
  const [manual, setManual] = useState({ nome: '', kcal: '', proteina: '' })
  const lista = useMemo(() => {
    const n = normalizar(q)
    return n ? ALIMENTOS.filter((a) => (!aj.semPeixe || !COM_PEIXE.has(a.id)) && normalizar(a.nome).includes(n)).slice(0, 12) : []
  }, [q, aj.semPeixe])
  const tot = itens.reduce((t, i) => ({ k: t.k + i.a.kcal * i.qtd, p: t.p + i.a.proteina * i.qtd }), { k: 0, p: 0 })
  const add = (a: Alimento) => { setItens((xs) => (xs.some((x) => x.a.id === a.id) ? xs.map((x) => (x.a.id === a.id ? { ...x, qtd: x.qtd + 1 } : x)) : [...xs, { a, qtd: 1 }])); setQ('') }
  const mudar = (id: string, d: number) => setItens((xs) => xs.map((x) => (x.a.id === id ? { ...x, qtd: Math.max(0, x.qtd + d) } : x)).filter((x) => x.qtd > 0))
  const fmt = (n: number) => String(n).replace('.', ',')

  const salvar = async () => {
    const extraK = Number(manual.kcal) || 0
    const extraP = Number(manual.proteina) || 0
    const nomes = [...itens.map((i) => `${fmt(i.qtd)}× ${i.a.nome}`), ...(manual.nome ? [manual.nome] : [])]
    await db.refeicoes.add({
      data: hojeISO(), horario: agoraHM(), nome: refeicao ? `${refeicao.plano.nome}: ${nomes.join(', ')}` : nomes.join(', '),
      kcal: r0(tot.k + extraK), proteina: r0(tot.p + extraP), planoHorario: refeicao?.plano.horario,
      itens: itens.map((i) => ({ alimentoId: i.a.id, nome: i.a.nome, qtd: i.qtd, kcal: r0(i.a.kcal * i.qtd), proteina: r0(i.a.proteina * i.qtd) })),
    })
    onFechar()
    onSalvo?.()
  }

  return (
    <Folha aberta onFechar={onFechar} titulo={refeicao ? `O que comi: ${refeicao.plano.nome.replace(/ \(.*\)/, '')}` : 'O que comi'} alta>
      <div className="space-y-4">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: ovo, pão de queijo, cappuccino…" className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" autoFocus />
        {lista.length > 0 && (
          <ul className="space-y-1">
            {lista.map((a) => (
              <li key={a.id}>
                <button onClick={() => add(a)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-s2 px-3 text-left">
                  <span className="min-w-0"><span className="block truncate">{a.nome}</span><span className="text-xs text-tx2">{a.porcao}</span></span>
                  <Icone nome="mais" size={20} className="shrink-0 text-amber" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <Secao titulo="Nesta refeição">
          {itens.length === 0 ? <p className="text-sm text-tx2">Busque e toque nos alimentos para adicionar. Toque de novo para somar mais uma porção.</p> : (
            <ul className="space-y-2">
              {itens.map((i) => (
                <li key={i.a.id} className="flex items-center gap-2 rounded-2xl bg-s1 p-2">
                  <div className="min-w-0 flex-1"><p className="truncate font-medium">{i.a.nome}</p><p className="tnum text-xs text-tx2">{fmt(i.qtd)} × {i.a.porcao} · {r0(i.a.kcal * i.qtd)} kcal</p></div>
                  <BotaoIcone icone="menos" rotulo={`Menos ${i.a.nome}`} className="h-10 w-10" onClick={() => mudar(i.a.id, -0.5)} />
                  <span className="tnum w-8 text-center font-semibold">{fmt(i.qtd)}</span>
                  <BotaoIcone icone="mais" rotulo={`Mais ${i.a.nome}`} className="h-10 w-10" onClick={() => mudar(i.a.id, 0.5)} />
                </li>
              ))}
            </ul>
          )}
        </Secao>

        <details className="rounded-2xl bg-s2 p-3">
          <summary className="min-h-10 cursor-pointer text-sm font-semibold">Não achou? Adicionar à mão</summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input className="col-span-2 min-h-12 rounded-xl bg-s1 px-3" placeholder="Nome (ex.: marmita do restaurante)" value={manual.nome} onChange={(e) => setManual({ ...manual, nome: e.target.value })} />
            <input className="min-h-12 rounded-xl bg-s1 px-3" inputMode="numeric" placeholder="kcal (aprox.)" value={manual.kcal} onChange={(e) => setManual({ ...manual, kcal: e.target.value })} />
            <input className="min-h-12 rounded-xl bg-s1 px-3" inputMode="numeric" placeholder="proteína (g)" value={manual.proteina} onChange={(e) => setManual({ ...manual, proteina: e.target.value })} />
          </div>
        </details>

        <div className="tnum rounded-2xl bg-amber/10 p-3 text-center">
          Total: <strong>{r0(tot.k + (Number(manual.kcal) || 0))} kcal · {r0(tot.p + (Number(manual.proteina) || 0))} g proteína</strong>
        </div>
        <Botao grande className="w-full" icone="check" disabled={!itens.length && !manual.nome} onClick={salvar}>Salvar</Botao>
      </div>
    </Folha>
  )
}

/** Lista das refeições de hoje por estado: feita, pulada ou falta (com meta ajustada) */
export function ListaRefeicoesHoje() {
  const dia = useDiaRefeicoes()
  const [abrir, setAbrir] = useState<string | null>(null)
  const [montar, setMontar] = useState<RefeicaoDoDia | null>(null)
  return (
    <Secao titulo="Refeições de hoje">
      <p className="-mt-1 mb-3 text-sm text-tx2">Marque o que você comeu ou pulou — o resto do dia se ajusta sozinho, não importa o horário.</p>
      {dia.limitado && <Aviso className="mb-3">Hoje vai sobrar meta. Tudo bem num dia corrido — não force pratos enormes à noite; priorize a proteína.</Aviso>}
      <ul className="space-y-2">
        {dia.itens.map((x) => {
          const nome = x.plano.nome.replace(/ \(.*\)/, '')
          const ehProxima = dia.proxima?.plano.horario === x.plano.horario
          return (
            <li key={x.plano.horario} className={cx('rounded-2xl p-3', x.status === 'feita' ? 'bg-ok/10' : x.status === 'pulada' ? 'bg-s1 opacity-70' : ehProxima ? 'border border-amber/50 bg-amber/5' : 'bg-s1')}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {nome}
                    {ehProxima && <span className="ml-2 rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-bg">PRÓXIMA</span>}
                    {x.status === 'pulada' && <span className="ml-2 text-xs text-tx2">pulada</span>}
                  </p>
                  {x.status === 'feita' ? (
                    <p className="text-sm text-tx2">{x.registros.filter((r) => !r.pulada).map((r) => `${r.nome.replace(`${x.plano.nome}: `, '')} (${r.kcal} kcal)`).join(' + ')}</p>
                  ) : x.status === 'falta' ? (
                    <p className="tnum text-sm text-tx2">Meta: ~{x.alvoKcal} kcal · {x.alvoProt} g{x.alvoKcal !== Math.round(x.planoKcal / 10) * 10 && <span className="text-amber"> (ajustada)</span>}</p>
                  ) : null}
                </div>
                {x.status === 'falta' ? (
                  <Botao className="min-h-11 shrink-0 px-3 text-sm" onClick={() => setAbrir(x.plano.horario)}>Comer</Botao>
                ) : (
                  <BotaoIcone icone="x" rotulo={`Desfazer ${nome}`} onClick={() => Promise.all(x.registros.map((r) => db.refeicoes.delete(r.id!)))} />
                )}
              </div>
              {x.status === 'falta' && (
                <div className="mt-2 flex gap-2 text-sm">
                  <button className="min-h-10 rounded-xl px-2 text-tx2 underline underline-offset-2" onClick={() => setMontar(x)}>Já comi (registrar)</button>
                  <button className="min-h-10 rounded-xl px-2 text-tx2 underline underline-offset-2" onClick={() => pular(x)}>Pulei</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {dia.avulsas.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-sm text-tx2">Extras</p>
          <ul className="space-y-1">
            {dia.avulsas.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-xl bg-s1 p-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{r.nome}</span>
                <span className="tnum text-tx2">{r.kcal} kcal</span>
                <BotaoIcone icone="lixo" rotulo="Remover" className="h-10 w-10" onClick={() => db.refeicoes.delete(r.id!)} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {abrir && <FolhaComerAgora inicial={abrir} onFechar={() => setAbrir(null)} />}
      {montar && <MontarRefeicao refeicao={montar} onFechar={() => setMontar(null)} />}
    </Secao>
  )
}
