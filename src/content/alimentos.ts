/**
 * Banco de alimentos brasileiros — valores aproximados por porção,
 * baseados na TACO (Tabela Brasileira de Composição de Alimentos, NEPA/UNICAMP)
 * e em rótulos comuns. Peixes e frutos do mar NÃO fazem parte da base.
 */
export interface Alimento {
  id: string
  nome: string
  porcao: string
  g: number
  kcal: number
  proteina: number
  grupo: 'proteina' | 'carbo' | 'fruta' | 'laticinio' | 'gordura' | 'vegetal' | 'lanche' | 'bebida' | 'pronto'
  /** marca alimentos que podem conter peixe/frutos do mar escondidos */
  alerta?: string
}

const a = (id: string, nome: string, porcao: string, g: number, kcal: number, proteina: number, grupo: Alimento['grupo'], alerta?: string): Alimento =>
  ({ id, nome, porcao, g, kcal, proteina, grupo, alerta })

export const ALIMENTOS: Alimento[] = [
  // Proteínas
  a('frango-grelhado', 'Peito de frango grelhado', '100 g', 100, 159, 32, 'proteina'),
  a('frango-desfiado', 'Frango desfiado', '100 g', 100, 163, 30, 'proteina'),
  a('sobrecoxa', 'Sobrecoxa assada sem pele', '100 g', 100, 215, 26, 'proteina'),
  a('patinho', 'Patinho moído refogado', '100 g', 100, 219, 36, 'proteina'),
  a('alcatra', 'Alcatra grelhada', '100 g', 100, 241, 32, 'proteina'),
  a('contrafile', 'Contrafilé grelhado', '100 g', 100, 278, 32, 'proteina'),
  a('musculo', 'Músculo cozido', '100 g', 100, 194, 32, 'proteina'),
  a('lombo-porco', 'Lombo de porco assado', '100 g', 100, 210, 36, 'proteina'),
  a('carne-sol', 'Carne de sol', '100 g', 100, 263, 33, 'proteina'),
  a('peru', 'Peito de peru fatiado', '4 fatias (40 g)', 40, 44, 7, 'proteina'),
  a('ovo', 'Ovo inteiro cozido', '1 unidade (50 g)', 50, 73, 6.6, 'proteina'),
  a('clara', 'Clara de ovo', '1 clara (33 g)', 33, 17, 3.6, 'proteina'),
  a('omelete', 'Omelete 2 ovos', '1 unidade', 110, 190, 13, 'proteina'),
  a('whey', 'Whey protein', '1 scoop (30 g)', 30, 120, 24, 'proteina'),
  a('tofu', 'Tofu', '100 g', 100, 76, 8, 'proteina'),
  a('soja-ptn', 'Proteína texturizada de soja (hidratada)', '100 g', 100, 108, 15, 'proteina'),
  a('linguica-frango', 'Linguiça de frango grelhada', '1 gomo (60 g)', 60, 130, 10, 'proteina'),
  a('hamburguer-caseiro', 'Hambúrguer caseiro de patinho', '1 unidade (120 g)', 120, 245, 30, 'proteina'),
  // Carboidratos
  a('arroz-branco', 'Arroz branco cozido', '4 col. sopa (100 g)', 100, 128, 2.5, 'carbo'),
  a('arroz-integral', 'Arroz integral cozido', '4 col. sopa (100 g)', 100, 124, 2.6, 'carbo'),
  a('feijao', 'Feijão carioca cozido', '1 concha (100 g)', 100, 76, 4.8, 'carbo'),
  a('feijao-preto', 'Feijão preto cozido', '1 concha (100 g)', 100, 77, 4.5, 'carbo'),
  a('lentilha', 'Lentilha cozida', '1 concha (100 g)', 100, 93, 6.3, 'carbo'),
  a('grao-bico', 'Grão-de-bico cozido', '100 g', 100, 130, 7, 'carbo'),
  a('batata-doce', 'Batata-doce cozida', '100 g', 100, 77, 0.6, 'carbo'),
  a('batata', 'Batata inglesa cozida', '100 g', 100, 52, 1.2, 'carbo'),
  a('mandioca', 'Mandioca cozida', '100 g', 100, 125, 0.6, 'carbo'),
  a('macarrao', 'Macarrão cozido', '1 pegador (110 g)', 110, 135, 4.4, 'carbo'),
  a('macarrao-integral', 'Macarrão integral cozido', '1 pegador (110 g)', 110, 137, 5.5, 'carbo'),
  a('cuscuz', 'Cuscuz de milho', '1 fatia (100 g)', 100, 113, 2.2, 'carbo'),
  a('tapioca', 'Tapioca (goma)', '3 col. sopa (40 g)', 40, 96, 0, 'carbo'),
  a('pao-frances', 'Pão francês', '1 unidade (50 g)', 50, 150, 4.7, 'carbo'),
  a('pao-integral', 'Pão de forma integral', '2 fatias (50 g)', 50, 126, 5, 'carbo'),
  a('pao-queijo', 'Pão de queijo', '1 médio (40 g)', 40, 145, 2.1, 'carbo'),
  a('aveia', 'Aveia em flocos', '3 col. sopa (30 g)', 30, 118, 4.2, 'carbo'),
  a('granola', 'Granola sem açúcar', '3 col. sopa (30 g)', 30, 130, 3.5, 'carbo'),
  a('farofa', 'Farofa pronta', '2 col. sopa (20 g)', 20, 81, 0.3, 'carbo'),
  a('milho', 'Milho verde', '3 col. sopa (60 g)', 60, 59, 2, 'carbo'),
  a('crepioca', 'Crepioca (1 ovo + 2 col. goma)', '1 unidade', 75, 150, 7, 'carbo'),
  a('rap10', 'Pão folha (wrap)', '1 unidade (36 g)', 36, 105, 3, 'carbo'),
  // Frutas
  a('banana', 'Banana prata', '1 unidade (70 g)', 70, 69, 0.9, 'fruta'),
  a('maca', 'Maçã', '1 unidade (130 g)', 130, 74, 0.4, 'fruta'),
  a('mamao', 'Mamão papaia', '1/2 unidade (150 g)', 150, 60, 0.8, 'fruta'),
  a('laranja', 'Laranja', '1 unidade (140 g)', 140, 52, 1.3, 'fruta'),
  a('melancia', 'Melancia', '1 fatia (200 g)', 200, 66, 1.8, 'fruta'),
  a('morango', 'Morango', '10 unidades (120 g)', 120, 36, 1, 'fruta'),
  a('abacate', 'Abacate', '2 col. sopa (60 g)', 60, 58, 0.7, 'fruta'),
  a('manga', 'Manga', '1/2 unidade (150 g)', 150, 96, 0.6, 'fruta'),
  a('acai', 'Açaí puro (sem xarope)', '200 g', 200, 116, 1.6, 'fruta'),
  a('uva', 'Uva', '1 cacho pequeno (100 g)', 100, 53, 0.7, 'fruta'),
  a('abacaxi', 'Abacaxi', '1 fatia (100 g)', 100, 48, 0.9, 'fruta'),
  // Laticínios
  a('leite-desnatado', 'Leite desnatado', '1 copo (250 ml)', 250, 85, 8.5, 'laticinio'),
  a('leite-integral', 'Leite integral', '1 copo (250 ml)', 250, 153, 8, 'laticinio'),
  a('iogurte-natural', 'Iogurte natural integral', '1 pote (170 g)', 170, 110, 7, 'laticinio'),
  a('iogurte-grego-0', 'Iogurte grego zero/proteico', '1 pote (130 g)', 130, 90, 13, 'laticinio'),
  a('queijo-minas', 'Queijo minas frescal', '1 fatia (30 g)', 30, 79, 5.2, 'laticinio'),
  a('cottage', 'Queijo cottage', '2 col. sopa (50 g)', 50, 49, 5.7, 'laticinio'),
  a('mussarela', 'Mussarela', '2 fatias (30 g)', 30, 99, 6.8, 'laticinio'),
  a('requeijao-light', 'Requeijão light', '1 col. sopa (30 g)', 30, 54, 3.3, 'laticinio'),
  a('parmesao', 'Parmesão ralado', '1 col. sopa (10 g)', 10, 45, 3.6, 'laticinio'),
  a('kefir', 'Kefir de leite', '1 copo (200 ml)', 200, 120, 7, 'laticinio'),
  // Gorduras
  a('azeite', 'Azeite de oliva', '1 col. chá (5 ml)', 5, 44, 0, 'gordura'),
  a('pasta-amendoim', 'Pasta de amendoim integral', '1 col. sopa (15 g)', 15, 88, 4, 'gordura'),
  a('castanha-para', 'Castanha-do-pará', '2 unidades (8 g)', 8, 52, 1.1, 'gordura'),
  a('castanha-caju', 'Castanha de caju', '10 unidades (20 g)', 20, 114, 3.7, 'gordura'),
  a('amendoim', 'Amendoim torrado', '1 punhado (25 g)', 25, 151, 6.8, 'gordura'),
  a('nozes', 'Nozes', '4 metades (15 g)', 15, 93, 2.2, 'gordura'),
  a('chia', 'Chia', '1 col. sopa (12 g)', 12, 58, 2, 'gordura'),
  a('linhaca', 'Linhaça dourada', '1 col. sopa (10 g)', 10, 50, 1.4, 'gordura'),
  a('manteiga', 'Manteiga', '1 col. chá (5 g)', 5, 36, 0, 'gordura'),
  // Vegetais
  a('salada-folhas', 'Salada de folhas', '1 prato (60 g)', 60, 10, 0.8, 'vegetal'),
  a('brocolis', 'Brócolis cozido', '100 g', 100, 25, 2.1, 'vegetal'),
  a('legumes', 'Legumes cozidos (cenoura, abobrinha, vagem)', '100 g', 100, 30, 1.2, 'vegetal'),
  a('tomate', 'Tomate', '1 unidade (100 g)', 100, 15, 1.1, 'vegetal'),
  a('abobora', 'Abóbora cabotiá cozida', '100 g', 100, 48, 1.4, 'vegetal'),
  a('couve', 'Couve refogada', '100 g', 100, 90, 1.7, 'vegetal'),
  // Básicos de receita e temperos
  a('molho-tomate', 'Molho de tomate caseiro', '1/2 xícara (100 g)', 100, 40, 1.5, 'vegetal'),
  a('cebola', 'Cebola', '1/2 unidade (50 g)', 50, 20, 0.6, 'vegetal'),
  a('pimentao', 'Pimentão', '1/2 unidade (60 g)', 60, 15, 0.6, 'vegetal'),
  a('cogumelo', 'Cogumelo champignon', '100 g', 100, 25, 3, 'vegetal'),
  a('cenoura', 'Cenoura ralada', '1/2 xícara (50 g)', 50, 17, 0.4, 'vegetal'),
  a('mel', 'Mel', '1 col. sopa (15 g)', 15, 46, 0, 'lanche'),
  a('cacau', 'Cacau em pó 100%', '1 col. sopa (6 g)', 6, 20, 1.2, 'lanche'),
  a('queijo-coalho', 'Queijo coalho', '1 espeto (40 g)', 40, 130, 9, 'laticinio'),
  a('creme-light', 'Creme de leite light', '2 col. sopa (30 g)', 30, 45, 0.8, 'laticinio'),
  a('pao-hamburguer', 'Pão de hambúrguer', '1 unidade (60 g)', 60, 160, 5, 'carbo'),
  a('shoyu', 'Shoyu', '1 col. sopa (15 ml)', 15, 8, 1, 'gordura'),
  // Lanches e prontos
  a('barra-proteina', 'Barra de proteína', '1 unidade (45 g)', 45, 170, 15, 'lanche'),
  a('pipoca', 'Pipoca de panela (pouco óleo)', '1 xícara (10 g)', 10, 45, 1, 'lanche'),
  a('chocolate-70', 'Chocolate 70%', '2 quadrados (20 g)', 20, 110, 1.8, 'lanche'),
  a('cafe', 'Café sem açúcar', '1 xícara', 100, 2, 0.1, 'bebida'),
  a('cafe-leite', 'Café com leite desnatado', '1 xícara (200 ml)', 200, 70, 6, 'bebida'),
  a('suco-laranja', 'Suco de laranja natural', '1 copo (250 ml)', 250, 110, 1.7, 'bebida'),
  a('agua-coco', 'Água de coco', '1 copo (300 ml)', 300, 66, 0, 'bebida'),
  a('pf', 'PF (arroz, feijão, bife, salada)', '1 prato', 450, 650, 40, 'pronto'),
  a('strogonoff-frango', 'Strogonoff de frango', '1 concha (150 g)', 150, 240, 20, 'pronto'),
  a('escondidinho', 'Escondidinho de carne', '1 porção (250 g)', 250, 380, 24, 'pronto'),
  a('lasanha', 'Lasanha à bolonhesa', '1 pedaço (250 g)', 250, 450, 24, 'pronto'),
  a('coxinha', 'Coxinha de frango', '1 unidade (80 g)', 80, 240, 8, 'lanche'),
  a('pizza-mussarela', 'Pizza mussarela', '1 fatia (110 g)', 110, 300, 13, 'pronto'),
  a('pizza-aliche', 'Pizza de aliche', '1 fatia', 110, 280, 14, 'pronto', 'Contém anchova (peixe).'),
  a('caesar', 'Salada Caesar (molho pronto)', '1 prato', 200, 300, 14, 'pronto', 'Molho Caesar tradicional leva anchova.'),
  a('yakisoba', 'Yakisoba de frango', '1 porção (300 g)', 300, 420, 22, 'pronto', 'Pode levar molho de ostra ou dashi (peixe). Confirme no restaurante.'),
  a('acaraje-sem', 'Acarajé (sem camarão)', '1 unidade', 150, 400, 10, 'pronto', 'Vatapá e caruru costumam levar camarão seco e pó de camarão.'),
]

export const INGREDIENTES_ESCONDIDOS = [
  { nome: 'Molho de ostra', onde: 'Yakisoba, frango xadrez, refogados orientais, temperos prontos.' },
  { nome: 'Molho de peixe (nam pla / nuoc mam)', onde: 'Comida tailandesa e vietnamita, alguns molhos agridoces.' },
  { nome: 'Caldo de peixe / dashi (bonito seco)', onde: 'Lámen, missoshiru, molhos japoneses, alguns caldos em tablete.' },
  { nome: 'Molho inglês (Worcestershire)', onde: 'Leva anchova. Comum em marinadas, steak tartare, Bloody Mary.' },
  { nome: 'Anchova / aliche', onde: 'Molho Caesar, pizza de aliche, pastas e tapenades.' },
  { nome: 'Camarão seco / pó de camarão', onde: 'Vatapá, caruru, acarajé, bobó, xinxim.' },
  { nome: 'Ômega-3 de óleo de peixe', onde: 'Cápsulas de suplemento, leites e ovos "enriquecidos com ômega-3/DHA".' },
  { nome: 'Colágeno marinho', onde: 'Suplementos de colágeno; prefira colágeno bovino se for usar.' },
  { nome: 'Surimi / kani', onde: 'Saladas, temakis, sushi "sem peixe" que leva kani.' },
  { nome: 'Gelatina de peixe / ictiocola', onde: 'Alguns doces, vinhos e cervejas clarificados.' },
]
