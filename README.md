# FORJA — treino e dieta (PWA pessoal)

App de treino e dieta instalável no celular. É offline-first, não tem backend e guarda tudo no próprio aparelho (IndexedDB). A interface está toda em português do Brasil.

- **Hoje**: treino do dia com "Iniciar treino", refeições, água e a sequência de treinos.
- **Modo treino** (estilo Hevy): mostra a animação do exercício em loop (toque para ampliar), as séries com a carga anterior ao lado e abre o descanso em anel sozinho ao marcar uma série. Também tem vibração, confete em recorde pessoal, sugestão de subir a carga e mantém a tela ligada.
- **Como fazer**: tem três abas. Resumo traz a animação e o mapa muscular frontal e de costas. Instruções traz os passos, os erros comuns e a respiração. Histórico traz as cargas anteriores.
- **Exercícios**: ~880 exercícios com busca e filtros por músculo, equipamento e dificuldade, mais o filtro "Minha academia".
- **Treinos**: o meu plano de 4 dias, com séries automáticas por semana, e 9 programas prontos com fonte. Dá para criar e editar rotinas.
- **Dieta**: plano de 2.300 kcal / 165 g de proteína em 6 refeições, banco de alimentos brasileiros, água, 7 guias de dieta e calculadora Mifflin-St Jeor. Por padrão **nada leva peixe ou frutos do mar**.
- **Receitas e variações**: 33 receitas temperadas. O botão "Trocar" ajusta a porção às calorias da refeição. Tem filtro "Não curto", kit de temperos, link para vídeos no YouTube e o bloco "O que comer agora", que se adapta quando você treina fora do horário.
- **Progresso**: gráficos de peso, cintura e carga por exercício. As fotos ficam só no aparelho. Exporta e importa backup em JSON.
- **Modo cuidado**: para calor e fadiga. Traz checklist antes do treino, lembrete de água a cada 15 minutos e os sinais para parar.

> O app é informativo e não substitui médico, nutricionista ou educador físico.

## Instalar no celular

Abra o link do app (GitHub Pages, veja abaixo).

**Android (Chrome)**
1. Abra o link no Chrome.
2. Toque em **⋮** (menu) → **Instalar app** (ou **Adicionar à tela inicial**).
3. Confirme. O ícone da FORJA aparece na tela inicial e o app abre em tela cheia.

**iPhone (Safari)**
1. Abra o link **no Safari**. Outros navegadores do iPhone não instalam PWA da mesma forma.
2. Toque em **Compartilhar** (o quadrado com a seta para cima).
3. Role e toque em **Adicionar à Tela de Início** → **Adicionar**.

Depois de abrir uma vez com internet, o app funciona offline. Para ter **todas** as animações sem internet (~20 MB), vá em **Ajustes → Baixar todas as animações**. As do seu plano e dos programas já ficam salvas.

No iPhone o navegador não permite vibração. Faça backup de vez em quando em **Progresso → Backup**.

## Atualizar o app

1. Altere o código ou os dados e faça merge na branch `main`. O GitHub Actions (`.github/workflows/deploy.yml`) gera o build e publica sozinho.
2. Da próxima vez que o app for aberto no celular, aparece **"Nova versão disponível → Atualizar"**. Seus dados continuam no aparelho.
3. Para mudar exercícios ou mídia, edite `data/` e rode `npm run dados` antes do build.

## Desenvolvimento

```bash
npm install
npm run dev            # http://localhost:5173
npm run dados          # baixa e normaliza exercícios e gera as animações (Python 3 + Pillow)
npm run build          # build de produção em dist/
npm run preview        # serve o build em http://localhost:4173
npm run test:e2e       # teste ponta a ponta em viewport de celular (requer o preview rodando)
```

Stack: Vite, React, TypeScript, Tailwind CSS 4, Zustand, Dexie (IndexedDB), Recharts e vite-plugin-pwa (Workbox). As fontes Barlow Condensed e Inter são hospedadas localmente.

### Estrutura

```
scripts/build_exercises.py   pipeline de dados e mídia
data/                        exercises.json, traduções, media-overrides.json, ids do plano/programas
public/media/                animações WebP e miniaturas geradas
src/content/                 plano, programas, dieta, alimentos, modo cuidado
src/lib/                     banco (Dexie), estado do treino (Zustand), consultas, hooks
src/components/ e screens/   interface
docs/MIDIA-E-LICENCAS.md     comparação das fontes e decisão de licença
```

## Privacidade e hospedagem

- Não há conta, servidor, anúncios nem rastreamento. Treinos, dieta, medidas e fotos ficam só no IndexedDB do aparelho.
- O site tem `noindex` e `robots.txt` bloqueando buscadores. O link do GitHub Pages não é secreto: quem tiver o link consegue abrir o app vazio, mas nunca os seus dados.
