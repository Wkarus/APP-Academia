import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icone, type NomeIcone } from './Icone'
import { cx } from './ui'
import { useTreino } from '../lib/treino'
import { Link } from 'react-router-dom'

const ABAS: { to: string; nome: string; icone: NomeIcone }[] = [
  { to: '/', nome: 'Hoje', icone: 'hoje' },
  { to: '/treinos', nome: 'Treinos', icone: 'halter' },
  { to: '/exercicios', nome: 'Exercícios', icone: 'busca' },
  { to: '/dieta', nome: 'Dieta', icone: 'prato' },
  { to: '/progresso', nome: 'Progresso', icone: 'grafico' },
]

export function AvisoFixo() {
  return (
    <p className="px-1 pt-6 text-center text-xs leading-snug text-tx2">
      App informativo. Não substitui médico, nutricionista ou educador físico.
    </p>
  )
}

export function Layout() {
  const loc = useLocation()
  const ativa = useTreino((s) => s.ativa)
  return (
    <div className="mx-auto min-h-dvh max-w-xl" style={{ paddingTop: 'var(--safe-t)' }}>
      <main key={loc.pathname} className="tela-enter px-4 pb-[calc(var(--nav-h)+var(--safe-b)+24px)]">
        <Outlet />
        <AvisoFixo />
      </main>
      {ativa && (
        <Link
          to="/treino"
          className="fixed inset-x-0 z-30 mx-auto flex max-w-xl items-center justify-between gap-3 bg-amber px-4 py-3 font-semibold text-bg"
          style={{ bottom: 'calc(var(--nav-h) + var(--safe-b))' }}
        >
          <span className="flex items-center gap-2"><Icone nome="halter" size={20} /> Treino em andamento: {ativa.nome}</span>
          <span className="flex items-center">Voltar <Icone nome="seta" size={18} /></span>
        </Link>
      )}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl border-t border-line/70 bg-bg/95 backdrop-blur"
        style={{ paddingBottom: 'var(--safe-b)' }}
      >
        <ul className="grid h-[var(--nav-h)] grid-cols-5">
          {ABAS.map((a) => (
            <li key={a.to}>
              <NavLink
                to={a.to}
                end={a.to === '/'}
                className={({ isActive }) =>
                  cx('flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors duration-200', isActive ? 'text-amber' : 'text-tx2')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200', isActive && 'bg-amber/15')}>
                      <Icone nome={a.icone} size={22} strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    {a.nome}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
