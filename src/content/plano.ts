import type { ItemRotina, Rotina } from '../lib/types'

const f = (exId: string, repMin = 8, repMax = 12, descansoSeg = 90): ItemRotina => ({
  exId, series: 3, repMin, repMax, descansoSeg,
})
const braco = (exId: string) => f(exId, 12, 15, 60)
const cardio = (exId: string, minutos = 25): ItemRotina => ({
  exId, series: 1, repMin: 0, repMax: 0, descansoSeg: 0, minutos,
})

/** Rack com crossover e barra fixa (v1.7) */
export const CROSSOVER: ItemRotina = { exId: 'Cable_Crossover', series: 3, repMin: 10, repMax: 15, descansoSeg: 60, nota: 'de cima para baixo' }
export const BARRA_FIXA: ItemRotina = { exId: 'Pullups', series: 3, repMin: 5, repMax: 10, descansoSeg: 120, nota: '(com elástico ou só a descida, se precisar)' }

/** Core nos dias de superior: prancha (anti-extensão) e Pallof (anti-rotação) */
export const PRANCHA: ItemRotina = { exId: 'Plank', series: 3, repMin: 30, repMax: 45, descansoSeg: 45, unidade: 'seg' }
export const PALLOF: ItemRotina = { exId: 'Pallof_Press', series: 3, repMin: 10, repMax: 12, descansoSeg: 45, nota: 'cada lado' }

/** Circuito de core dos dias de cardio (~10 min, descanso curto) */
export const CIRCUITO_CORE: ItemRotina[] = [
  { exId: 'Dead_Bug', series: 3, repMin: 8, repMax: 12, descansoSeg: 30, nota: 'cada lado' },
  { exId: 'Side_Bridge', series: 3, repMin: 20, repMax: 30, descansoSeg: 30, unidade: 'seg', nota: 'cada lado' },
  { exId: 'Reverse_Crunch', series: 3, repMin: 10, repMax: 15, descansoSeg: 30 },
]

/**
 * Corrida progressiva (sábado). Começa alternando trote e caminhada e evolui até correr direto.
 * Sempre em ritmo de conversa — não é HIIT. Pensado para quem tem sensibilidade ao calor.
 */
export function faseCorrida(semana: number) {
  if (semana <= 2) return 'Fase 1: 8× (1 min trotando + 2 min caminhando) = 24 min'
  if (semana <= 4) return 'Fase 2: 8× (2 min trotando + 1 min caminhando) = 24 min'
  if (semana <= 6) return 'Fase 3: 5× (4 min trotando + 1 min caminhando) = 25 min'
  if (semana <= 8) return 'Fase 4: 2× (10 min trotando + 2 min caminhando) = 24 min'
  return 'Fase 5: 20-30 min de corrida contínua leve'
}
export const CORRIDA: ItemRotina = { exId: 'Jogging_Treadmill', series: 1, repMin: 0, repMax: 0, descansoSeg: 0, minutos: 25, nota: 'fase-corrida' }

/** Meu plano — 4 dias de força + 2 de cardio leve, treino às 9h. */
export const PLANO: Rotina[] = [
  {
    id: 'plano-sup-a', nome: 'Superior A', subtitulo: 'Peito, costas, ombro e braços', dias: [1], tipo: 'forca', progressaoPlano: true, ordem: 1,
    itens: [
      f('Dumbbell_Bench_Press'), CROSSOVER, f('One-Arm_Dumbbell_Row'), braco('Seated_Dumbbell_Press'),
      BARRA_FIXA, braco('EZ-Bar_Curl'), braco('Standing_Dumbbell_Triceps_Extension'),
      PRANCHA,
    ],
  },
  {
    id: 'plano-inf-a', nome: 'Inferior A', subtitulo: 'Curto (~30 min): frente da coxa, posteriores e panturrilha', dias: [2], tipo: 'forca', progressaoPlano: true, ordem: 2,
    itens: [
      f('Goblet_Squat'), f('Stiff-Legged_Dumbbell_Deadlift'), f('Dumbbell_Lunges'),
      f('Standing_Dumbbell_Calf_Raise', 10, 15, 60),
    ],
  },
  {
    id: 'plano-cardio', nome: 'Cardio leve + core', subtitulo: '20-30 min moderado (escolha um aparelho) + 10 min de abdômen', dias: [3], tipo: 'cardio', ordem: 3,
    itens: [cardio('Bicycling_Stationary', 25), cardio('Elliptical_Trainer', 25), ...CIRCUITO_CORE],
  },
  {
    id: 'plano-sup-b', nome: 'Superior B', subtitulo: 'Mesmo estilo do A, com peito alto e ombro largo', dias: [4], tipo: 'forca', progressaoPlano: true, ordem: 4,
    itens: [
      f('Incline_Dumbbell_Press'), f('Seated_Cable_Rows'), braco('Arnold_Dumbbell_Press'),
      f('Underhand_Cable_Pulldowns'), braco('Side_Lateral_Raise'), braco('EZ-Bar_Skullcrusher'),
      PALLOF,
    ],
  },
  {
    id: 'plano-inf-b', nome: 'Inferior B', subtitulo: 'Curto (~30 min): posteriores, glúteos e uma perna de cada vez', dias: [5], tipo: 'forca', progressaoPlano: true, ordem: 5,
    itens: [
      f('Romanian_Deadlift'), f('Split_Squat_with_Dumbbells'), f('Butt_Lift_Bridge'),
      f('Dumbbell_Seated_One-Leg_Calf_Raise', 10, 15, 60),
    ],
  },
  {
    id: 'plano-corrida', nome: 'Corrida + core', subtitulo: 'Trote e caminhada progressivos, em ritmo de conversa + 10 min de abdômen', dias: [6], tipo: 'cardio', ordem: 6,
    itens: [CORRIDA, ...CIRCUITO_CORE],
  },
]

/** 1ª versão dos dias de perna — usada para atualizar quem ainda não personalizou */
export const INF_A_V1 = ['Goblet_Squat', 'Stiff-Legged_Dumbbell_Deadlift', 'Dumbbell_Lunges', 'Butt_Lift_Bridge', 'Standing_Dumbbell_Calf_Raise', 'Crunches']
export const INF_B_V1 = ['Romanian_Deadlift', 'Split_Squat_with_Dumbbells', 'Dumbbell_Step_Ups', 'Dumbbell_Seated_One-Leg_Calf_Raise', 'Flat_Bench_Lying_Leg_Raise']

/** Exercícios da 1ª versão do Superior B — usados para atualizar quem ainda não personalizou */
export const SUP_B_V1 = ['Incline_Dumbbell_Press', 'Bent_Over_Two-Dumbbell_Row', 'Side_Lateral_Raise', 'Close-Grip_Front_Lat_Pulldown', 'Hammer_Curls', 'Triceps_Pushdown']

/** Séries efetivas no "Meu plano": semanas 1-2 = 2 séries; da semana 3 = 3 séries. */
export function seriesDaSemana(item: ItemRotina, rotina: Rotina, semana: number) {
  if (item.minutos) return 1
  if (rotina.tipo === 'cardio') return item.series
  if (!rotina.progressaoPlano) return item.series
  return semana <= 2 ? 2 : 3
}

/** O que cada dia do Meu plano trabalha de diferente (mostrado em Treinos) */
export const FOCO_PLANO: Record<string, { foco: string; diferenca: string }> = {
  'plano-sup-a': {
    foco: 'Peito no meio (supino reto) e parte de baixo (crossover de cima para baixo), costas em largura (barra fixa) e espessura (remada unilateral), ombro pela frente (desenvolvimento), bíceps e tríceps.',
    diferenca: 'É o dia mais "pesado" de empurrar e puxar. Fecha com prancha (abdômen segurando a coluna).',
  },
  'plano-sup-b': {
    foco: 'Parte de cima do peito (supino inclinado), meio das costas (remada sentada na polia), ombro completo (desenvolvimento Arnold), dorsal e bíceps (puxada supinada), lateral do ombro (elevação lateral) e tríceps (testa com barra W).',
    diferenca: 'Mesmo estilo pesado do A, em outros ângulos. É o único dia com elevação lateral (ombro mais largo) e peito superior. Fecha com Pallof (abdômen e oblíquos resistindo à rotação).',
  },
  'plano-inf-a': {
    foco: 'Quadríceps (agachamento goblet, afundo), posteriores (stiff) e panturrilha. Só 4 exercícios, ~30 min.',
    diferenca: 'Foco na frente da coxa. Curto de propósito para não pular: melhor 30 min feitos que 60 min planejados.',
  },
  'plano-inf-b': {
    foco: 'Posteriores e glúteos (terra romeno, ponte), uma perna de cada vez (búlgaro) e panturrilha sentada. Só 4 exercícios, ~30 min.',
    diferenca: 'Foco na parte de trás da coxa e glúteos. O abdômen saiu daqui e foi para os dias de superior e de cardio.',
  },
  'plano-corrida': {
    foco: 'Corrida progressiva: começa alternando trote e caminhada e, a cada 2 semanas, o trote aumenta. Na semana 9 você corre 20-30 min direto. Depois, o mesmo circuito de core.',
    diferenca: 'Ritmo de conversa sempre. Calor: corra cedo, à noite ou na esteira com ventilador, e leve água. Se a fase pesar, repita a semana — não pule de fase.',
  },
  'plano-cardio': {
    foco: 'Coração e recuperação: 20-30 min em ritmo de conversa (bicicleta OU elíptico — escolha um). Depois, circuito de core: dead bug, prancha lateral e abdominal reverso.',
    diferenca: 'Cardio leve de propósito. O core aqui garante abdômen mesmo se você pular um dia de perna.',
  },
}
