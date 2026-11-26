import type { ItemRotina, Rotina } from '../lib/types'

const f = (exId: string, repMin = 8, repMax = 12, descansoSeg = 90): ItemRotina => ({
  exId, series: 3, repMin, repMax, descansoSeg,
})
const braco = (exId: string) => f(exId, 12, 15, 60)
const cardio = (exId: string, minutos = 25): ItemRotina => ({
  exId, series: 1, repMin: 0, repMax: 0, descansoSeg: 0, minutos,
})

/** Meu plano — 4 dias de força + 2 de cardio leve, treino às 9h. */
export const PLANO: Rotina[] = [
  {
    id: 'plano-sup-a', nome: 'Superior A', subtitulo: 'Peito, costas, ombro e braços', dias: [1], tipo: 'forca', progressaoPlano: true, ordem: 1,
    itens: [
      f('Dumbbell_Bench_Press'), f('One-Arm_Dumbbell_Row'), braco('Seated_Dumbbell_Press'),
      f('Wide-Grip_Lat_Pulldown'), braco('EZ-Bar_Curl'), braco('Standing_Dumbbell_Triceps_Extension'),
    ],
  },
  {
    id: 'plano-inf-a', nome: 'Inferior A', subtitulo: 'Quadríceps, posteriores, glúteos e core', dias: [2], tipo: 'forca', progressaoPlano: true, ordem: 2,
    itens: [
      f('Goblet_Squat'), f('Stiff-Legged_Dumbbell_Deadlift'), f('Dumbbell_Lunges'),
      f('Butt_Lift_Bridge'), f('Standing_Dumbbell_Calf_Raise', 10, 15, 60), f('Crunches', 12, 15, 60),
    ],
  },
  {
    id: 'plano-cardio', nome: 'Cardio leve', subtitulo: '20-30 min moderado, sem HIIT', dias: [3, 6], tipo: 'cardio', ordem: 3,
    itens: [cardio('Bicycling_Stationary', 25), cardio('Elliptical_Trainer', 25)],
  },
  {
    id: 'plano-sup-b', nome: 'Superior B', subtitulo: 'Mesmo estilo do A, com peito alto e ombro largo', dias: [4], tipo: 'forca', progressaoPlano: true, ordem: 4,
    itens: [
      f('Incline_Dumbbell_Press'), f('Seated_Cable_Rows'), braco('Arnold_Dumbbell_Press'),
      f('Underhand_Cable_Pulldowns'), braco('Side_Lateral_Raise'), braco('EZ-Bar_Skullcrusher'),
    ],
  },
  {
    id: 'plano-inf-b', nome: 'Inferior B', subtitulo: 'Posteriores, glúteos, unilaterais e core', dias: [5], tipo: 'forca', progressaoPlano: true, ordem: 5,
    itens: [
      f('Romanian_Deadlift'), f('Split_Squat_with_Dumbbells'), f('Dumbbell_Step_Ups'),
      f('Dumbbell_Seated_One-Leg_Calf_Raise', 10, 15, 60), f('Flat_Bench_Lying_Leg_Raise', 10, 15, 60),
    ],
  },
]

/** Exercícios da 1ª versão do Superior B — usados para atualizar quem ainda não personalizou */
export const SUP_B_V1 = ['Incline_Dumbbell_Press', 'Bent_Over_Two-Dumbbell_Row', 'Side_Lateral_Raise', 'Close-Grip_Front_Lat_Pulldown', 'Hammer_Curls', 'Triceps_Pushdown']

/** Séries efetivas no "Meu plano": semanas 1-2 = 2 séries; da semana 3 = 3 séries. */
export function seriesDaSemana(item: ItemRotina, rotina: Rotina, semana: number) {
  if (rotina.tipo === 'cardio') return 1
  if (!rotina.progressaoPlano) return item.series
  return semana <= 2 ? 2 : 3
}

/** O que cada dia do Meu plano trabalha de diferente (mostrado em Treinos) */
export const FOCO_PLANO: Record<string, { foco: string; diferenca: string }> = {
  'plano-sup-a': {
    foco: 'Peito no meio (supino reto), costas em largura (puxada aberta) e espessura (remada unilateral), ombro pela frente (desenvolvimento), bíceps e tríceps.',
    diferenca: 'É o dia mais "pesado" de empurrar e puxar.',
  },
  'plano-sup-b': {
    foco: 'Parte de cima do peito (supino inclinado), meio das costas (remada sentada na polia), ombro completo (desenvolvimento Arnold), dorsal e bíceps (puxada supinada), lateral do ombro (elevação lateral) e tríceps (testa com barra W).',
    diferenca: 'Mesmo estilo pesado do A, em outros ângulos. É o único dia com elevação lateral (ombro mais largo) e peito superior.',
  },
  'plano-inf-a': {
    foco: 'Quadríceps (agachamento goblet, afundo), posteriores (stiff), glúteos (ponte), panturrilha e abdômen.',
    diferenca: 'Foco na frente da coxa.',
  },
  'plano-inf-b': {
    foco: 'Posteriores e glúteos (terra romeno), pernas uma de cada vez (búlgaro, step-up), panturrilha sentada (sóleo) e abdômen inferior.',
    diferenca: 'Foco na parte de trás da coxa e no equilíbrio de cada perna.',
  },
  'plano-cardio': {
    foco: 'Coração e recuperação: 20-30 min em ritmo de conversa.',
    diferenca: 'Leve de propósito — não é para cansar.',
  },
}
