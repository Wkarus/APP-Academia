import { Link, useNavigate } from 'react-router-dom'
import { useRotinas } from '../lib/consultas'
import { useAjustes } from '../lib/hooks'
import { useTreino } from '../lib/treino'
import { db } from '../lib/db'
import { semanaDoPlano, DIAS_CURTOS } from '../lib/datas'
import { seriesDaSemana } from '../content/plano'
import { PROGRAMAS, CATEGORIAS, type Programa } from '../content/programas'
import { exPorId, useExercicios } from '../lib/exercicios'
import { Titulo, Card, Botao, BotaoIcone, Secao, Esqueleto, cx } from '../components/ui'
import { Icone } from '../components/Icone'
import type { Rotina } from '../lib/types'

export default function Treinos() {
  const rotinas = useRotinas()
  const aj = useAjustes()
  const semana = semanaDoPlano(aj.inicioPlano)
  const iniciar = useTreino((s) => s.iniciar)
  const ativa = useTreino((s) => s.ativa)
  const nav = useNavigate()
  useExercicios()

  const comecar = (r: Rotina) => {
    if (ativa && !confirm('Já existe um treino em andamento. Substituir?')) return
    iniciar(r, semana)
    nav('/treino')
  }
  const nova = async () => {
    const id = 'r-' + Date.now().toString(36)
    await db.rotinas.put({ id, nome: 'Nova rotina', dias: [], tipo: 'forca', itens: [], ordem: 100 + (rotinas?.length ?? 0) })
    nav(`/treinos/rotina/${id}`)
  }

  const minhas = rotinas?.filter((r) => !r.programaId) ?? []
  const deProgramas = rotinas?.filter((r) => r.programaId) ?? []

  return (
    <div>
      <Titulo sub={`Semana ${semana} · ${semana <= 2 ? '2 séries por exercício' : '3 séries por exercício'}`} acao={<BotaoIcone icone="mais" rotulo="Criar rotina" onClick={nova} className="bg-amber text-bg" />}>
        Treinos
      </Titulo>

      <Secao titulo="Meu plano">
        {!rotinas ? <Esqueleto className="h-40" /> : (
          <div className="space-y-3">
            {minhas.map((r) => <CardRotina key={r.id} r={r} semana={semana} onIniciar={() => comecar(r)} />)}
          </div>
        )}
      </Secao>

      {deProgramas.length > 0 && (
        <Secao titulo="Rotinas de programas">
          <div className="space-y-3">
            {deProgramas.map((r) => <CardRotina key={r.id} r={r} semana={semana} onIniciar={() => comecar(r)} />)}
          </div>
        </Secao>
      )}

      <Secao titulo="Programas prontos">
        <p className="-mt-1 mb-3 text-sm text-tx2">Descritos com palavras próprias, com fonte citada. Toque para ver para quem serve e como progredir.</p>
        {(Object.keys(CATEGORIAS) as Programa['categoria'][]).map((cat) => (
          <div key={cat} className="mb-5">
            <h3 className={cx('mb-2 text-sm font-semibold uppercase tracking-wider', cat === 'anime' ? 'text-[#ff5fa2]' : 'text-tx2')}>{CATEGORIAS[cat]}</h3>
            <div className="space-y-2">
              {PROGRAMAS.filter((p) => p.categoria === cat).map((p) => <CardPrograma key={p.id} p={p} />)}
            </div>
          </div>
        ))}
      </Secao>
    </div>
  )
}

function CardRotina({ r, semana, onIniciar }: { r: Rotina; semana: number; onIniciar: () => void }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1">
            {r.dias.length ? r.dias.map((d) => <span key={d} className="rounded-md bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber">{DIAS_CURTOS[d]}</span>) : <span className="text-xs text-tx2">Sem dia fixo</span>}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold leading-tight">{r.nome}</h3>
          <p className="text-sm text-tx2">
            {r.tipo === 'cardio' ? r.subtitulo ?? 'Cardio' : `${r.itens.length} exercícios · ${r.itens[0] ? seriesDaSemana(r.itens[0], r, semana) : 0} séries cada`}
          </p>
        </div>
        <Link to={`/treinos/rotina/${r.id}`} aria-label={`Editar ${r.nome}`} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-s2"><Icone nome="lapis" size={20} /></Link>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-tx2">{r.itens.map((i) => exPorId(i.exId)?.nome ?? '…').join(' · ')}</p>
      <Botao className="mt-3 w-full" icone="play" onClick={onIniciar} disabled={!r.itens.length}>Iniciar</Botao>
    </Card>
  )
}

function CardPrograma({ p }: { p: Programa }) {
  const anime = p.categoria === 'anime'
  return (
    <Link
      to={`/treinos/programa/${p.id}`}
      className={cx(
        'relative block overflow-hidden rounded-[20px] border p-4 transition-transform duration-200 active:scale-[0.99]',
        anime ? 'border-[#ff5fa2]/50 bg-[radial-gradient(circle_at_85%_20%,rgba(255,95,162,0.35),transparent_45%),linear-gradient(135deg,#1a1030,#14161B)]' : 'border-line/60 bg-s1',
      )}
    >
      {anime && <AnimeLinhas />}
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className={cx('font-display text-2xl font-bold leading-tight', anime && 'italic tracking-wide')}>{p.nome}</h4>
          <p className="text-sm text-tx2">{p.dias}x/semana · {p.nivel}</p>
        </div>
        <Icone nome="seta" className="shrink-0 text-tx2" />
      </div>
    </Link>
  )
}

/** Linhas de velocidade estilo mangá (decorativo) */
export function AnimeLinhas() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 40" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={100} y1={i * 3} x2={55 + (i % 4) * 6} y2={20} stroke="#ff5fa2" strokeWidth={0.25} />
      ))}
    </svg>
  )
}
