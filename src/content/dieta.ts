import { ALIMENTOS } from './alimentos'
import type { Objetivo } from '../lib/types'

export interface ItemCardapio { alimentoId: string; qtd: number }
export interface RefeicaoPlano { horario: string; nome: string; itens: ItemCardapio[]; dica?: string }

/** Meu plano: ~2.300 kcal e ~165 g de proteína em 6 refeições. Sem peixes e frutos do mar. */
export const PLANO_DIETA: RefeicaoPlano[] = [
  { horario: '08:00', nome: 'Café da manhã (pré-treino)', itens: [{ alimentoId: 'ovo', qtd: 2 }, { alimentoId: 'pao-integral', qtd: 1 }, { alimentoId: 'banana', qtd: 1 }, { alimentoId: 'cafe', qtd: 1 }], dica: 'Coma ~1h antes do treino das 9h. Beba 500 ml de água.' },
  { horario: '11:30', nome: 'Pós-treino', itens: [{ alimentoId: 'whey', qtd: 1 }, { alimentoId: 'iogurte-natural', qtd: 1 }, { alimentoId: 'aveia', qtd: 1 }, { alimentoId: 'morango', qtd: 1 }] },
  { horario: '13:00', nome: 'Almoço', itens: [{ alimentoId: 'arroz-branco', qtd: 2 }, { alimentoId: 'feijao', qtd: 1 }, { alimentoId: 'frango-grelhado', qtd: 1 }, { alimentoId: 'salada-folhas', qtd: 1 }, { alimentoId: 'legumes', qtd: 1 }, { alimentoId: 'azeite', qtd: 1 }] },
  { horario: '15:30', nome: 'Lanche da tarde', itens: [{ alimentoId: 'pao-frances', qtd: 1 }, { alimentoId: 'queijo-minas', qtd: 1 }, { alimentoId: 'maca', qtd: 1 }] },
  { horario: '19:30', nome: 'Jantar', itens: [{ alimentoId: 'patinho', qtd: 1 }, { alimentoId: 'batata-doce', qtd: 2 }, { alimentoId: 'brocolis', qtd: 1 }, { alimentoId: 'azeite', qtd: 1 }] },
  { horario: '22:00', nome: 'Ceia', itens: [{ alimentoId: 'iogurte-grego-0', qtd: 1 }, { alimentoId: 'pasta-amendoim', qtd: 1 }, { alimentoId: 'castanha-para', qtd: 1 }] },
]

export function totaisItens(itens: ItemCardapio[]) {
  return itens.reduce(
    (t, i) => {
      const al = ALIMENTOS.find((x) => x.id === i.alimentoId)
      if (!al) return t
      return { kcal: t.kcal + al.kcal * i.qtd, proteina: t.proteina + al.proteina * i.qtd }
    },
    { kcal: 0, proteina: 0 },
  )
}

// ---------- Calculadora Mifflin-St Jeor ----------
export const ATIVIDADES = [
  { f: 1.2, nome: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
  { f: 1.375, nome: 'Leve', desc: '1-3 treinos/semana' },
  { f: 1.55, nome: 'Moderado', desc: '3-5 treinos/semana' },
  { f: 1.725, nome: 'Alto', desc: '6-7 treinos/semana' },
  { f: 1.9, nome: 'Muito alto', desc: 'Treino 2x/dia ou trabalho físico' },
]

export const OBJETIVOS: Record<Objetivo, { nome: string; ajuste: number; protKg: number; desc: string }> = {
  perda: { nome: 'Perda de gordura', ajuste: -0.2, protKg: 2.2, desc: 'Déficit de ~20%. Proteína alta para preservar músculo.' },
  ganho: { nome: 'Ganho de massa', ajuste: 0.1, protKg: 1.8, desc: 'Superávit leve (~10%) para ganhar com pouca gordura.' },
  recomposicao: { nome: 'Recomposição', ajuste: -0.1, protKg: 2.2, desc: 'Déficit pequeno + treino de força. Funciona melhor em iniciantes ou na volta aos treinos.' },
  manutencao: { nome: 'Manutenção', ajuste: 0, protKg: 1.6, desc: 'Comer o que gasta. Bom para fases de descanso da dieta.' },
}

export function mifflin(sexo: 'm' | 'f', pesoKg: number, alturaCm: number, idade: number) {
  return 10 * pesoKg + 6.25 * alturaCm - 5 * idade + (sexo === 'm' ? 5 : -161)
}

export function calcularMacros(p: { sexo: 'm' | 'f'; pesoKg: number; alturaCm: number; idade: number; atividade: number; objetivo: Objetivo }) {
  const tmb = mifflin(p.sexo, p.pesoKg, p.alturaCm, p.idade)
  const get = tmb * p.atividade
  const o = OBJETIVOS[p.objetivo]
  const kcal = Math.round((get * (1 + o.ajuste)) / 10) * 10
  const proteina = Math.round(p.pesoKg * o.protKg)
  const gordura = Math.round(Math.max(p.pesoKg * 0.8, (kcal * 0.25) / 9))
  const carbo = Math.max(0, Math.round((kcal - proteina * 4 - gordura * 9) / 4))
  return { tmb: Math.round(tmb), get: Math.round(get), kcal, proteina, gordura, carbo }
}

// ---------- Guias de dieta ----------
export interface GuiaDieta {
  id: string
  nome: string
  resumo: string
  praQuem: string
  pros: string[]
  contras: string[]
  alertas?: string[]
  cardapio: { refeicao: string; itens: string }[]
  fonte: { nome: string; url: string }[]
}

export const GUIAS: GuiaDieta[] = [
  {
    id: 'deficit', nome: 'Déficit calórico',
    resumo: 'Comer um pouco menos do que se gasta (em geral 15-25% abaixo da manutenção). É a base de qualquer perda de gordura.',
    praQuem: 'Quem quer perder gordura mantendo flexibilidade de alimentos.',
    pros: ['Funciona com qualquer estilo de alimentação', 'Fácil de ajustar pelo peso semanal', 'Sem alimentos proibidos'],
    contras: ['Fome se o déficit for grande', 'Exige registrar ou estimar porções', 'Pode reduzir energia no treino'],
    alertas: ['Déficits agressivos aumentam perda de massa muscular e fadiga.', 'Com sensibilidade ao calor e fadiga, prefira déficit moderado e boa hidratação.'],
    cardapio: [
      { refeicao: 'Café', itens: '2 ovos + 1 pão integral + mamão' },
      { refeicao: 'Almoço', itens: 'Arroz (3 col.), feijão, frango grelhado, salada à vontade' },
      { refeicao: 'Lanche', itens: 'Iogurte grego zero + morangos' },
      { refeicao: 'Jantar', itens: 'Patinho moído + abóbora + brócolis' },
    ],
    fonte: [{ nome: 'Hall & Kahan (2018) — Maintenance of lost weight and long-term management of obesity, Med Clin N Am', url: 'https://pubmed.ncbi.nlm.nih.gov/29156185/' }],
  },
  {
    id: 'ganho-limpo', nome: 'Ganho de massa limpo',
    resumo: 'Superávit pequeno (5-10%) com muita proteína e treino de força progressivo, para ganhar músculo com pouca gordura.',
    praQuem: 'Quem já está com gordura corporal controlada e quer aumentar massa muscular.',
    pros: ['Mais energia e desempenho no treino', 'Menos gordura do que "bulking sujo"', 'Recuperação melhor'],
    contras: ['Ganho lento (0,25-0,5% do peso por mês para intermediários)', 'Exige paciência e constância', 'Comer mais pode ser difícil'],
    cardapio: [
      { refeicao: 'Café', itens: 'Crepioca + queijo minas + banana com aveia' },
      { refeicao: 'Almoço', itens: 'Arroz, feijão, carne magra, legumes, azeite' },
      { refeicao: 'Pós-treino', itens: 'Whey + leite + banana + pasta de amendoim' },
      { refeicao: 'Jantar', itens: 'Macarrão com frango desfiado e molho de tomate' },
    ],
    fonte: [{ nome: 'Iraki et al. (2019) — Nutrition recommendations for bodybuilders in the off-season, Sports', url: 'https://pubmed.ncbi.nlm.nih.gov/31247944/' }],
  },
  {
    id: 'proteica', nome: 'Rica em proteína',
    resumo: '1,6-2,2 g de proteína por kg de peso por dia, distribuída em 4-6 refeições. Ajuda na saciedade e na preservação/ganho muscular.',
    praQuem: 'Quem treina força, em qualquer objetivo (perda, ganho ou recomposição).',
    pros: ['Maior saciedade', 'Preserva massa magra no déficit', 'Combina com qualquer estratégia'],
    contras: ['Custo maior', 'Pode faltar fibra se esquecer vegetais', 'Exige planejamento'],
    alertas: ['Quem tem doença renal deve ajustar a proteína com o médico.'],
    cardapio: [
      { refeicao: 'Café', itens: '3 ovos mexidos + pão integral' },
      { refeicao: 'Almoço', itens: 'Frango 150 g + arroz + feijão + salada' },
      { refeicao: 'Lanche', itens: 'Iogurte grego + whey' },
      { refeicao: 'Jantar', itens: 'Carne magra 150 g + batata-doce + legumes' },
    ],
    fonte: [{ nome: 'Jäger et al. (2017) — ISSN Position Stand: protein and exercise, JISSN', url: 'https://pubmed.ncbi.nlm.nih.gov/28642676/' }],
  },
  {
    id: 'low-carb', nome: 'Low carb',
    resumo: 'Reduz carboidratos (em geral abaixo de 100-130 g/dia), priorizando proteínas, vegetais e gorduras boas.',
    praQuem: 'Quem sente mais saciedade com menos carboidrato e não depende de treinos longos e intensos.',
    pros: ['Saciedade para algumas pessoas', 'Menos ultraprocessados', 'Pode ajudar no controle glicêmico'],
    contras: ['Rendimento menor em treinos de alto volume', 'Difícil de manter socialmente', 'Resultado de longo prazo semelhante a outras dietas com mesmo déficit'],
    alertas: ['Pode piorar fadiga e tontura nas primeiras semanas — atenção redobrada no modo cuidado.', 'Diabéticos em uso de medicação devem fazer só com acompanhamento.'],
    cardapio: [
      { refeicao: 'Café', itens: 'Omelete com queijo e tomate + café' },
      { refeicao: 'Almoço', itens: 'Carne + salada grande com azeite + legumes' },
      { refeicao: 'Lanche', itens: 'Castanhas + iogurte natural' },
      { refeicao: 'Jantar', itens: 'Frango + abobrinha e brócolis refogados' },
    ],
    fonte: [{ nome: 'Gardner et al. (2018) — DIETFITS: low-fat vs low-carb, JAMA', url: 'https://pubmed.ncbi.nlm.nih.gov/29466592/' }],
  },
  {
    id: 'mediterranea', nome: 'Mediterrânea (versão sem peixe)',
    resumo: 'Base de vegetais, leguminosas, grãos integrais, frutas, azeite e oleaginosas, com aves, ovos e laticínios. Aqui adaptada sem peixe.',
    praQuem: 'Quem busca saúde cardiovascular e um padrão alimentar sustentável a longo prazo.',
    pros: ['Forte evidência para saúde do coração', 'Flexível e saborosa', 'Rica em fibras'],
    contras: ['Sem peixe, o ômega-3 de cadeia longa (EPA/DHA) fica baixo', 'Azeite e castanhas são calóricos', 'Custo de azeite/oleaginosas'],
    alertas: ['Para ômega-3 sem peixe: linhaça, chia e nozes (ALA). Converse com nutricionista sobre óleo de algas (fonte vegetal de DHA).'],
    cardapio: [
      { refeicao: 'Café', itens: 'Iogurte + aveia + nozes + fruta' },
      { refeicao: 'Almoço', itens: 'Grão-de-bico, frango, salada com tomate e azeite' },
      { refeicao: 'Lanche', itens: 'Pão integral + queijo minas + tomate' },
      { refeicao: 'Jantar', itens: 'Lentilha, legumes assados e ovo' },
    ],
    fonte: [{ nome: 'Estruch et al. (2018) — PREDIMED, NEJM', url: 'https://pubmed.ncbi.nlm.nih.gov/29897866/' }],
  },
  {
    id: 'jejum', nome: 'Jejum intermitente',
    resumo: 'Concentra as refeições numa janela (ex.: 16:8 — 8 horas comendo, 16 em jejum). Funciona principalmente por facilitar o déficit.',
    praQuem: 'Quem prefere menos refeições maiores e não sente queda de desempenho.',
    pros: ['Menos decisões sobre comida', 'Pode facilitar o déficit', 'Flexível em dias corridos'],
    contras: ['Difícil bater 165 g de proteína em poucas refeições', 'Treino em jejum pode render menos', 'Não é superior a dieta comum com as mesmas calorias'],
    alertas: ['Com sensibilidade ao calor e fadiga, treinar em jejum aumenta risco de tontura. Não recomendado no modo cuidado.', 'Não indicado para histórico de transtorno alimentar, gestantes, diabéticos em uso de insulina sem acompanhamento.'],
    cardapio: [
      { refeicao: '12h (abre janela)', itens: 'Arroz, feijão, carne, salada' },
      { refeicao: '16h', itens: 'Iogurte grego + whey + fruta' },
      { refeicao: '19h30 (fecha)', itens: 'Frango + batata-doce + legumes' },
    ],
    fonte: [{ nome: 'de Cabo & Mattson (2019) — Effects of Intermittent Fasting on Health, Aging, and Disease, NEJM', url: 'https://pubmed.ncbi.nlm.nih.gov/31881139/' }],
  },
  {
    id: 'carnivora', nome: 'Carnívora',
    resumo: 'Baseada apenas em alimentos de origem animal (carnes, ovos, alguns laticínios). Aqui, sem peixes e frutos do mar.',
    praQuem: 'Pouca evidência científica. Só considerar com acompanhamento médico e exames.',
    pros: ['Muita proteína e saciedade', 'Simples de seguir', 'Elimina ultraprocessados'],
    contras: ['Zero fibra (constipação é comum)', 'Falta de vitamina C, folato, magnésio e potássio de vegetais', 'Social e financeiramente difícil'],
    alertas: [
      'Pode elevar bastante o LDL-colesterol em parte das pessoas — exige exames periódicos.',
      'Evidência de segurança a longo prazo é muito limitada (estudos são principalmente autorrelatos).',
      'Não indicado para doença renal, gota, doença cardiovascular ou gestação.',
    ],
    cardapio: [
      { refeicao: 'Café', itens: '4 ovos + queijo' },
      { refeicao: 'Almoço', itens: 'Carne bovina 250 g' },
      { refeicao: 'Jantar', itens: 'Frango ou porco + ovos' },
    ],
    fonte: [{ nome: 'Lennerz et al. (2021) — Behavioral characteristics and self-reported health status among 2029 adults consuming a "carnivore diet", Curr Dev Nutr', url: 'https://pubmed.ncbi.nlm.nih.gov/34934897/' }],
  },
]
