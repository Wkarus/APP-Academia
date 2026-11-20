import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { Icone, type NomeIcone } from './Icone'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export function Card({ children, className, onClick, as = 'div' }: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'section' | 'button' }) {
  const Comp = as
  return (
    <Comp
      onClick={onClick}
      className={cx('rounded-[20px] bg-s1 border border-line/60 p-4', onClick && 'text-left w-full active:scale-[0.99] transition-transform duration-200', className)}
    >
      {children}
    </Comp>
  )
}

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario' | 'fantasma' | 'perigo'
  icone?: NomeIcone
  grande?: boolean
}

export function Botao({ variante = 'primario', icone, grande, className, children, ...rest }: BotaoProps) {
  return (
    <button
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-[transform,background,opacity] duration-200 active:scale-[0.97] disabled:opacity-40 select-none',
        grande ? 'min-h-14 px-6 text-lg' : 'min-h-12 px-4 text-[0.95rem]',
        variante === 'primario' && 'bg-amber text-bg hover:brightness-105',
        variante === 'secundario' && 'bg-s2 text-tx border border-line',
        variante === 'fantasma' && 'bg-transparent text-tx2 hover:text-tx',
        variante === 'perigo' && 'bg-warn/15 text-warn border border-warn/40',
        className,
      )}
    >
      {icone && <Icone nome={icone} size={grande ? 24 : 20} />}
      {children}
    </button>
  )
}

export function BotaoIcone({ icone, rotulo, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { icone: NomeIcone; rotulo: string }) {
  return (
    <button
      aria-label={rotulo}
      title={rotulo}
      {...rest}
      className={cx('inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-s2 text-tx active:scale-95 transition-transform duration-200', className)}
    >
      <Icone nome={icone} size={22} />
    </button>
  )
}

export function Chip({ ativo, children, onClick, className }: { ativo?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={cx(
        'min-h-10 shrink-0 rounded-full px-4 text-sm font-medium border transition-colors duration-200',
        ativo ? 'bg-amber text-bg border-amber' : 'bg-s2 text-tx2 border-line',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Interruptor({ ligado, onChange, rotulo, descricao }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string; descricao?: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block font-medium">{rotulo}</span>
        {descricao && <span className="block text-sm text-tx2">{descricao}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={ligado} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-8 w-14 rounded-full bg-s3 transition-colors duration-200 peer-checked:bg-amber peer-focus-visible:outline-2 peer-focus-visible:outline-amber" />
        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-tx transition-transform duration-200 peer-checked:translate-x-6 peer-checked:bg-bg" />
      </span>
    </label>
  )
}

export function Titulo({ children, sub, acao }: { children: ReactNode; sub?: ReactNode; acao?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-3 pb-4 pt-2">
      <div>
        <h1 className="font-display text-[2.2rem] font-bold leading-none">{children}</h1>
        {sub && <p className="mt-1 text-tx2">{sub}</p>}
      </div>
      {acao}
    </header>
  )
}

export function Secao({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-tx">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  )
}

export function Esqueleto({ className }: { className?: string }) {
  return <div className={cx('skel', className)} aria-hidden="true" />
}

export function Abas<T extends string>({ abas, ativa, onChange, className }: { abas: { id: T; nome: string }[]; ativa: T; onChange: (t: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cx('flex gap-1 rounded-2xl bg-s2 p-1', className)}>
      {abas.map((a) => (
        <button
          key={a.id}
          role="tab"
          aria-selected={ativa === a.id}
          onClick={() => onChange(a.id)}
          className={cx(
            'min-h-11 flex-1 rounded-xl px-2 text-sm font-semibold transition-colors duration-200',
            ativa === a.id ? 'bg-s1 text-amber shadow' : 'text-tx2',
          )}
        >
          {a.nome}
        </button>
      ))}
    </div>
  )
}

/** Folha inferior (bottom sheet) acessível */
export function Folha({ aberta, onFechar, titulo, children, alta }: { aberta: boolean; onFechar: () => void; titulo: string; children: ReactNode; alta?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberta) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [aberta, onFechar])
  if (!aberta) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={titulo}>
      <button aria-label="Fechar" className="fade absolute inset-0 bg-black/70" onClick={onFechar} />
      <div
        ref={ref}
        tabIndex={-1}
        className={cx('sobe relative mx-auto flex w-full max-w-xl flex-col rounded-t-[24px] bg-s1 outline-none', alta ? 'h-[92dvh]' : 'max-h-[88dvh]')}
        style={{ paddingBottom: 'var(--safe-b)' }}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
          <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-s3 absolute left-1/2 top-2 -translate-x-1/2" />
          <h2 className="font-display text-2xl font-bold mt-2 truncate">{titulo}</h2>
          <BotaoIcone icone="x" rotulo="Fechar" onClick={onFechar} className="mt-2" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function Barra({ valor, max, cor = 'bg-amber', className }: { valor: number; max: number; cor?: string; className?: string }) {
  const p = Math.max(0, Math.min(100, (valor / Math.max(1, max)) * 100))
  return (
    <div className={cx('h-2.5 w-full overflow-hidden rounded-full bg-s3', className)} role="progressbar" aria-valuenow={Math.round(valor)} aria-valuemax={max}>
      <div className={cx('h-full rounded-full transition-[width] duration-300', cor)} style={{ width: `${p}%` }} />
    </div>
  )
}

export function Aviso({ tipo = 'info', children, className }: { tipo?: 'info' | 'alerta' | 'ok'; children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'flex gap-3 rounded-2xl border p-3 text-sm',
        tipo === 'info' && 'border-info/30 bg-info/10 text-tx',
        tipo === 'alerta' && 'border-warn/40 bg-warn/10 text-tx',
        tipo === 'ok' && 'border-ok/40 bg-ok/10 text-tx',
        className,
      )}
    >
      <Icone nome={tipo === 'alerta' ? 'alerta' : tipo === 'ok' ? 'check' : 'info'} size={20} className={cx('mt-0.5 shrink-0', tipo === 'alerta' ? 'text-warn' : tipo === 'ok' ? 'text-ok' : 'text-info')} />
      <div>{children}</div>
    </div>
  )
}
