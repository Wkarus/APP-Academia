import { Component, type ReactNode } from 'react'

/** Evita tela em branco: se algo falhar (ex.: parte do app não baixada offline), oferece recarregar. */
export class LimiteErro extends Component<{ children: ReactNode }, { erro: Error | null }> {
  state = { erro: null as Error | null }
  static getDerivedStateFromError(erro: Error) {
    return { erro }
  }
  render() {
    if (!this.state.erro) return this.props.children
    const offline = !navigator.onLine
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-3xl font-bold">Ops, algo não carregou</p>
        <p className="text-tx2">
          {offline ? 'Você está offline e esta parte do app ainda não foi salva. Conecte-se uma vez e ela fica disponível offline.' : 'Tente recarregar. Seus dados continuam salvos no aparelho.'}
        </p>
        <button className="min-h-12 rounded-2xl bg-amber px-6 font-semibold text-bg" onClick={() => { location.hash = '#/'; location.reload() }}>Recarregar</button>
      </div>
    )
  }
}
