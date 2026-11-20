import { useEffect, useRef } from 'react'
import { useTreino } from '../lib/treino'
import { useAgora } from '../lib/hooks'
import { bipe, vibrar } from '../lib/efeitos'
import { Icone } from './Icone'

/** Temporizador de descanso em anel. Abre sozinho ao marcar uma série. */
export function Descanso() {
  const descanso = useTreino((s) => s.descanso)
  const ajustar = useTreino((s) => s.ajustarDescanso)
  const parar = useTreino((s) => s.pararDescanso)
  const agora = useAgora(250)
  const avisou = useRef(false)

  const restante = descanso ? Math.max(0, Math.ceil((descanso.fim - agora) / 1000)) : 0
  useEffect(() => {
    if (!descanso) { avisou.current = false; return }
    if (restante === 0 && !avisou.current) {
      avisou.current = true
      vibrar([120, 80, 120])
      bipe()
      const t = setTimeout(parar, 1500)
      return () => clearTimeout(t)
    }
    if (restante > 0) avisou.current = false
  }, [restante, descanso, parar])

  if (!descanso) return null
  const R = 44
  const C = 2 * Math.PI * R
  const frac = descanso.total ? restante / descanso.total : 0
  const mm = Math.floor(restante / 60)
  const ss = String(restante % 60).padStart(2, '0')

  return (
    <div className="sobe fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl px-3" style={{ paddingBottom: 'calc(var(--safe-b) + 12px)' }} role="timer" aria-live="polite" aria-label={`Descanso: ${mm} minutos e ${ss} segundos`}>
      <div className="flex items-center gap-4 rounded-[24px] border border-line bg-s2/95 p-3 shadow-2xl backdrop-blur">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r={R} stroke="#262A33" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r={R} stroke={restante === 0 ? '#3DDC84' : '#FFC21A'} strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset 250ms linear' }}
            />
          </svg>
          <div className="tnum absolute inset-0 flex items-center justify-center font-display text-3xl font-bold">
            {restante === 0 ? 'Vai!' : `${mm}:${ss}`}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-sm text-tx2">Descanso</span>
          <div className="flex gap-2">
            <button onClick={() => ajustar(-15)} className="tnum min-h-12 flex-1 rounded-xl bg-s3 font-semibold" aria-label="Menos 15 segundos">−15</button>
            <button onClick={() => ajustar(15)} className="tnum min-h-12 flex-1 rounded-xl bg-s3 font-semibold" aria-label="Mais 15 segundos">+15</button>
            <button onClick={parar} className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-amber font-semibold text-bg" aria-label="Pular descanso">
              <Icone nome="pular" size={18} /> Pular
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
