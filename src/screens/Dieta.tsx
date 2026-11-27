import { useState } from 'react'
import { useAjustes, salvarAjustes } from '../lib/hooks'
import { useRefeicoesDia, useAguaDia, somarAgua } from '../lib/consultas'
import { ALIMENTOS, INGREDIENTES_ESCONDIDOS } from '../content/alimentos'
import { PLANO_DIETA, totaisItens, GUIAS, ATIVIDADES, OBJETIVOS, calcularMacros, type GuiaDieta } from '../content/dieta'
import { Titulo, Abas, Card, Botao, Barra, Interruptor, Aviso, Folha, Chip } from '../components/ui'
import { Icone } from '../components/Icone'
import type { Objetivo } from '../lib/types'
import { useSearchParams } from 'react-router-dom'
import { AbaReceitas, FolhaReceita } from '../components/Receitas'
import { BotaoComerAgora, FolhaComerAgora, ListaRefeicoesHoje } from '../components/ComerAgora'
import { slotDoHorario, receitasPara, fatorPara, SLOT_NOME, type Receita } from '../content/receitas'

type Aba = 'hoje' | 'plano' | 'receitas' | 'guias' | 'calc'
const r0 = (n: number) => Math.round(n)

export default function Dieta() {
  const [params] = useSearchParams()
  const [aba, setAba] = useState<Aba>((params.get('aba') as Aba) ?? 'hoje')
  const aj = useAjustes()
  return (
    <div>
      <Titulo sub={`Meta: ${aj.metaKcal} kcal · ${aj.metaProteina} g de proteína`}>Dieta</Titulo>
      <div className="mb-4 rounded-2xl bg-s1 px-3">
        <Interruptor ligado={aj.semPeixe} onChange={(v) => salvarAjustes({ semPeixe: v })} rotulo="Sem peixe / frutos do mar" descricao="Todas as sugestões excluem peixes e frutos do mar" />
      </div>
      <Abas abas={[{ id: 'hoje', nome: 'Hoje' }, { id: 'plano', nome: 'Plano' }, { id: 'receitas', nome: 'Receitas' }, { id: 'guias', nome: 'Guias' }, { id: 'calc', nome: 'Macros' }]} ativa={aba} onChange={setAba} />
      <div className="mt-4">
        {aba === 'hoje' && <AbaHoje />}
        {aba === 'plano' && <AbaPlano />}
        {aba === 'receitas' && <AbaReceitas />}
        {aba === 'guias' && <AbaGuias />}
        {aba === 'calc' && <AbaCalc />}
      </div>
      {aj.semPeixe && <IngredientesEscondidos />}
    </div>
  )
}

function IngredientesEscondidos() {
  return (
    <details className="mt-6 rounded-[20px] border border-warn/30 bg-warn/5 p-4">
      <summary className="min-h-10 cursor-pointer font-semibold">⚠ Ingredientes escondidos com peixe/frutos do mar</summary>
      <ul className="mt-3 space-y-2 text-sm">
        {INGREDIENTES_ESCONDIDOS.map((i) => (
          <li key={i.nome}><strong>{i.nome}:</strong> <span className="text-tx2">{i.onde}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-tx2">Em restaurantes, pergunte sobre molhos e caldos. Em suplementos, leia o rótulo (procure “óleo de peixe”, “fish oil”, “marine”).</p>
    </details>
  )
}

function AbaHoje() {
  const aj = useAjustes()
  const refeicoes = useRefeicoesDia()
  const agua = useAguaDia()
  const [params] = useSearchParams()
  const [agora, setAgora] = useState(params.get('agora') === '1')
  const validas = refeicoes.filter((r) => !r.pulada)
  const kcal = validas.reduce((t, r) => t + r.kcal, 0)
  const prot = validas.reduce((t, r) => t + r.proteina, 0)

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-tx2">Calorias</p>
            <p className="tnum font-display text-3xl font-bold">{kcal}</p>
            <p className="tnum text-sm text-tx2">faltam {Math.max(0, aj.metaKcal - kcal)}</p>
            <Barra valor={kcal} max={aj.metaKcal} className="mt-2" />
          </div>
          <div>
            <p className="text-sm text-tx2">Proteína</p>
            <p className="tnum font-display text-3xl font-bold">{prot} g</p>
            <p className="tnum text-sm text-tx2">faltam {Math.max(0, aj.metaProteina - prot)} g</p>
            <Barra valor={prot} max={aj.metaProteina} cor="bg-ok" className="mt-2" />
          </div>
        </div>
      </Card>

      <BotaoComerAgora />

      <ListaRefeicoesHoje />

      <Card>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Icone nome="gota" className="text-info" /><span className="font-semibold">Água</span></div>
          <span className="tnum text-tx2">{agua} / {aj.metaAguaMl} ml</span>
        </div>
        <Barra valor={agua} max={aj.metaAguaMl} cor="bg-info" className="my-3" />
        <div className="grid grid-cols-4 gap-2">
          <Botao variante="secundario" onClick={() => somarAgua(-250)} className="tnum">−250</Botao>
          <Botao variante="secundario" onClick={() => somarAgua(200)} className="tnum">+200</Botao>
          <Botao variante="secundario" onClick={() => somarAgua(300)} className="tnum">+300</Botao>
          <Botao onClick={() => somarAgua(500)} className="tnum">+500</Botao>
        </div>
      </Card>
      {agora && <FolhaComerAgora onFechar={() => setAgora(false)} />}
    </div>
  )
}

function AbaPlano() {
  const aj = useAjustes()
  const [ver, setVer] = useState<{ r: Receita; f: number } | null>(null)
  const tot = PLANO_DIETA.reduce((t, r) => { const x = totaisItens(r.itens); return { kcal: t.kcal + x.kcal, proteina: t.proteina + x.proteina } }, { kcal: 0, proteina: 0 })
  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-br from-amber/15 to-s1">
        <p className="text-sm text-tx2">Plano do dia · 6 refeições · sem peixe</p>
        <p className="tnum font-display text-3xl font-bold">{r0(tot.kcal)} kcal · {r0(tot.proteina)} g proteína</p>
      </Card>
      {PLANO_DIETA.map((r) => {
        const t = totaisItens(r.itens)
        return (
          <Card key={r.horario}>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-xl font-bold"><span className="tnum text-amber">{r.horario}</span> · {r.nome}</h3>
              <span className="tnum shrink-0 text-sm text-tx2">{r0(t.kcal)} kcal · {r0(t.proteina)} g</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {r.itens.map((i) => {
                const a = ALIMENTOS.find((x) => x.id === i.alimentoId)!
                return (
                  <li key={i.alimentoId} className="flex justify-between gap-2">
                    <span>{i.qtd !== 1 ? `${String(i.qtd).replace('.', ',')}× ` : ''}{a.nome} <span className="text-tx2">({a.porcao})</span></span>
                    <span className="tnum shrink-0 text-tx2">{r0(a.kcal * i.qtd)}</span>
                  </li>
                )
              })}
            </ul>
            {r.dica && <p className="mt-2 text-sm text-info">{r.dica}</p>}
            <p className="mt-3 text-xs uppercase tracking-wide text-tx2">Variações ({SLOT_NOME[slotDoHorario(r.horario)]})</p>
            <div className="no-scrollbar -mx-4 mt-1 flex gap-2 overflow-x-auto px-4">
              {receitasPara(slotDoHorario(r.horario), aj.naoCurto ?? []).slice(0, 6).map((x) => (
                <Chip key={x.id} onClick={() => setVer({ r: x, f: fatorPara(x, t.kcal) })}>{x.nome}</Chip>
              ))}
            </div>
          </Card>
        )
      })}
      <p className="text-xs text-tx2">Trocas equivalentes: frango ↔ patinho ↔ lombo; arroz ↔ batata-doce ↔ macarrão ↔ mandioca (ajuste a quantidade pelas calorias). As variações já vêm com a porção ajustada às calorias da refeição.</p>
      {ver && <FolhaReceita r={ver.r} fatorInicial={ver.f} onFechar={() => setVer(null)} />}
    </div>
  )
}

function AbaGuias() {
  const [g, setG] = useState<GuiaDieta | null>(null)
  return (
    <div className="space-y-2">
      {GUIAS.map((x) => (
        <Card key={x.id} as="button" onClick={() => setG(x)}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold">{x.nome}</h3>
              <p className="line-clamp-2 text-sm text-tx2">{x.resumo}</p>
            </div>
            <Icone nome="seta" className="shrink-0 text-tx2" />
          </div>
        </Card>
      ))}
      {g && (
        <Folha aberta onFechar={() => setG(null)} titulo={g.nome} alta>
          <div className="space-y-4">
            <p>{g.resumo}</p>
            <div><h4 className="font-display text-lg font-semibold">Para quem serve</h4><p className="text-tx2">{g.praQuem}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-ok/10 p-3"><h4 className="mb-1 font-semibold text-ok">Prós</h4><ul className="list-disc space-y-1 pl-5 text-sm">{g.pros.map((p) => <li key={p}>{p}</li>)}</ul></div>
              <div className="rounded-2xl bg-warn/10 p-3"><h4 className="mb-1 font-semibold text-warn">Contras</h4><ul className="list-disc space-y-1 pl-5 text-sm">{g.contras.map((p) => <li key={p}>{p}</li>)}</ul></div>
            </div>
            {g.alertas && <Aviso tipo="alerta"><strong>Alertas de saúde</strong><ul className="mt-1 list-disc space-y-1 pl-4">{g.alertas.map((a) => <li key={a}>{a}</li>)}</ul></Aviso>}
            <div>
              <h4 className="mb-2 font-display text-lg font-semibold">Cardápio exemplo (sem peixe)</h4>
              <ul className="space-y-1 text-sm">{g.cardapio.map((c) => <li key={c.refeicao} className="rounded-xl bg-s2 p-2"><strong>{c.refeicao}:</strong> {c.itens}</li>)}</ul>
            </div>
            <div className="text-sm">
              <h4 className="font-semibold">Fonte</h4>
              {g.fonte.map((f) => <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="block text-amber underline underline-offset-2">{f.nome}</a>)}
            </div>
          </div>
        </Folha>
      )}
    </div>
  )
}

function AbaCalc() {
  const aj = useAjustes()
  const [f, setF] = useState({
    sexo: aj.sexo ?? 'm', idade: aj.idade ?? 30, alturaCm: aj.alturaCm ?? 175, pesoKg: aj.pesoKg ?? 80, atividade: aj.atividade ?? 1.55, objetivo: (aj.objetivo ?? 'perda') as Objetivo,
  })
  const res = calcularMacros(f)
  const campo = (rotulo: string, k: 'idade' | 'alturaCm' | 'pesoKg', suf: string) => (
    <label className="block">
      <span className="text-sm text-tx2">{rotulo}</span>
      <div className="flex items-center rounded-2xl border border-line bg-s2 pr-3">
        <input inputMode="decimal" value={f[k]} onChange={(e) => setF({ ...f, [k]: Number(e.target.value.replace(',', '.')) || 0 })} className="tnum min-h-12 w-full bg-transparent px-3 font-semibold" />
        <span className="text-tx2">{suf}</span>
      </div>
    </label>
  )
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Chip ativo={f.sexo === 'm'} onClick={() => setF({ ...f, sexo: 'm' })}>Masculino</Chip>
        <Chip ativo={f.sexo === 'f'} onClick={() => setF({ ...f, sexo: 'f' })}>Feminino</Chip>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {campo('Idade', 'idade', 'anos')}
        {campo('Altura', 'alturaCm', 'cm')}
        {campo('Peso', 'pesoKg', 'kg')}
      </div>
      <label className="block">
        <span className="text-sm text-tx2">Nível de atividade</span>
        <select value={f.atividade} onChange={(e) => setF({ ...f, atividade: Number(e.target.value) })} className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-3">
          {ATIVIDADES.map((a) => <option key={a.f} value={a.f}>{a.nome} — {a.desc}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(OBJETIVOS) as Objetivo[]).map((o) => <Chip key={o} ativo={f.objetivo === o} onClick={() => setF({ ...f, objetivo: o })}>{OBJETIVOS[o].nome}</Chip>)}
      </div>
      <p className="text-sm text-tx2">{OBJETIVOS[f.objetivo].desc}</p>
      <Card className="bg-gradient-to-br from-amber/15 to-s1">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div><p className="tnum font-display text-4xl font-bold text-amber">{res.kcal}</p><p className="text-sm text-tx2">kcal/dia</p></div>
          <div><p className="tnum font-display text-4xl font-bold">{res.proteina} g</p><p className="text-sm text-tx2">proteína</p></div>
          <div><p className="tnum font-display text-2xl font-bold">{res.carbo} g</p><p className="text-sm text-tx2">carboidrato</p></div>
          <div><p className="tnum font-display text-2xl font-bold">{res.gordura} g</p><p className="text-sm text-tx2">gordura</p></div>
        </div>
        <p className="tnum mt-3 text-center text-xs text-tx2">TMB (Mifflin-St Jeor): {res.tmb} kcal · Gasto total estimado: {res.get} kcal</p>
      </Card>
      <Botao className="w-full" onClick={() => salvarAjustes({ ...f, metaKcal: res.kcal, metaProteina: res.proteina }).then(() => alert('Metas atualizadas.'))}>Usar como minhas metas</Botao>
      <Botao variante="fantasma" className="w-full" onClick={() => salvarAjustes({ metaKcal: 2300, metaProteina: 165 })}>Voltar ao plano original (2.300 kcal · 165 g)</Botao>
      <p className="text-xs text-tx2">Estimativa. Ajuste após 2-3 semanas pela média do peso. Fórmula: Mifflin MD et al. (1990), Am J Clin Nutr.</p>
    </div>
  )
}
