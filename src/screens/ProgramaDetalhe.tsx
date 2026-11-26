import { useNavigate, useParams } from 'react-router-dom'
import { PROGRAMAS, CATEGORIAS } from '../content/programas'
import { exPorId, useExercicios } from '../lib/exercicios'
import { useTreino } from '../lib/treino'
import { useAjustes } from '../lib/hooks'
import { ativarPrograma, rotinasDoPrograma, voltarMeuPlano } from '../lib/planos'
import { DIAS_CURTOS } from '../lib/datas'
import { Botao, BotaoIcone, Card, Secao, Aviso, cx } from '../components/ui'
import { AnimeLinhas } from './Treinos'
import { useState } from 'react'

export default function ProgramaDetalhe() {
  const { id } = useParams()
  const p = PROGRAMAS.find((x) => x.id === id)
  const nav = useNavigate()
  const iniciar = useTreino((s) => s.iniciar)
  const aj = useAjustes()
  const [confirmar, setConfirmar] = useState(false)
  useExercicios()
  if (!p) return <p className="pt-10 text-center">Programa não encontrado.</p>
  const anime = p.categoria === 'anime'

  const rotinas = rotinasDoPrograma(p)
  const emUso = aj.planoAtivo === p.id

  return (
    <div>
      <header className="flex items-center gap-3 pb-2 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav(-1)} />
        <span className={cx('text-sm font-semibold uppercase tracking-wider', anime ? 'text-[#ff5fa2]' : 'text-tx2')}>{CATEGORIAS[p.categoria]}</span>
      </header>
      <div className={cx('relative overflow-hidden rounded-[20px] p-5', anime ? 'bg-[radial-gradient(circle_at_80%_10%,rgba(255,95,162,0.4),transparent_50%),linear-gradient(135deg,#1a1030,#14161B)]' : 'bg-gradient-to-br from-amber/15 to-s1')}>
        {anime && <AnimeLinhas />}
        <h1 className={cx('relative font-display text-4xl font-bold leading-none', anime && 'italic')}>{p.nome}</h1>
        <p className="relative mt-2 text-tx2">{p.resumo}</p>
        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-bg/50 p-2"><p className="tnum font-display text-2xl font-bold">{p.dias}x</p><p className="text-xs text-tx2">por semana</p></div>
          <div className="rounded-xl bg-bg/50 p-2"><p className="font-display text-lg font-bold leading-7">{p.duracaoMin}</p><p className="text-xs text-tx2">por treino</p></div>
          <div className="rounded-xl bg-bg/50 p-2"><p className="font-display text-lg font-bold leading-7">{p.rotinas.length}</p><p className="text-xs text-tx2">rotinas</p></div>
        </div>
      </div>

      <Secao titulo="Para quem serve"><p className="text-tx2">{p.praQuem}</p></Secao>
      <Secao titulo="Como progredir"><p className="text-tx2">{p.progressao}</p></Secao>
      {p.observacao && <Aviso className="mt-4">{p.observacao}</Aviso>}

      <Secao titulo="Rotinas">
        <div className="space-y-3">
          {p.rotinas.map((r, i) => (
            <Card key={r.nome}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-bold">{r.nome}</h3>
                  <p className="text-xs text-amber">{rotinas[i].dias.length ? rotinas[i].dias.map((d) => DIAS_CURTOS[d]).join(' · ') : 'Alterna com as outras'}</p>
                </div>
                <Botao variante="secundario" icone="play" className="min-h-11" onClick={() => { iniciar(rotinas[i], 99); nav('/treino') }}>Treinar</Botao>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {r.itens.map((it) => (
                  <li key={it.exId} className="flex justify-between gap-2">
                    <span className="truncate">{exPorId(it.exId)?.nome ?? it.exId}</span>
                    <span className="tnum shrink-0 text-tx2">{it.series}×{it.repMin === it.repMax ? it.repMin : `${it.repMin}-${it.repMax}`}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Secao>

      {emUso ? (
        <div className="mt-6 space-y-2">
          <Aviso tipo="ok">Este é o seu plano agora. Ele aparece em Hoje nos dias marcados.</Aviso>
          <Botao variante="secundario" className="w-full" onClick={voltarMeuPlano}>Voltar ao Meu plano</Botao>
        </div>
      ) : confirmar ? (
        <div className="mt-6 space-y-3 rounded-[20px] border border-amber/40 bg-amber/5 p-4">
          <p className="font-semibold">Trocar sua semana por {p.nome}?</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-tx2">
            <li>Hoje passa a mostrar este programa ({rotinas.flatMap((r) => r.dias).sort().map((d) => DIAS_CURTOS[d]).join(', ')}). O cardio leve do seu plano continua nos dias livres.</li>
            <li>Seu Meu plano fica guardado, com histórico. Dá para voltar quando quiser.</li>
            <li>Siga por 8-12 semanas para ver resultado. Dá para mudar os dias editando cada rotina.</li>
          </ul>
          <div className="flex gap-2">
            <Botao variante="secundario" className="flex-1" onClick={() => setConfirmar(false)}>Cancelar</Botao>
            <Botao className="flex-1" icone="check" onClick={async () => { await ativarPrograma(p); setConfirmar(false); nav('/treinos') }}>Usar como meu plano</Botao>
          </div>
        </div>
      ) : (
        <Botao grande className="mt-6 w-full" icone="halter" onClick={() => setConfirmar(true)}>Usar como meu plano</Botao>
      )}
      <p className="mt-2 text-center text-xs text-tx2">Quer só experimentar? Use “Treinar” em uma rotina acima — não muda sua semana.</p>

      <Secao titulo="Fontes">
        <ul className="space-y-2 text-sm">
          {p.fonte.map((f) => (
            <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" className="text-amber underline underline-offset-2">{f.nome}</a></li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-tx2">Descrição escrita com palavras próprias a partir das fontes. Exercícios adaptados ao banco do app.</p>
      </Secao>
    </div>
  )
}
