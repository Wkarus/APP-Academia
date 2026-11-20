import { useState } from 'react'
import type { Exercicio } from '../lib/types'
import { urlPublica } from '../lib/exercicios'
import { usePrefereMenosMovimento } from '../lib/hooks'
import { Icone } from './Icone'
import { cx } from './ui'

/**
 * Mostra a animação do exercício em loop.
 * Suporta: WebP animado local (padrão), MP4 em loop (para biblioteca licenciada no futuro),
 * GIF, e o modo "quadros" (imagens de início/fim alternando).
 * Com "menos movimento" ligado, mostra a imagem parada com botão para tocar.
 */
export function MidiaExercicio({ ex, className, tamanho = 'md', onClick }: { ex: Exercicio; className?: string; tamanho?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const menosMov = usePrefereMenosMovimento()
  const [tocar, setTocar] = useState(false)
  const [carregou, setCarregou] = useState(false)
  const m = ex.media
  const animar = !menosMov || tocar
  const alt = `Demonstração: ${ex.nome}`

  let conteudo: React.ReactNode
  if (!m || m.tipo === 'nenhuma') {
    conteudo = (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-s2 text-tx2">
        <Icone nome="halter" size={tamanho === 'sm' ? 22 : 40} />
        {tamanho !== 'sm' && <span className="text-xs">Sem animação — veja os passos</span>}
      </div>
    )
  } else if (m.tipo === 'mp4' && m.url) {
    conteudo = animar ? (
      <video src={urlPublica(m.url)} poster={urlPublica(m.poster)} autoPlay loop muted playsInline className="h-full w-full object-cover" onLoadedData={() => setCarregou(true)} aria-label={alt} />
    ) : (
      <img src={urlPublica(m.poster)} alt={alt} className="h-full w-full object-cover" onLoad={() => setCarregou(true)} />
    )
  } else if (m.tipo === 'quadros' && m.quadros?.length) {
    conteudo = (
      <div className="relative h-full w-full bg-white">
        <img src={urlPublica(m.quadros[0])} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onLoad={() => setCarregou(true)} />
        {m.quadros[1] && animar && <img src={urlPublica(m.quadros[1])} alt="" className="quadro-b absolute inset-0 h-full w-full object-cover" loading="lazy" />}
      </div>
    )
  } else {
    const src = tamanho === 'sm' || !animar ? m.poster ?? m.url : m.url
    conteudo = <img src={urlPublica(src)} alt={alt} className="h-full w-full object-cover" loading={tamanho === 'sm' ? 'lazy' : 'eager'} decoding="async" onLoad={() => setCarregou(true)} />
  }

  return (
    <div
      className={cx('relative overflow-hidden bg-s2', tamanho === 'sm' ? 'rounded-xl' : 'rounded-[20px]', onClick && 'cursor-zoom-in', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Ampliar animação de ${ex.nome}` : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      {!carregou && m?.tipo !== 'nenhuma' && <div className="skel absolute inset-0 rounded-none" />}
      {conteudo}
      {menosMov && !tocar && tamanho !== 'sm' && m?.tipo !== 'nenhuma' && (
        <button
          onClick={(e) => { e.stopPropagation(); setTocar(true) }}
          className="absolute bottom-2 right-2 inline-flex min-h-10 items-center gap-1 rounded-full bg-bg/80 px-3 text-sm font-semibold text-tx"
        >
          <Icone nome="play" size={16} /> Tocar
        </button>
      )}
    </div>
  )
}
