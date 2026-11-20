import type { ItemRotina } from '../lib/types'

export interface Programa {
  id: string
  nome: string
  categoria: 'classico' | 'forca' | 'estetica' | 'casa' | 'anime'
  resumo: string
  praQuem: string
  dias: number
  duracaoMin: string
  nivel: string
  progressao: string
  observacao?: string
  fonte: { nome: string; url: string }[]
  rotinas: { nome: string; itens: ItemRotina[] }[]
}

const s = (exId: string, series: number, repMin: number, repMax = repMin, descansoSeg = 90): ItemRotina => ({ exId, series, repMin, repMax, descansoSeg })

export const CATEGORIAS: Record<Programa['categoria'], string> = {
  classico: 'Clássicos de hipertrofia',
  forca: 'Força (barra)',
  estetica: 'Estética',
  casa: 'Calistenia e casa',
  anime: 'Modo anime',
}

export const PROGRAMAS: Programa[] = [
  {
    id: 'upper-lower',
    nome: 'Upper / Lower 4x',
    categoria: 'classico',
    resumo: 'Divide o corpo em parte de cima e parte de baixo, cada uma treinada duas vezes por semana.',
    praQuem: 'Quem já treina há alguns meses e tem 4 dias livres. Bom equilíbrio entre volume e recuperação.',
    dias: 4, duracaoMin: '50-65 min', nivel: 'Iniciante a intermediário',
    progressao: 'Faixa de repetições (dupla progressão): quando todas as séries chegarem ao topo da faixa, suba a carga no próximo treino (2-2,5 kg em halteres/barra; menos em braços).',
    fonte: [
      { nome: 'Schoenfeld, Ogborn & Krieger (2016) — frequência de treino e hipertrofia, Sports Medicine', url: 'https://pubmed.ncbi.nlm.nih.gov/27102172/' },
      { nome: 'ACSM Position Stand (2009) — modelos de progressão no treino resistido', url: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' },
    ],
    rotinas: [
      { nome: 'Upper 1', itens: [s('Barbell_Bench_Press_-_Medium_Grip', 3, 6, 10, 120), s('Bent_Over_Barbell_Row', 3, 6, 10, 120), s('Seated_Dumbbell_Press', 3, 8, 12), s('Wide-Grip_Lat_Pulldown', 3, 8, 12), s('EZ-Bar_Curl', 2, 10, 15, 60), s('Triceps_Pushdown', 2, 10, 15, 60)] },
      { nome: 'Lower 1', itens: [s('Barbell_Full_Squat', 3, 6, 10, 150), s('Romanian_Deadlift', 3, 8, 12, 120), s('Dumbbell_Lunges', 2, 10, 12), s('Standing_Dumbbell_Calf_Raise', 3, 10, 15, 60), s('Plank', 3, 30, 45, 60)] },
      { nome: 'Upper 2', itens: [s('Incline_Dumbbell_Press', 3, 8, 12), s('One-Arm_Dumbbell_Row', 3, 8, 12), s('Side_Lateral_Raise', 3, 12, 15, 60), s('Close-Grip_Front_Lat_Pulldown', 3, 10, 12), s('Hammer_Curls', 2, 10, 15, 60), s('EZ-Bar_Skullcrusher', 2, 10, 15, 60)] },
      { nome: 'Lower 2', itens: [s('Barbell_Deadlift', 3, 5, 8, 180), s('Goblet_Squat', 3, 10, 12), s('Split_Squat_with_Dumbbells', 2, 8, 12), s('Barbell_Hip_Thrust', 3, 8, 12), s('Hanging_Leg_Raise', 3, 10, 15, 60)] },
    ],
  },
  {
    id: 'ppl',
    nome: 'Push / Pull / Legs',
    categoria: 'classico',
    resumo: 'Empurrar, puxar e pernas. Pode rodar 3x (uma vez cada) ou 6x por semana (duas vezes cada).',
    praQuem: 'Intermediários com boa recuperação. A versão de 6 dias exige sono e alimentação em dia.',
    dias: 6, duracaoMin: '50-70 min', nivel: 'Intermediário',
    progressao: 'Primeiro exercício de cada dia: progressão linear (some 2,5 kg quando cumprir todas as séries). Acessórios: dupla progressão dentro da faixa.',
    observacao: 'Com 3 dias, faça Push, Pull e Legs em dias alternados.',
    fonte: [
      { nome: 'r/Fitness — PPL de progressão linear (Metallicadpa)', url: 'https://www.reddit.com/r/Fitness/comments/37ylk5/a_linear_progression_based_ppl_program_for/' },
    ],
    rotinas: [
      { nome: 'Push', itens: [s('Barbell_Bench_Press_-_Medium_Grip', 4, 5, 8, 150), s('Seated_Dumbbell_Press', 3, 8, 12), s('Incline_Dumbbell_Press', 3, 8, 12), s('Side_Lateral_Raise', 3, 12, 20, 60), s('Triceps_Pushdown', 3, 10, 15, 60), s('Standing_Dumbbell_Triceps_Extension', 3, 10, 15, 60)] },
      { nome: 'Pull', itens: [s('Barbell_Deadlift', 1, 5, 5, 180), s('Wide-Grip_Lat_Pulldown', 3, 8, 12), s('Seated_Cable_Rows', 3, 8, 12), s('Face_Pull', 3, 15, 20, 60), s('EZ-Bar_Curl', 3, 8, 12, 60), s('Hammer_Curls', 3, 10, 15, 60)] },
      { nome: 'Legs', itens: [s('Barbell_Full_Squat', 3, 5, 8, 150), s('Romanian_Deadlift', 3, 8, 12, 120), s('Split_Squat_with_Dumbbells', 3, 8, 12), s('Barbell_Hip_Thrust', 3, 8, 12), s('Standing_Dumbbell_Calf_Raise', 4, 10, 15, 60)] },
    ],
  },
  {
    id: 'full-body-3x',
    nome: 'Full Body 3x',
    categoria: 'classico',
    resumo: 'Corpo inteiro três vezes por semana alternando os treinos A e B.',
    praQuem: 'Iniciantes ou quem tem só 3 dias. Muita prática dos movimentos básicos.',
    dias: 3, duracaoMin: '45-60 min', nivel: 'Iniciante',
    progressao: 'Linear: some 2,5 kg (membros superiores) ou 5 kg (agachamento/terra) a cada treino em que fechar todas as repetições. Ao travar 3 vezes, reduza 10% e suba de novo.',
    fonte: [
      { nome: 'r/Fitness wiki — Basic Beginner Routine', url: 'https://thefitness.wiki/routines/r-fitness-basic-beginner-routine/' },
    ],
    rotinas: [
      { nome: 'Treino A', itens: [s('Barbell_Full_Squat', 3, 5, 8, 150), s('Barbell_Bench_Press_-_Medium_Grip', 3, 5, 8, 120), s('Bent_Over_Barbell_Row', 3, 5, 8, 120), s('Plank', 2, 30, 45, 60)] },
      { nome: 'Treino B', itens: [s('Barbell_Deadlift', 1, 5, 5, 180), s('Standing_Military_Press', 3, 5, 8, 120), s('Wide-Grip_Lat_Pulldown', 3, 8, 12), s('Dumbbell_Lunges', 2, 10, 12), s('Hanging_Leg_Raise', 2, 10, 15, 60)] },
    ],
  },
  {
    id: 'phul',
    nome: 'PHUL',
    categoria: 'forca',
    resumo: 'Power Hypertrophy Upper Lower: dois dias pesados (força) e dois de volume (hipertrofia).',
    praQuem: 'Intermediários que querem ficar mais fortes e maiores ao mesmo tempo. 4 dias por semana.',
    dias: 4, duracaoMin: '60-75 min', nivel: 'Intermediário',
    progressao: 'Dias de força (3-5 reps): suba a carga quando completar todas as séries no topo. Dias de hipertrofia (8-12): dupla progressão.',
    observacao: 'Adaptado à sua academia: leg press e cadeiras substituídos por agachamento, búlgaro e stiff.',
    fonte: [
      { nome: 'Brandon Campbell — PHUL Workout (Muscle & Strength)', url: 'https://www.muscleandstrength.com/workouts/phul-workout' },
    ],
    rotinas: [
      { nome: 'Upper Força', itens: [s('Barbell_Bench_Press_-_Medium_Grip', 4, 3, 5, 180), s('Incline_Dumbbell_Press', 3, 6, 10, 120), s('Bent_Over_Barbell_Row', 4, 3, 5, 180), s('Wide-Grip_Lat_Pulldown', 3, 6, 10), s('Standing_Military_Press', 3, 5, 8, 120), s('EZ-Bar_Curl', 2, 6, 10, 60), s('EZ-Bar_Skullcrusher', 2, 6, 10, 60)] },
      { nome: 'Lower Força', itens: [s('Barbell_Full_Squat', 4, 3, 5, 180), s('Barbell_Deadlift', 3, 3, 5, 180), s('Split_Squat_with_Dumbbells', 3, 8, 10), s('Standing_Barbell_Calf_Raise', 4, 6, 10, 60)] },
      { nome: 'Upper Volume', itens: [s('Incline_Dumbbell_Press', 4, 8, 12), s('Dumbbell_Flyes', 3, 8, 12), s('Seated_Cable_Rows', 4, 8, 12), s('One-Arm_Dumbbell_Row', 3, 8, 12), s('Side_Lateral_Raise', 3, 10, 15, 60), s('Incline_Dumbbell_Curl', 3, 8, 12, 60), s('Triceps_Pushdown_-_Rope_Attachment', 3, 8, 12, 60)] },
      { nome: 'Lower Volume', itens: [s('Front_Barbell_Squat', 4, 8, 12, 120), s('Dumbbell_Lunges', 3, 8, 12), s('Stiff-Legged_Dumbbell_Deadlift', 3, 10, 12), s('Barbell_Hip_Thrust', 3, 10, 12), s('Dumbbell_Seated_One-Leg_Calf_Raise', 4, 10, 15, 60)] },
    ],
  },
  {
    id: 'gzclp',
    nome: 'GZCLP',
    categoria: 'forca',
    resumo: 'Método em três níveis (T1 pesado, T2 médio, T3 leve) com progressão linear e mudança de esquema quando trava.',
    praQuem: 'Iniciantes que querem força nos levantamentos básicos com um plano para quando a progressão travar. 3-4 dias.',
    dias: 4, duracaoMin: '50-70 min', nivel: 'Iniciante a intermediário',
    progressao: 'T1: 5×3 (última série AMRAP). Ao falhar, passe para 6×2 e depois 10×1. T2: 3×10 → 3×8 → 3×6. T3: 3×15+; ao fazer 25 reps na última, suba a carga.',
    fonte: [
      { nome: 'Cody Lefever (GZCL) — GZCL Applications & Adaptations', url: 'https://swoleateveryheight.blogspot.com/2016/02/gzcl-applications-adaptations.html' },
    ],
    rotinas: [
      { nome: 'Dia 1', itens: [s('Barbell_Full_Squat', 5, 3, 3, 180), s('Barbell_Bench_Press_-_Medium_Grip', 3, 10, 10, 120), s('Wide-Grip_Lat_Pulldown', 3, 15, 25, 60)] },
      { nome: 'Dia 2', itens: [s('Standing_Military_Press', 5, 3, 3, 180), s('Barbell_Deadlift', 3, 10, 10, 150), s('One-Arm_Dumbbell_Row', 3, 15, 25, 60)] },
      { nome: 'Dia 3', itens: [s('Barbell_Bench_Press_-_Medium_Grip', 5, 3, 3, 180), s('Barbell_Full_Squat', 3, 10, 10, 150), s('Wide-Grip_Lat_Pulldown', 3, 15, 25, 60)] },
      { nome: 'Dia 4', itens: [s('Barbell_Deadlift', 5, 3, 3, 180), s('Standing_Military_Press', 3, 10, 10, 120), s('One-Arm_Dumbbell_Row', 3, 15, 25, 60)] },
    ],
  },
  {
    id: 'stronglifts',
    nome: 'StrongLifts 5×5',
    categoria: 'forca',
    resumo: 'Dois treinos (A e B) alternados, três vezes por semana, com cinco séries de cinco nos básicos com barra.',
    praQuem: 'Iniciantes que querem ficar fortes com um plano simples e só barra olímpica, rack e banco.',
    dias: 3, duracaoMin: '45-60 min', nivel: 'Iniciante',
    progressao: 'Some 2,5 kg a cada treino em que completar 5×5 (terra: 5 kg). Falhou 3 treinos seguidos no mesmo exercício: reduza 10% e recomece a subir.',
    fonte: [
      { nome: 'Mehdi Hadim — StrongLifts 5×5', url: 'https://stronglifts.com/5x5/' },
    ],
    rotinas: [
      { nome: 'Treino A', itens: [s('Barbell_Full_Squat', 5, 5, 5, 180), s('Barbell_Bench_Press_-_Medium_Grip', 5, 5, 5, 180), s('Bent_Over_Barbell_Row', 5, 5, 5, 180)] },
      { nome: 'Treino B', itens: [s('Barbell_Full_Squat', 5, 5, 5, 180), s('Standing_Military_Press', 5, 5, 5, 180), s('Barbell_Deadlift', 1, 5, 5, 180)] },
    ],
  },
  {
    id: 'heroi',
    nome: 'Físico atlético de super-herói',
    categoria: 'estetica',
    resumo: 'Hipertrofia estética com foco em "formato em V": ombros largos, peito alto, costas largas, braços e cintura firme. 5 dias.',
    praQuem: 'Intermediários com objetivo estético e dieta controlada. Combine com déficit leve ou recomposição.',
    dias: 5, duracaoMin: '55-70 min', nivel: 'Intermediário',
    progressao: '10-20 séries semanais por grupo prioritário (deltoide lateral, peito alto, dorsais). Dupla progressão em todos; a cada 6-8 semanas faça 1 semana mais leve (deload, metade das séries).',
    fonte: [
      { nome: 'Schoenfeld, Ogborn & Krieger (2017) — dose-resposta do volume semanal na hipertrofia, J Sports Sci', url: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' },
      { nome: 'Schoenfeld et al. (2019) — volume de treino e hipertrofia, MSSE', url: 'https://pubmed.ncbi.nlm.nih.gov/30153194/' },
    ],
    rotinas: [
      { nome: 'Peito alto e ombros', itens: [s('Incline_Dumbbell_Press', 4, 6, 10, 120), s('Barbell_Incline_Bench_Press_-_Medium_Grip', 3, 8, 12, 120), s('Cable_Crossover', 3, 12, 15, 60), s('Seated_Dumbbell_Press', 3, 8, 12), s('Side_Lateral_Raise', 4, 12, 20, 45)] },
      { nome: 'Costas largas', itens: [s('Pullups', 4, 6, 10, 120), s('Wide-Grip_Lat_Pulldown', 3, 10, 12), s('One-Arm_Dumbbell_Row', 3, 8, 12), s('Straight-Arm_Pulldown', 3, 12, 15, 60), s('Face_Pull', 3, 15, 20, 45)] },
      { nome: 'Pernas atléticas', itens: [s('Barbell_Full_Squat', 4, 6, 10, 150), s('Romanian_Deadlift', 3, 8, 12, 120), s('Split_Squat_with_Dumbbells', 3, 10, 12), s('Standing_Dumbbell_Calf_Raise', 4, 12, 15, 45), s('Hanging_Leg_Raise', 3, 10, 15, 60)] },
      { nome: 'Braços e ombro lateral', itens: [s('EZ-Bar_Curl', 3, 8, 12, 60), s('EZ-Bar_Skullcrusher', 3, 8, 12, 60), s('Incline_Dumbbell_Curl', 3, 10, 15, 60), s('Triceps_Pushdown_-_Rope_Attachment', 3, 10, 15, 60), s('Seated_Side_Lateral_Raise', 4, 12, 20, 45), s('Hammer_Curls', 2, 10, 15, 60)] },
      { nome: 'Superior completo', itens: [s('Dumbbell_Bench_Press', 3, 8, 12), s('Seated_Cable_Rows', 3, 8, 12), s('Arnold_Dumbbell_Press', 3, 8, 12), s('Chin-Up', 3, 6, 10, 120), s('Reverse_Flyes', 3, 12, 15, 45), s('Cable_Crunch', 3, 10, 15, 60)] },
    ],
  },
  {
    id: 'calistenia',
    nome: 'Calistenia em casa',
    categoria: 'casa',
    resumo: 'Corpo inteiro com o peso do corpo, 3x por semana, em pares de exercícios (empurrar + puxar, pernas + core).',
    praQuem: 'Quem treina em casa, viaja ou quer complementar a academia. Precisa só de uma barra (ou espaldar) e um banco/cadeira firme.',
    dias: 3, duracaoMin: '40-60 min', nivel: 'Iniciante',
    progressao: 'Ao fazer 3×8 limpas, avance para a variação mais difícil (ex.: flexão inclinada → flexão no chão → pés elevados). Remada invertida: abaixe a barra para ficar mais horizontal.',
    fonte: [
      { nome: 'r/bodyweightfitness — Recommended Routine', url: 'https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/' },
    ],
    rotinas: [
      { nome: 'Corpo inteiro', itens: [s('Pullups', 3, 5, 8, 90), s('Bodyweight_Squat', 3, 12, 20, 60), s('Bench_Dips', 3, 8, 12, 90), s('Inverted_Row', 3, 8, 12, 90), s('Pushups', 3, 8, 15, 90), s('Single_Leg_Glute_Bridge', 3, 10, 15, 60), s('Plank', 3, 30, 60, 60)] },
    ],
  },
  {
    id: 'anime-protagonista',
    nome: 'Arco do Protagonista',
    categoria: 'anime',
    resumo: 'Visual de anime, treino de verdade: 12 semanas em 3 "arcos" de 4 semanas, cada um mais difícil. Força com peso do corpo + condicionamento.',
    praQuem: 'Quem gosta de desafio com cara de história. Bom para treinar em casa ou como complemento leve.',
    dias: 3, duracaoMin: '35-50 min', nivel: 'Iniciante a intermediário',
    progressao: 'Arco 1 (sem. 1-4): versões fáceis, 3×8-12. Arco 2 (5-8): versões padrão, 4×8-12. Arco 3 (9-12): versões difíceis (pés elevados, unilateral), 4×6-10. Avance de arco só se completar todas as séries com boa técnica.',
    observacao: 'Respeite o modo cuidado: nada de "treinar até desmaiar" como em anime. Pare se sentir sinais de alerta.',
    fonte: [
      { nome: 'r/bodyweightfitness — Recommended Routine (progressões)', url: 'https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/' },
      { nome: 'OMS (2020) — Diretrizes de atividade física', url: 'https://www.who.int/publications/i/item/9789240015128' },
    ],
    rotinas: [
      { nome: 'Episódio: Força', itens: [s('Pushups', 4, 8, 12, 90), s('Inverted_Row', 4, 8, 12, 90), s('Split_Squats', 3, 10, 12, 60), s('Hanging_Leg_Raise', 3, 8, 12, 60)] },
      { nome: 'Episódio: Resistência', itens: [s('Bodyweight_Walking_Lunge', 3, 12, 20, 60), s('Push-Ups_With_Feet_Elevated', 3, 6, 10, 90), s('Chin-Up', 3, 4, 8, 120), s('Plank', 3, 40, 60, 45), s('Freehand_Jump_Squat', 3, 8, 12, 60)] },
      { nome: 'Episódio: Final', itens: [s('Pullups', 4, 5, 8, 120), s('Push-Ups_-_Close_Triceps_Position', 4, 8, 12, 90), s('Single_Leg_Glute_Bridge', 3, 12, 15, 60), s('Dead_Bug', 3, 10, 12, 45), s('Russian_Twist', 3, 20, 30, 45)] },
    ],
  },
]
