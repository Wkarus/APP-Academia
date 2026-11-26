/**
 * Receitas temperadas para variar a dieta — todas SEM peixe e frutos do mar.
 * Calorias e proteína são calculadas a partir do banco de alimentos (TACO, aproximado).
 * Temperos secos (sal, alho, ervas, especiarias) têm caloria desprezível.
 */
import { ALIMENTOS } from './alimentos'
import type { ItemCardapio } from './dieta'

export type Slot = 'cafe' | 'pre' | 'pos' | 'almoco' | 'lanche' | 'jantar' | 'ceia'

export const SLOT_NOME: Record<Slot, string> = {
  cafe: 'Café da manhã', pre: 'Pré-treino', pos: 'Pós-treino', almoco: 'Almoço', lanche: 'Lanche', jantar: 'Jantar', ceia: 'Ceia',
}

export interface Receita {
  id: string
  nome: string
  slots: Slot[]
  minutos: number
  itens: ItemCardapio[]
  temperos: string[]
  passos: string[]
  dica?: string
  /** ingredientes/características para o filtro "não curto" */
  tags: string[]
  /** termo de busca de vídeo no YouTube */
  video: string
}

/** Opções do filtro "Não curto" */
export const NAO_CURTO = [
  { id: 'frango', nome: 'Frango' }, { id: 'carne', nome: 'Carne vermelha' }, { id: 'porco', nome: 'Porco' },
  { id: 'ovo', nome: 'Ovo' }, { id: 'laticinio', nome: 'Leite/iogurte' }, { id: 'queijo', nome: 'Queijo' },
  { id: 'feijao', nome: 'Feijão' }, { id: 'leguminosa', nome: 'Grão-de-bico/lentilha' }, { id: 'cebola', nome: 'Cebola' },
  { id: 'pimentao', nome: 'Pimentão' }, { id: 'coentro', nome: 'Coentro' }, { id: 'cogumelo', nome: 'Cogumelo' },
  { id: 'legumes', nome: 'Legumes cozidos' }, { id: 'apimentado', nome: 'Apimentado' }, { id: 'doce', nome: 'Doce' },
  { id: 'banana', nome: 'Banana' }, { id: 'aveia', nome: 'Aveia' }, { id: 'abobora', nome: 'Abóbora' }, { id: 'mandioca', nome: 'Mandioca' },
  { id: 'whey', nome: 'Whey' },
]

const i = (alimentoId: string, qtd = 1): ItemCardapio => ({ alimentoId, qtd })

export const RECEITAS: Receita[] = [
  // ---------- Café da manhã / lanche ----------
  {
    id: 'crepioca-frango', nome: 'Crepioca de frango com requeijão e orégano', slots: ['cafe', 'lanche', 'pos'], minutos: 10,
    itens: [i('crepioca'), i('frango-desfiado', 0.8), i('requeijao-light')],
    temperos: ['Orégano', 'Alho em pó', 'Páprica doce', 'Sal e pimenta-do-reino'],
    passos: ['Bata 1 ovo com 2 col. de goma de tapioca, sal e orégano.', 'Despeje na frigideira antiaderente quente e doure dos dois lados.', 'Recheie com frango desfiado temperado com alho e páprica e o requeijão. Dobre e sirva.'],
    dica: 'Tenha frango desfiado temperado pronto na geladeira: vira recheio em 1 minuto.', tags: ['frango', 'ovo', 'queijo'], video: 'crepioca de frango com requeijão fit',
  },
  {
    id: 'ovos-mexidos-tomate', nome: 'Ovos mexidos com tomate, cebolinha e páprica + pão', slots: ['cafe'], minutos: 8,
    itens: [i('ovo', 3), i('tomate', 0.5), i('pao-integral'), i('queijo-minas', 0.5)],
    temperos: ['Páprica defumada', 'Cebolinha', 'Sal', 'Pimenta-do-reino'],
    passos: ['Refogue o tomate picado 1 minuto na frigideira.', 'Adicione os ovos batidos com sal e páprica e mexa em fogo baixo até ficarem cremosos.', 'Finalize com cebolinha e queijo minas em cubos. Sirva com o pão.'],
    dica: 'Fogo baixo deixa o ovo cremoso, sem ressecar.', tags: ['ovo', 'queijo'], video: 'ovos mexidos cremosos com tomate e páprica',
  },
  {
    id: 'tapioca-coalho-peru', nome: 'Tapioca de queijo coalho e peito de peru', slots: ['cafe', 'lanche'], minutos: 8,
    itens: [i('tapioca'), i('queijo-coalho', 0.75), i('peru')],
    temperos: ['Orégano', 'Pimenta calabresa (opcional)'],
    passos: ['Espalhe a goma na frigideira quente até firmar.', 'Recheie com queijo coalho ralado e peito de peru.', 'Tampe 1 minuto para derreter, dobre e sirva com orégano.'],
    tags: ['queijo'], video: 'tapioca de queijo coalho com peito de peru',
  },
  {
    id: 'cuscuz-ovo', nome: 'Cuscuz nordestino com ovo e queijo coalho', slots: ['cafe', 'lanche'], minutos: 15,
    itens: [i('cuscuz', 1.2), i('ovo', 2), i('queijo-coalho', 0.5)],
    temperos: ['Sal', 'Manteiga de garrafa (1 col. chá, opcional)', 'Cheiro-verde'],
    passos: ['Hidrate a flocão com água e sal por 10 minutos e cozinhe no vapor (cuscuzeira ou micro-ondas com tampa, 3 min).', 'Frite ou cozinhe os ovos.', 'Sirva o cuscuz com os ovos por cima e o coalho grelhado.'],
    tags: ['ovo', 'queijo'], video: 'cuscuz nordestino com ovo no micro-ondas',
  },
  {
    id: 'panqueca-banana', nome: 'Panqueca de banana, aveia e canela', slots: ['cafe', 'pos', 'lanche'], minutos: 10,
    itens: [i('banana'), i('aveia'), i('ovo', 2), i('whey', 0.5), i('mel', 0.5)],
    temperos: ['Canela', 'Essência de baunilha (opcional)'],
    passos: ['Amasse a banana e misture os ovos, a aveia, o whey e a canela.', 'Faça panquecas pequenas em frigideira antiaderente, 2 min de cada lado.', 'Finalize com um fio de mel e mais canela.'],
    tags: ['banana', 'aveia', 'ovo', 'doce', 'whey'], video: 'panqueca de banana e aveia proteica',
  },
  {
    id: 'overnight-cacau', nome: 'Overnight oats de cacau com pasta de amendoim', slots: ['cafe', 'ceia', 'lanche'], minutos: 5,
    itens: [i('aveia', 1.3), i('iogurte-grego-0'), i('cacau'), i('pasta-amendoim'), i('whey', 0.5)],
    temperos: ['Canela', 'Pitada de sal (realça o chocolate)'],
    passos: ['Misture tudo num pote com 50 ml de água ou leite.', 'Deixe na geladeira de um dia para o outro.', 'Coma gelado, com a pasta de amendoim por cima.'],
    dica: 'Gosto de brigadeiro de pote, com proteína.', tags: ['aveia', 'laticinio', 'doce', 'whey'], video: 'overnight oats de chocolate proteico',
  },
  {
    id: 'iogurte-morango-granola', nome: 'Iogurte proteico com morango e granola', slots: ['cafe', 'lanche', 'ceia'], minutos: 3,
    itens: [i('iogurte-grego-0'), i('morango'), i('granola'), i('mel', 0.5)],
    temperos: ['Canela'],
    passos: ['Coloque o iogurte numa tigela.', 'Cubra com morangos picados, granola e um fio de mel.'],
    tags: ['laticinio', 'doce'], video: 'iogurte com granola e morango',
  },
  {
    id: 'omelete-forno', nome: 'Omelete de forno com legumes e queijo', slots: ['cafe', 'jantar', 'lanche'], minutos: 25,
    itens: [i('ovo', 3), i('legumes'), i('mussarela', 0.7), i('tomate', 0.5)],
    temperos: ['Orégano', 'Cheiro-verde', 'Alho', 'Sal e pimenta'],
    passos: ['Bata os ovos com sal, alho e orégano.', 'Misture os legumes picados e o tomate, coloque em forma untada e cubra com queijo.', 'Asse a 200 °C por 20 minutos (ou na airfryer 12-15 min).'],
    dica: 'Faça uma forma grande e corte em porções para a semana.', tags: ['ovo', 'queijo', 'legumes'], video: 'omelete de forno fit com legumes',
  },

  // ---------- Pré-treino (leve, 30-60 min antes) ----------
  {
    id: 'pre-whey-banana', nome: 'Whey com banana (pré-treino leve)', slots: ['pre', 'lanche'], minutos: 2,
    itens: [i('whey'), i('banana')],
    temperos: ['Canela', 'Água gelada ou gelo'],
    passos: ['Bata ou agite o whey com 250 ml de água gelada.', 'Coma a banana junto. Leve, rápido e não pesa no treino.'],
    dica: 'Bom quando falta menos de 1 hora para treinar.', tags: ['whey', 'banana'], video: 'shake de whey com banana pré treino',
  },
  {
    id: 'pre-pao-mel', nome: 'Pão com queijo e mel (pré-treino)', slots: ['pre', 'lanche', 'cafe'], minutos: 3,
    itens: [i('pao-frances'), i('queijo-minas'), i('mel', 0.5)],
    temperos: ['Orégano no queijo (opcional)'],
    passos: ['Abra o pão, coloque o queijo minas e um fio de mel.', 'Coma 45-90 min antes do treino.'],
    dica: 'Carboidrato fácil de digerir + um pouco de proteína.', tags: ['queijo', 'doce'], video: 'lanche pré treino rápido',
  },
  {
    id: 'pre-iogurte-banana', nome: 'Iogurte com banana e aveia (pré-treino)', slots: ['pre', 'lanche'], minutos: 2,
    itens: [i('iogurte-grego-0'), i('banana'), i('aveia', 0.5)],
    temperos: ['Canela', 'Mel (opcional)'],
    passos: ['Misture o iogurte com a banana fatiada e a aveia.', 'Coma 45-60 min antes do treino.'],
    tags: ['laticinio', 'banana', 'aveia'], video: 'iogurte com banana e aveia pré treino',
  },

  // ---------- Pós-treino ----------
  {
    id: 'shake-banana', nome: 'Shake de banana, whey, aveia e canela', slots: ['pos', 'cafe'], minutos: 3,
    itens: [i('whey'), i('leite-desnatado'), i('banana'), i('aveia', 0.7)],
    temperos: ['Canela', 'Gelo'],
    passos: ['Bata tudo no liquidificador com gelo.', 'Beba em até 1-2 horas depois do treino.'],
    dica: 'Banana congelada deixa cremoso como milkshake.', tags: ['whey', 'banana', 'aveia', 'laticinio', 'doce'], video: 'shake pós treino banana whey aveia',
  },
  {
    id: 'wrap-frango-cajun', nome: 'Wrap de frango cajun', slots: ['pos', 'lanche', 'jantar'], minutos: 12,
    itens: [i('rap10'), i('frango-grelhado', 1.2), i('requeijao-light'), i('tomate', 0.5), i('salada-folhas', 0.5)],
    temperos: ['Páprica defumada', 'Alho em pó', 'Cominho', 'Orégano', 'Pimenta-caiena (pitada)', 'Limão'],
    passos: ['Tempere tiras de frango com páprica, alho, cominho, orégano, caiena, sal e limão.', 'Grelhe 6-8 min até dourar.', 'Espalhe o requeijão no wrap, coloque folhas, tomate e o frango. Enrole bem apertado.'],
    dica: 'O tempero cajun caseiro guarda num pote: 2 páprica defumada : 1 alho : 1 cebola em pó : 1 orégano : ½ cominho : ¼ caiena.', tags: ['frango', 'queijo', 'apimentado'], video: 'wrap de frango cajun fit',
  },
  {
    id: 'sanduiche-frango-cremoso', nome: 'Sanduíche de frango cremoso com cenoura', slots: ['pos', 'lanche'], minutos: 10,
    itens: [i('pao-frances'), i('frango-desfiado', 1), i('requeijao-light'), i('cenoura')],
    temperos: ['Cheiro-verde', 'Alho', 'Mostarda (1 col. chá)', 'Sal e limão'],
    passos: ['Misture o frango desfiado com requeijão, mostarda, cenoura ralada, cheiro-verde e limão.', 'Recheie o pão francês e aqueça na sanduicheira ou frigideira.'],
    tags: ['frango', 'queijo'], video: 'patê de frango fit com cenoura',
  },
  {
    id: 'tapioca-frango-catupiry', nome: 'Tapioca de frango com requeijão', slots: ['pos', 'lanche', 'cafe'], minutos: 8,
    itens: [i('tapioca', 1.5), i('frango-desfiado', 1), i('requeijao-light')],
    temperos: ['Orégano', 'Páprica', 'Cebolinha'],
    passos: ['Faça a tapioca na frigideira quente.', 'Recheie com frango desfiado temperado e requeijão.', 'Dobre e deixe 1 minuto para aquecer.'],
    tags: ['frango', 'queijo'], video: 'tapioca de frango com catupiry fit',
  },
  {
    id: 'iogurte-whey-fruta', nome: 'Iogurte batido com whey e manga', slots: ['pos', 'lanche', 'ceia'], minutos: 3,
    itens: [i('iogurte-natural'), i('whey'), i('manga', 0.7)],
    temperos: ['Hortelã ou canela'],
    passos: ['Bata o iogurte com o whey até ficar liso.', 'Misture a manga em cubos.'],
    tags: ['laticinio', 'whey', 'doce'], video: 'iogurte proteico com whey receita',
  },

  // ---------- Almoço / jantar ----------
  {
    id: 'frango-curry', nome: 'Frango ao curry com arroz', slots: ['almoco', 'jantar'], minutos: 25,
    itens: [i('frango-grelhado', 1.5), i('arroz-branco', 1.5), i('creme-light'), i('cebola', 0.5), i('legumes', 0.5)],
    temperos: ['Curry em pó (1 col. sopa)', 'Gengibre ralado', 'Alho', 'Cúrcuma', 'Coentro ou salsinha'],
    passos: ['Doure cubos de frango com alho, gengibre e cebola.', 'Junte o curry e a cúrcuma, mexa 1 minuto para soltar o aroma.', 'Adicione ½ xícara de água e o creme de leite light, cozinhe 8 min até engrossar. Sirva com arroz.'],
    dica: 'Tostar o curry no óleo antes do líquido é o segredo do sabor.', tags: ['frango', 'cebola', 'laticinio', 'coentro'], video: 'frango ao curry fácil',
  },
  {
    id: 'frango-xadrez', nome: 'Frango xadrez caseiro (sem molho de ostra)', slots: ['almoco', 'jantar'], minutos: 20,
    itens: [i('frango-grelhado', 1.5), i('arroz-branco', 1.5), i('pimentao'), i('cebola', 0.5), i('shoyu', 2), i('amendoim', 0.4)],
    temperos: ['Gengibre', 'Alho', 'Amido de milho (1 col. chá)', 'Cebolinha', 'Óleo de gergelim (gotas)'],
    passos: ['Doure cubos de frango em fogo alto.', 'Junte pimentão, cebola, alho e gengibre e salteie 3 min.', 'Dissolva o amido no shoyu com ¼ xícara de água, adicione e mexa até brilhar. Finalize com amendoim e cebolinha.'],
    dica: 'Restaurante costuma usar molho de ostra — esta versão usa só shoyu.', tags: ['frango', 'pimentao', 'cebola'], video: 'frango xadrez caseiro fácil',
  },
  {
    id: 'strogonoff-fit', nome: 'Strogonoff fit de frango', slots: ['almoco', 'jantar'], minutos: 25,
    itens: [i('frango-grelhado', 1.4), i('arroz-branco', 1.5), i('cogumelo', 0.5), i('molho-tomate', 0.5), i('iogurte-natural', 0.6), i('cebola', 0.5)],
    temperos: ['Mostarda', 'Alho', 'Páprica doce', 'Sal'],
    passos: ['Doure o frango em cubos com cebola e alho.', 'Junte cogumelos, molho de tomate, mostarda e páprica; cozinhe 5 min.', 'Desligue o fogo e misture o iogurte (fora do fogo para não talhar). Sirva com arroz.'],
    tags: ['frango', 'cogumelo', 'laticinio', 'cebola'], video: 'strogonoff de frango fit com iogurte',
  },
  {
    id: 'escondidinho-mandioca', nome: 'Escondidinho de mandioca com carne moída', slots: ['almoco', 'jantar'], minutos: 40,
    itens: [i('mandioca', 1.8), i('patinho', 1.2), i('molho-tomate', 0.5), i('mussarela', 0.5), i('cebola', 0.5)],
    temperos: ['Alho', 'Cominho', 'Páprica', 'Cheiro-verde', 'Pimenta-do-reino'],
    passos: ['Cozinhe e amasse a mandioca com um pouco da água do cozimento e sal.', 'Refogue a carne com cebola, alho, cominho, páprica e molho de tomate.', 'Monte em camadas (carne embaixo, purê em cima), cubra com queijo e gratine.'],
    tags: ['carne', 'mandioca', 'queijo', 'cebola'], video: 'escondidinho de mandioca com carne moída',
  },
  {
    id: 'bolonhesa', nome: 'Macarrão integral à bolonhesa', slots: ['almoco', 'jantar'], minutos: 25,
    itens: [i('macarrao-integral', 1.4), i('patinho', 1.2), i('molho-tomate', 1), i('parmesao'), i('cebola', 0.5)],
    temperos: ['Alho', 'Manjericão', 'Orégano', 'Pimenta calabresa (opcional)'],
    passos: ['Refogue cebola e alho, junte a carne e doure bem (não mexa demais, deixe criar casquinha).', 'Adicione molho de tomate, orégano e cozinhe 10 min.', 'Misture ao macarrão cozido e finalize com parmesão e manjericão.'],
    tags: ['carne', 'queijo', 'cebola'], video: 'macarrão à bolonhesa caseiro',
  },
  {
    id: 'bife-acebolado', nome: 'Bife acebolado com arroz, feijão e salada', slots: ['almoco', 'jantar'], minutos: 20,
    itens: [i('alcatra', 1.2), i('arroz-branco', 1.5), i('feijao'), i('cebola'), i('salada-folhas'), i('azeite')],
    temperos: ['Alho', 'Sal grosso', 'Pimenta-do-reino', 'Vinagre ou limão na salada'],
    passos: ['Tempere os bifes com alho, sal e pimenta.', 'Sele em frigideira bem quente, 2 min de cada lado.', 'Na mesma frigideira, doure a cebola em rodelas e jogue por cima.'],
    tags: ['carne', 'cebola', 'feijao'], video: 'bife acebolado suculento',
  },
  {
    id: 'picadinho', nome: 'Picadinho de carne com batata e cenoura', slots: ['almoco', 'jantar'], minutos: 35,
    itens: [i('musculo', 1.3), i('batata', 1.5), i('cenoura', 1), i('arroz-branco', 1), i('molho-tomate', 0.5)],
    temperos: ['Alho', 'Cebola', 'Louro', 'Colorau', 'Cheiro-verde'],
    passos: ['Doure a carne em cubos com alho e cebola.', 'Junte colorau, louro, molho de tomate e água; cozinhe na pressão 20 min.', 'Adicione batata e cenoura e cozinhe mais 8 min.'],
    dica: 'Comida de vó: rende marmita e congela bem.', tags: ['carne', 'legumes'], video: 'picadinho de carne com batata na pressão',
  },
  {
    id: 'frango-limao-ervas', nome: 'Frango assado com limão, alho e ervas + batata-doce', slots: ['almoco', 'jantar'], minutos: 35,
    itens: [i('sobrecoxa', 1.3), i('batata-doce', 2), i('brocolis'), i('azeite')],
    temperos: ['Limão', 'Alho amassado', 'Alecrim', 'Tomilho', 'Páprica', 'Sal e pimenta'],
    passos: ['Marine a sobrecoxa com limão, alho, ervas, páprica e sal por 30 min (ou de véspera).', 'Asse com a batata-doce em cubos a 200 °C por 30 min (airfryer: 20-25 min).', 'Sirva com brócolis no vapor e um fio de azeite.'],
    dica: 'Sobrecoxa fica mais suculenta que peito e aceita bem tempero forte.', tags: ['frango'], video: 'sobrecoxa assada com limão e ervas airfryer',
  },
  {
    id: 'hamburguer-caseiro', nome: 'Hambúrguer caseiro de patinho com queijo', slots: ['almoco', 'jantar'], minutos: 20,
    itens: [i('hamburguer-caseiro'), i('pao-hamburguer'), i('mussarela', 0.7), i('tomate', 0.5), i('salada-folhas', 0.5)],
    temperos: ['Sal', 'Pimenta-do-reino', 'Alho em pó', 'Cebola em pó', 'Mostarda e ketchup sem açúcar'],
    passos: ['Modele o hambúrguer só com carne, sal e pimenta (não amasse demais).', 'Grelhe em frigideira bem quente 3-4 min de cada lado; coloque o queijo no final e tampe.', 'Monte com folhas, tomate e molhos.'],
    tags: ['carne', 'queijo'], video: 'hambúrguer caseiro suculento na frigideira',
  },
  {
    id: 'lombo-mostarda-mel', nome: 'Lombo suíno com mostarda e mel + purê de abóbora', slots: ['almoco', 'jantar'], minutos: 40,
    itens: [i('lombo-porco', 1.3), i('abobora', 2), i('mel', 0.5), i('arroz-branco', 1), i('salada-folhas')],
    temperos: ['Mostarda (2 col. sopa)', 'Alho', 'Alecrim', 'Noz-moscada no purê'],
    passos: ['Pincele o lombo com mostarda, mel, alho e alecrim.', 'Asse a 200 °C por 30-35 min, regando com o caldo.', 'Cozinhe e amasse a abóbora com sal e noz-moscada.'],
    tags: ['porco', 'abobora', 'doce'], video: 'lombo com mostarda e mel assado',
  },
  {
    id: 'chili', nome: 'Chili de carne com feijão (apimentado)', slots: ['almoco', 'jantar'], minutos: 30,
    itens: [i('patinho', 1.2), i('feijao-preto', 1.5), i('molho-tomate', 1), i('arroz-branco', 1), i('cebola', 0.5), i('pimentao', 0.5)],
    temperos: ['Cominho', 'Páprica defumada', 'Pimenta em pó (chili)', 'Alho', 'Orégano', 'Limão'],
    passos: ['Doure a carne com cebola, pimentão e alho.', 'Junte cominho, páprica, chili e orégano; mexa 1 min.', 'Adicione feijão e molho de tomate, cozinhe 15 min. Finalize com limão.'],
    tags: ['carne', 'feijao', 'apimentado', 'cebola', 'pimentao'], video: 'chili com carne caseiro',
  },
  {
    id: 'burrito-bowl', nome: 'Burrito bowl de frango', slots: ['almoco', 'jantar'], minutos: 20,
    itens: [i('arroz-branco', 1.3), i('feijao-preto'), i('frango-grelhado', 1.3), i('milho'), i('tomate', 0.7), i('abacate')],
    temperos: ['Cominho', 'Páprica', 'Alho', 'Limão', 'Coentro (opcional)', 'Pimenta jalapeño (opcional)'],
    passos: ['Tempere e grelhe o frango com cominho, páprica, alho e limão.', 'Monte a tigela: arroz, feijão preto, frango fatiado, milho, tomate.', 'Finalize com abacate amassado com limão e sal.'],
    tags: ['frango', 'feijao', 'coentro'], video: 'burrito bowl de frango',
  },
  {
    id: 'grao-bico-marroquino', nome: 'Frango com grão-de-bico ao estilo marroquino', slots: ['almoco', 'jantar'], minutos: 25,
    itens: [i('frango-grelhado', 1.3), i('grao-bico', 1.2), i('molho-tomate', 0.7), i('cebola', 0.5), i('arroz-branco', 0.8)],
    temperos: ['Cominho', 'Canela (pitada)', 'Páprica', 'Gengibre', 'Hortelã ou salsinha', 'Limão'],
    passos: ['Doure o frango com cebola, alho e gengibre.', 'Junte as especiarias, o grão-de-bico e o molho de tomate; cozinhe 10 min.', 'Finalize com hortelã e limão.'],
    tags: ['frango', 'leguminosa', 'cebola'], video: 'frango com grão de bico marroquino',
  },
  {
    id: 'kafta-iogurte', nome: 'Kafta com molho de iogurte e alho + arroz', slots: ['almoco', 'jantar'], minutos: 25,
    itens: [i('patinho', 1.3), i('arroz-branco', 1.3), i('iogurte-natural', 0.5), i('salada-folhas'), i('tomate', 0.5)],
    temperos: ['Hortelã', 'Salsinha', 'Cebola ralada', 'Pimenta síria', 'Alho no molho', 'Limão'],
    passos: ['Misture a carne com cebola ralada, hortelã, salsinha, pimenta síria e sal; modele em espetos ou rolinhos.', 'Grelhe ou asse na airfryer 12 min.', 'Molho: iogurte + alho amassado + limão + sal.'],
    tags: ['carne', 'laticinio', 'cebola'], video: 'kafta caseira na airfryer',
  },
  {
    id: 'fricasse-fit', nome: 'Fricassê fit de frango com batata-palha de forno', slots: ['almoco', 'jantar'], minutos: 30,
    itens: [i('frango-desfiado', 1.4), i('requeijao-light', 1.5), i('milho'), i('batata', 1.5), i('arroz-branco', 1)],
    temperos: ['Alho', 'Cebola', 'Cheiro-verde', 'Noz-moscada'],
    passos: ['Refogue o frango desfiado com alho, cebola e milho.', 'Misture o requeijão e um pouco de leite até ficar cremoso.', 'Cubra com batata ralada fina assada (airfryer 10 min) no lugar da batata-palha.'],
    tags: ['frango', 'queijo'], video: 'fricassê de frango fit',
  },
  {
    id: 'baiao-de-dois', nome: 'Baião de dois fit com carne de sol e coalho', slots: ['almoco', 'jantar'], minutos: 30,
    itens: [i('arroz-branco', 1.3), i('feijao'), i('carne-sol', 1), i('queijo-coalho', 0.5), i('cebola', 0.5)],
    temperos: ['Coentro', 'Alho', 'Cominho', 'Pimenta-de-cheiro'],
    passos: ['Dessalgue e desfie a carne de sol; doure com alho e cebola.', 'Junte o feijão cozido com caldo e o arroz cozido; misture.', 'Finalize com coalho em cubos grelhado e coentro.'],
    tags: ['carne', 'feijao', 'queijo', 'coentro', 'cebola'], video: 'baião de dois com carne de sol',
  },
  {
    id: 'cuscuz-frango', nome: 'Cuscuz recheado com frango desfiado', slots: ['jantar', 'lanche', 'cafe'], minutos: 15,
    itens: [i('cuscuz', 1.5), i('frango-desfiado', 1), i('tomate', 0.5), i('milho', 0.5)],
    temperos: ['Colorau', 'Alho', 'Cebolinha', 'Sal'],
    passos: ['Prepare o cuscuz no vapor.', 'Refogue o frango com alho, colorau, tomate e milho.', 'Sirva o cuscuz coberto com o frango.'],
    tags: ['frango'], video: 'cuscuz recheado com frango',
  },

  // ---------- Ceia ----------
  {
    id: 'mousse-cacau', nome: 'Mousse proteica de cacau', slots: ['ceia', 'lanche'], minutos: 5,
    itens: [i('iogurte-grego-0'), i('whey', 0.5), i('cacau'), i('chocolate-70', 0.5)],
    temperos: ['Canela', 'Pitada de sal'],
    passos: ['Misture o iogurte com o whey e o cacau até ficar liso.', 'Leve 20 min ao congelador.', 'Finalize com chocolate 70% ralado.'],
    tags: ['laticinio', 'doce', 'whey'], video: 'mousse proteica de chocolate com iogurte',
  },
  {
    id: 'iogurte-pasta-amendoim', nome: 'Iogurte grego com pasta de amendoim e canela', slots: ['ceia'], minutos: 2,
    itens: [i('iogurte-grego-0'), i('pasta-amendoim'), i('castanha-para')],
    temperos: ['Canela'],
    passos: ['Misture a pasta de amendoim no iogurte, polvilhe canela e as castanhas picadas.'],
    tags: ['laticinio', 'doce'], video: 'iogurte com pasta de amendoim',
  },
  {
    id: 'ovos-temperados-ceia', nome: 'Ovos cozidos com sal temperado + queijo minas', slots: ['ceia', 'lanche'], minutos: 12,
    itens: [i('ovo', 2), i('queijo-minas'), i('tomate', 0.5)],
    temperos: ['Sal com páprica e pimenta', 'Orégano', 'Azeite (gotas)'],
    passos: ['Cozinhe os ovos 9 min, esfrie em água gelada.', 'Corte e tempere com sal, páprica, pimenta e orégano.', 'Sirva com queijo minas e tomate.'],
    tags: ['ovo', 'queijo'], video: 'ovo cozido perfeito',
  },
]

/** Kit de temperos: misturas caseiras para dar sabor sem muitas calorias */
export const TEMPEROS = [
  { nome: 'Cajun caseiro', receita: '2 páprica defumada · 1 alho em pó · 1 cebola em pó · 1 orégano · ½ cominho · ¼ pimenta-caiena', usa: 'Frango, batata, carne moída' },
  { nome: 'Tempero baiano leve', receita: '1 cúrcuma · 1 cominho · 1 páprica · 1 pimenta-do-reino · 1 orégano · ½ coentro em pó', usa: 'Frango, feijão, arroz' },
  { nome: 'Chimichurri', receita: 'Salsinha · orégano · alho · pimenta calabresa · vinagre · um pouco de azeite', usa: 'Carne grelhada, frango' },
  { nome: 'Lemon pepper caseiro', receita: 'Raspas de limão secas · pimenta-do-reino moída · sal grosso', usa: 'Frango, legumes' },
  { nome: 'Marinada de iogurte', receita: 'Iogurte natural · alho · limão · páprica · cominho · sal (marinar 30 min a 12 h)', usa: 'Frango e kafta: fica macio e suculento' },
  { nome: 'Molho de iogurte e alho', receita: 'Iogurte · alho amassado · limão · hortelã · sal', usa: 'Kafta, wrap, saladas (troca maionese)' },
  { nome: 'Vinagrete', receita: 'Tomate · cebola · pimentão · vinagre · limão · cheiro-verde', usa: 'Carne, feijão, arroz' },
]

// ---------- Cálculo ----------
export function macrosItens(itens: ItemCardapio[]) {
  let kcal = 0
  let proteina = 0
  for (const it of itens) {
    const a = ALIMENTOS.find((x) => x.id === it.alimentoId)
    if (!a) continue
    kcal += a.kcal * it.qtd
    proteina += a.proteina * it.qtd
  }
  return { kcal, proteina }
}

export function macrosReceita(r: Receita, fator = 1) {
  const m = macrosItens(r.itens)
  return { kcal: m.kcal * fator, proteina: m.proteina * fator }
}

/** Fator de porção para a receita bater a meta de calorias da refeição (0,5×–2×, em passos de 0,25) */
export function fatorPara(r: Receita, kcalAlvo: number) {
  const k = macrosItens(r.itens).kcal
  if (!k) return 1
  return Math.min(2, Math.max(0.5, Math.round((kcalAlvo / k) * 4) / 4))
}

export function receitasPara(slot: Slot, naoCurto: string[]) {
  return RECEITAS.filter((r) => r.slots.includes(slot) && !r.tags.some((t) => naoCurto.includes(t)))
}

export const linkVideo = (r: Receita) => `https://www.youtube.com/results?search_query=${encodeURIComponent(r.video + ' receita')}`

export const CANAIS = [
  { nome: 'Fast & Fit Brasil', url: 'https://www.youtube.com/channel/UC6D1NnWCVxDDiQvHch1L8Mw', desc: 'Pratos, lanches e sobremesas fit com ingredientes do dia a dia.' },
  { nome: 'Receiteria — receitas fit com frango', url: 'https://www.receiteria.com.br/receitas-fit-com-frango/', desc: 'Site com coletânea de receitas fit de frango.' },
  { nome: 'Receiteria — marmitas fitness', url: 'https://www.receiteria.com.br/receitas-para-marmita-fitness/', desc: 'Ideias de marmitas para a semana.' },
]

/** Slot do plano a partir do horário (com treino às 9h, 11:30 é pós-treino) */
export function slotDoHorario(h: string): Slot {
  if (h < '10:00') return 'cafe'
  if (h < '12:30') return 'pos'
  if (h < '14:30') return 'almoco'
  if (h < '18:00') return 'lanche'
  if (h < '21:00') return 'jantar'
  return 'ceia'
}
