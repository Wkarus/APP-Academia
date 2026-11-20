import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'
import { Botao } from './ui'

/** Avisa quando há versão nova do app e quando ele está pronto para uso offline. */
export function AtualizacaoPWA() {
  const {
    needRefresh: [precisa, setPrecisa],
    offlineReady: [offline, setOffline],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, reg) {
      // Procura atualização a cada hora enquanto o app estiver aberto
      if (reg) setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
    },
  })

  // "Pronto para offline" é só informativo: some sozinho para não cobrir o cabeçalho
  useEffect(() => {
    if (!offline) return
    const t = setTimeout(() => setOffline(false), 4000)
    return () => clearTimeout(t)
  }, [offline, setOffline])

  if (!precisa && !offline) return null
  return (
    <div className="sobe fixed inset-x-0 top-0 z-[60] mx-auto max-w-xl p-3" style={{ paddingTop: 'calc(var(--safe-t) + 12px)' }} role="status">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-s2 p-3 shadow-xl">
        <p className="flex-1 text-sm">{precisa ? 'Nova versão do FORJA disponível.' : 'Pronto para usar offline.'}</p>
        {precisa ? (
          <Botao onClick={() => updateServiceWorker(true)}>Atualizar</Botao>
        ) : (
          <Botao variante="secundario" onClick={() => { setOffline(false); setPrecisa(false) }}>Ok</Botao>
        )}
      </div>
    </div>
  )
}
