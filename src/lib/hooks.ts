import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, AJUSTES_PADRAO } from './db'
import type { Ajustes } from './types'

export function useAjustes(): Ajustes {
  const a = useLiveQuery(() => db.ajustes.get('app'), [])
  return a ?? AJUSTES_PADRAO
}

export function salvarAjustes(p: Partial<Ajustes>) {
  return db.ajustes.update('app', p)
}

export function usePrefereMenosMovimento() {
  const aj = useAjustes()
  const [sys, setSys] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const f = () => setSys(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  return sys || aj.menosMovimento
}

/** Mantém a tela ligada (Wake Lock API) enquanto `ativo` for true. */
export function useTelaLigada(ativo: boolean) {
  const lock = useRef<WakeLockSentinel | null>(null)
  const [suportado] = useState(() => typeof navigator !== 'undefined' && 'wakeLock' in navigator)
  const [ligada, setLigada] = useState(false)
  useEffect(() => {
    if (!ativo || !suportado) return
    let cancelado = false
    const pedir = async () => {
      try {
        lock.current = await navigator.wakeLock.request('screen')
        setLigada(true)
        lock.current.addEventListener('release', () => setLigada(false))
      } catch {
        setLigada(false)
      }
    }
    const vis = () => { if (document.visibilityState === 'visible' && !cancelado) pedir() }
    pedir()
    document.addEventListener('visibilitychange', vis)
    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', vis)
      lock.current?.release().catch(() => {})
      lock.current = null
    }
  }, [ativo, suportado])
  return { suportado, ligada }
}

export function useAgora(intervaloMs = 1000) {
  const [t, setT] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])
  return t
}

export function useOnline() {
  const [on, setOn] = useState(() => navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true)
    const b = () => setOn(false)
    addEventListener('online', a)
    addEventListener('offline', b)
    return () => { removeEventListener('online', a); removeEventListener('offline', b) }
  }, [])
  return on
}
