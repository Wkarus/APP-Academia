import { Link, useNavigate } from 'react-router-dom'
import { useRotinas, rotinasDoPlano } from '../lib/consultas'
import { useAjustes } from '../lib/hooks'
import { useTreino } from '../lib/treino'
import { db } from '../lib/db'
import { voltarMeuPlano } from '../lib/planos'
import { semanaDoPlano, DIAS_CURTOS } from '../lib/datas'
import { seriesDaSemana, FOCO_PLANO } from '../content/plano'
import { PROGRAMAS, CATEGORIAS, type Programa } from '../content/programas'
import { exPorId, useExercicios } from '../lib/exercicios'
import { Titulo, Card, Botao, BotaoIcone, Secao, Esqueleto, cx } from '../components/ui'
import { Icone } from '../components/Icone'
import type { Rotina } from '../lib/types'

export default function Treinos() {
  const rotinas = useRotinas()
  const aj = useAjustes()
  const plano = aj.planoAtivo ?? 'meu'
  const programaAtivo = PROGRAMAS.find((p) => p.id === plano)
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

  const daSemana = rotinas ? rotinasDoPlano(rotinas, plano) : []
  // Com programa ativo, o cardio do Meu plano só vale nos dias sem treino de força
  const diasForca = new Set(daSemana.filter((r) => r.tipo === 'forca').flatMap((r) => r.dias))
  const diasEfetivos = (r: Rotina) => (plano !== 'meu' && r.tipo === 'cardio' ? r.dias.filter((d) => !diasForca.has(d)) : r.dias)
  const minhas = rotinas?.filter((r) => !r.programaId) ?? []
  const guardadas = rotinas?.filter((r) => !daSemana.includes(r) && r.programaId) ?? []

  return (
    <div>
      <Titulo sub={plano === 'meu' ? `Semana ${semana} · ${semana <= 2 ? '2 séries por exercício' : '3 séries por exercício'}` : `Programa ativo: ${programaAtivo?.nome}`} acao={<BotaoIcone icone="mais" rotulo="Criar rotina" onClick={nova} className="bg-amber text-bg" />}>
        Treinos
      </Titulo>

      <ComoFunciona />

      <Secao
        titulo={plano === 'meu' ? 'Sua semana · Meu plano' : `Sua semana · ${programaAtivo?.nome ?? 'Programa'}`}
        acao={plano !== 'meu' ? <button onClick={voltarMeuPlano} className="min-h-10 text-sm font-semibold text-amber">Voltar ao Meu plano</button> : undefined}
      >
        <p className="-mt-1 mb-3 text-sm text-tx2">É isso que aparece em Hoje, no dia certo. Você pode iniciar qualquer um em outro dia se precisar.</p>
        {!rotinas ? <Esqueleto className="h-40" /> : (
          <div className="space-y-3">
            {[...daSemana].sort((a, b) => (Math.min(...diasEfetivos(a), 9) - Math.min(...diasEfetivos(b), 9))).map((r) => (
              <CardRotina key={r.id} r={r} dias={diasEfetivos(r)} semana={semana} onIniciar={() => comecar(r)} />
            ))}
          </div>
        )}
      </Secao>

      {plano !== 'meu' && minhas.some((r) => r.tipo === 'forca') && (
        <Secao titulo="Meu plano (guardado)">
          <p className="-mt-1 mb-3 text-sm text-tx2">Seu plano original continua salvo, com o histórico. Toque em “Voltar ao Meu plano” quando quiser.</p>
          <div className="space-y-3">
            {minhas.filter((r) => r.tipo === 'forca').map((r) => <CardRotina key={r.id} r={r} semana={semana} onIniciar={() => comecar(r)} compacto />)}
          </div>
        </Secao>
      )}

      {guardadas.length > 0 && (
        <Secao titulo="Outras rotinas salvas">
          <div className="space-y-3">
            {guardadas.map((r) => <CardRotina key={r.id} r={r} semana={semana} onIniciar={() => comecar(r)} compacto />)}
          </div>
        </Secao>
      )}

      <Secao titulo="Programas prontos">
        <p className="-mt-1 mb-3 text-sm text-tx2">
          Cada programa é um <strong className="text-tx">plano completo alternativo</strong> — não é para fazer junto com o seu. Os nomes com “Episódio” ou “Dia 1, 2…” são os dias dentro de um mesmo programa.
        </p>
        {(Object.keys(CATEGORIAS) as Programa['categoria'][]).map((cat) => (
          <div key={cat} className="mb-5">
            <h3 className={cx('mb-2 text-sm font-semibold uppercase tracking-wider', cat === 'anime' ? 'text-[#ff5fa2]' : 'text-tx2')}>{CATEGORIAS[cat]}</h3>
            <div className="space-y-2">
              {PROGRAMAS.filter((p) => p.categoria === cat).map((p) => <CardPrograma key={p.id} p={p} ativo={p.id === plano} />)}
            </div>
          </div>
        ))}
      </Secao>
    </div>
  )
}

function ComoFunciona() {
  return (
    <details className="rounded-[20px] border border-amber/30 bg-amber/5 p-4">
      <summary className="flex min-h-10 cursor-pointer items-center gap-2 font-semibold">
        <Icone nome="info" size={20} className="text-amber" /> Como escolher o que treinar
      </summary>
      <ul className="mt-3 space-y-3 text-sm">
        <li><strong>Siga a sua semana.</strong> O treino que aparece em Hoje já está montado para trabalhar cada músculo 2× por semana com descanso entre eles. Constância vale mais que variedade.</li>
        <li><strong>Trocar um exercício:</strong> não gostou de um? No treino, toque no ícone de troca ao lado de “Como fazer” e escolha outro do mesmo músculo. Pode fazer isso a qualquer momento.</li>
        <li><strong>Trocar o treino do dia:</strong> pode fazer outro treino de vez em quando (ex.: Superior A no lugar do B). Só evite treinar o mesmo grupo dois dias seguidos — inferior depois de inferior, por exemplo.</li>
        <li><strong>Trocar de programa:</strong> os programas prontos são planos inteiros. Escolha <em>um</em>, use “Usar como meu plano” e siga por 8 a 12 semanas antes de trocar de novo. Pular de programa toda semana atrapalha a progressão de carga.</li>
        <li><strong>Não some programas:</strong> fazer seu plano + outro programa no mesmo dia é volume demais, ainda mais com calor e fadiga.</li>
      </ul>
    </details>
  )
}

function CardRotina({ r, semana, onIniciar, compacto, dias = r.dias }: { r: Rotina; semana: number; onIniciar: () => void; compacto?: boolean; dias?: number[] }) {
  const foco = FOCO_PLANO[r.id]
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1">
            {dias.length ? [...dias].sort().map((d) => <span key={d} className="rounded-md bg-amber/15 px-2 py-0.5 text-xs font-semibold text-amber">{DIAS_CURTOS[d]}</span>) : <span className="text-xs text-tx2">Sem dia fixo</span>}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold leading-tight">{r.nome}</h3>
          <p className="text-sm text-tx2">
            {r.tipo === 'cardio' ? r.subtitulo ?? 'Cardio' : `${r.itens.length} exercícios · ${r.itens[0] ? seriesDaSemana(r.itens[0], r, semana) : 0} séries cada`}
          </p>
        </div>
        <Link to={`/treinos/rotina/${r.id}`} aria-label={`Editar ${r.nome}`} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-s2"><Icone nome="lapis" size={20} /></Link>
      </div>
      {foco && !compacto && (
        <div className="mt-2 rounded-xl bg-s2 p-3 text-sm">
          <p>{foco.foco}</p>
          <p className="mt-1 text-amber">{foco.diferenca}</p>
        </div>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-tx2">{r.itens.map((i) => exPorId(i.exId)?.nome ?? '…').join(' · ')}</p>
      <Botao className="mt-3 w-full" variante={compacto ? 'secundario' : 'primario'} icone="play" onClick={onIniciar} disabled={!r.itens.length}>Iniciar</Botao>
    </Card>
  )
}

function CardPrograma({ p, ativo }: { p: Programa; ativo: boolean }) {
  const anime = p.categoria === 'anime'
  return (
    <Link
      to={`/treinos/programa/${p.id}`}
      className={cx(
        'relative block overflow-hidden rounded-[20px] border p-4 transition-transform duration-200 active:scale-[0.99]',
        ativo ? 'border-amber bg-amber/10' : anime ? 'border-[#ff5fa2]/50 bg-[radial-gradient(circle_at_85%_20%,rgba(255,95,162,0.35),transparent_45%),linear-gradient(135deg,#1a1030,#14161B)]' : 'border-line/60 bg-s1',
      )}
    >
      {anime && !ativo && <AnimeLinhas />}
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className={cx('font-display text-2xl font-bold leading-tight', anime && 'italic tracking-wide')}>{p.nome}</h4>
          <p className="text-sm text-tx2">{p.dias}x/semana · {p.nivel}</p>
        </div>
        {ativo ? <span className="shrink-0 rounded-full bg-amber px-3 py-1 text-xs font-bold text-bg">EM USO</span> : <Icone nome="seta" className="shrink-0 text-tx2" />}
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

