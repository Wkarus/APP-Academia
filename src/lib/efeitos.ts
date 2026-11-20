import confetti from 'canvas-confetti'
import { db } from './db'

async function pode<K extends 'vibrar'>(k: K) {
  const a = await db.ajustes.get('app')
  return a ? a[k] : true
}

export async function vibrar(padrao: number | number[] = 15) {
  if (!(await pode('vibrar'))) return
  try { navigator.vibrate?.(padrao) } catch { /* sem suporte (iPhone) */ }
}

function menosMovimento() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('sem-movimento')
}

/** Confete discreto em recorde pessoal */
export function confeteRecorde() {
  if (menosMovimento()) return
  const base = { spread: 60, startVelocity: 32, ticks: 140, gravity: 1.1, scalar: 0.8, colors: ['#FFC21A', '#F2F3F5', '#3DDC84'], disableForReducedMotion: true }
  confetti({ ...base, particleCount: 40, origin: { x: 0.2, y: 0.75 }, angle: 60 })
  confetti({ ...base, particleCount: 40, origin: { x: 0.8, y: 0.75 }, angle: 120 })
}

let ctx: AudioContext | null = null
/** Bipe curto no fim do descanso */
export function bipe() {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 880
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.4)
  } catch { /* sem áudio */ }
}
