import { useEffect, useState } from 'react'
import type { Exercicio, Musculo } from './types'

export const MUSCULO_PT: Record<Musculo, string> = {
  abdominals: 'Abdômen', abductors: 'Abdutores', adductors: 'Adutores', biceps: 'Bíceps',
  calves: 'Panturrilhas', chest: 'Peitoral', forearms: 'Antebraços', glutes: 'Glúteos',
  hamstrings: 'Posteriores', lats: 'Dorsais', 'lower back': 'Lombar', 'middle back': 'Meio das costas',
  neck: 'Pescoço', quadriceps: 'Quadríceps', shoulders: 'Ombros', traps: 'Trapézio', triceps: 'Tríceps',
}

export const NIVEL_PT = { iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado' } as const

let cache: Exercicio[] | null = null
let carregando: Promise<Exercicio[]> | null = null
let mapa: Map<string, Exercicio> | null = null

export function urlPublica(rel?: string | null) {
  if (!rel) return ''
  if (/^https?:/.test(rel)) return rel
  return import.meta.env.BASE_URL + rel
}

export function carregarExercicios(): Promise<Exercicio[]> {
  if (cache) return Promise.resolve(cache)
  if (!carregando) {
    carregando = fetch(urlPublica('data/exercises.json'))
      .then((r) => r.json())
      .then((j: { exercicios: Exercicio[] }) => {
        cache = j.exercicios
        mapa = new Map(cache.map((e) => [e.id, e]))
        return cache
      })
  }
  return carregando
}

export function useExercicios() {
  const [lista, setLista] = useState<Exercicio[] | null>(cache)
  useEffect(() => {
    if (!cache) carregarExercicios().then(setLista)
  }, [])
  return lista
}

export function useExercicio(id: string | null | undefined) {
  const lista = useExercicios()
  if (!lista || !id || !mapa) return null
  return mapa.get(id) ?? null
}

export function exPorId(id: string) {
  return mapa?.get(id) ?? null
}

/** Remove acentos para busca */
export function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
