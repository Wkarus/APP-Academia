export type Musculo =
  | 'abdominals' | 'abductors' | 'adductors' | 'biceps' | 'calves' | 'chest' | 'forearms'
  | 'glutes' | 'hamstrings' | 'lats' | 'lower back' | 'middle back' | 'neck' | 'quadriceps'
  | 'shoulders' | 'traps' | 'triceps'

export interface Midia {
  tipo: 'webp-animado' | 'quadros' | 'mp4' | 'gif' | 'nenhuma'
  url?: string
  quadros?: string[]
  poster?: string
  local?: boolean
}

export interface Fonte { nome: string; url: string | null; licenca: string }

export interface Exercicio {
  id: string
  nome: string
  nameEn: string
  primarios: Musculo[]
  secundarios: Musculo[]
  equipamento: string
  equipamentoPt: string
  dificuldade: 'iniciante' | 'intermediario' | 'avancado'
  categoria: string
  mecanica: string | null
  forca: string | null
  passos: string[]
  passosIdioma: 'pt' | 'en'
  erros: string[]
  respiracao: string | null
  traduzido: boolean
  minhaAcademia: boolean
  noPlano: boolean
  media: Midia
  mediaUrl: string | null
  fonte: Fonte
  licenca: string
}

export interface ItemRotina {
  exId: string
  series: number
  repMin: number
  repMax: number
  descansoSeg: number
  /** Para cardio: minutos */
  minutos?: number
  nota?: string
}

export interface Rotina {
  id: string
  nome: string
  subtitulo?: string
  /** 0 = domingo … 6 = sábado */
  dias: number[]
  tipo: 'forca' | 'cardio'
  itens: ItemRotina[]
  /** Rotinas do "Meu plano" ajustam séries pela semana (1-2: 2 séries; 3+: 3 séries) */
  progressaoPlano?: boolean
  programaId?: string
  ordem?: number
}

export interface SerieFeita {
  exId: string
  idx: number
  kg: number | null
  reps: number | null
  feita: boolean
  ts?: number
  recorde?: boolean
}

export interface Sessao {
  id: string
  rotinaId: string | null
  nome: string
  inicio: number
  fim?: number
  series: SerieFeita[]
  cardioMin?: number
  nota?: string
}

export interface Medida { id?: number; data: string; peso?: number; cintura?: number }
export interface Foto { id?: number; data: string; blob: Blob; nota?: string }
export interface Refeicao {
  id?: number
  data: string
  horario: string
  nome: string
  kcal: number
  proteina: number
  itens?: { alimentoId?: string; nome: string; qtd: number; kcal: number; proteina: number }[]
}
export interface Agua { data: string; ml: number }

export type Objetivo = 'perda' | 'ganho' | 'recomposicao' | 'manutencao'

export interface Ajustes {
  id: 'app'
  nome: string
  fonteGrande: boolean
  menosMovimento: boolean
  modoCuidado: boolean
  semPeixe: boolean
  onboarding: boolean
  inicioPlano: string // ISO (segunda-feira da semana 1)
  metaKcal: number
  metaProteina: number
  metaAguaMl: number
  horarioTreino: string
  sexo?: 'm' | 'f'
  idade?: number
  alturaCm?: number
  pesoKg?: number
  atividade?: number
  objetivo?: Objetivo
  vibrar: boolean
  telaLigada: boolean
  /** ingredientes que não gosta (filtro das receitas) */
  naoCurto?: string[]
  /** 'meu' = Meu plano; ou o id de um programa pronto em uso */
  planoAtivo?: string
}

/** Variação escolhida para uma refeição do plano num dia */
export interface Escolha { chave: string; data: string; horario: string; receitaId: string; fator: number }
