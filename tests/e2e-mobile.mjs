// Teste ponta a ponta em viewport de celular (Pixel 7):
// abrir → onboarding → iniciar treino → marcar série (timer de descanso) →
// ver animação carregada → "Como fazer" → finalizar → recarregar OFFLINE.
// Uso: node tests/e2e-mobile.mjs [url] [pasta-de-screenshots]
import { createRequire } from 'node:module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')

const URL = process.argv[2] ?? 'http://localhost:4173/'
const OUT = process.argv[3] ?? 'test-results'
const browser = await chromium.launch()
const ctx = await browser.newContext({ ...devices['Pixel 7'] })
const page = await ctx.newPage()
const erros = []
page.on('pageerror', (e) => erros.push(String(e)))
page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
const ok = (c, msg) => { if (!c) throw new Error('FALHOU: ' + msg); console.log('✓', msg) }
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` })

await page.goto(URL)
await page.getByRole('dialog', { name: 'Bem-vindo à FORJA' }).waitFor()
await shot('01-boasvindas')
await page.getByPlaceholder('Seu nome').fill('Teste')
await page.getByRole('button', { name: 'Começar' }).click()
await page.getByRole('heading', { name: /Teste/ }).waitFor(); ok(true, 'onboarding salvo e saudação com nome')
await page.waitForTimeout(600)
await shot('02-hoje')

// Service worker ativo (necessário para offline)
await page.waitForFunction(() => navigator.serviceWorker?.controller != null || navigator.serviceWorker?.ready, null, { timeout: 15000 })
await page.evaluate(() => navigator.serviceWorker.ready)
ok(true, 'service worker registrado')

// Inicia treino do Meu plano (Superior A) pela aba Treinos
await page.getByRole('link', { name: 'Treinos' }).click()
await page.getByRole('heading', { name: 'Superior A' }).waitFor()
await shot('03-treinos')
await page.getByRole('heading', { name: 'Superior A' }).locator('xpath=ancestor::div[contains(@class,"rounded-[20px]")]').getByRole('button', { name: 'Iniciar' }).click()
// modo cuidado ligado por padrão no onboarding → checklist
const chk = page.getByRole('dialog', { name: 'Antes de começar' })
if (await chk.isVisible().catch(() => false)) {
  await shot('04-checklist')
  await chk.getByRole('button', { name: /iniciar/i }).click()
}
await page.getByText('Supino reto com halteres').first().waitFor()
const img = page.locator('img[alt="Demonstração: Supino reto com halteres"]').first()
await img.waitFor()
await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img.elementHandle())
const src = await img.getAttribute('src')
ok(src.endsWith('.webp'), 'animação WebP local carregada: ' + src)
await shot('05-modo-treino')

await page.getByLabel('Carga da série 1 em kg').fill('20')
await page.getByLabel('Repetições da série 1').fill('10')
await page.getByRole('button', { name: 'Marcar série 1 como feita' }).click()
await page.getByRole('timer').waitFor()
ok(true, 'temporizador de descanso abriu sozinho')
await shot('06-descanso')
await page.getByRole('button', { name: 'Pular descanso' }).click()

await page.getByRole('button', { name: 'Como fazer' }).click()
await page.getByRole('tab', { name: 'Resumo' }).waitFor()
ok(await page.locator('svg[role=img][aria-label="Frente"]').isVisible(), 'mapa muscular frontal visível')
await shot('07-como-fazer-resumo')
await page.getByRole('tab', { name: 'Instruções' }).click()
ok(await page.getByText('Erros comuns').isVisible(), 'instruções em PT-BR com erros comuns')
await shot('08-como-fazer-instrucoes')
await page.getByRole('button', { name: 'Fechar' }).last().click(); await page.waitForTimeout(400); await shot('08b-apos-fechar')

await page.getByText('Pronto para usar offline.').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {})
await page.getByRole('button', { name: 'Finalizar' }).first().click()
await page.getByRole('button', { name: 'Salvar treino' }).click()
await page.getByText('Treino concluído').waitFor()
ok(true, 'treino salvo')
await shot('09-resumo')
await page.getByRole('button', { name: 'Voltar para Hoje' }).click()

// Exercícios: filtro Minha academia
await page.getByRole('link', { name: 'Exercícios' }).click()
const contador = page.locator('p[aria-live="polite"]')
await page.waitForFunction(() => Number(document.querySelector('p[aria-live="polite"]')?.textContent?.match(/\d+/)?.[0] ?? 0) > 100)
const n1 = Number((await contador.textContent()).match(/\d+/)[0])
await page.getByText('Minha academia', { exact: true }).click()
await page.waitForTimeout(200)
const n2 = Number((await contador.textContent()).match(/\d+/)[0])
ok(n2 > n1, `filtro Minha academia (${n1}) vs todos (${n2})`)
await page.getByText('Minha academia', { exact: true }).click()
await page.getByPlaceholder(/Buscar/).fill('leg press')
await page.waitForTimeout(200)
ok((await contador.textContent()).startsWith('0 '), 'leg press não aparece na Minha academia')
await page.getByPlaceholder(/Buscar/).fill('')
await shot('10-exercicios')

await page.getByRole('link', { name: 'Dieta' }).click()
await page.getByRole('tab', { name: 'Plano' }).click()
const tot = await page.getByText(/kcal · \d+ g proteína/).first().textContent()
console.log('  plano de dieta:', tot)
await shot('11-dieta-plano')
await page.getByRole('tab', { name: 'Hoje' }).click()
await shot('11b-dieta-hoje')

// Pós-treino + variações de dieta
await page.getByRole('link', { name: 'Hoje' }).click()
await page.getByText('O que comer agora').first().waitFor()
ok(true, 'Hoje mostra "O que comer agora" depois do treino')
await page.getByRole('link', { name: 'Dieta' }).click()
await page.getByRole('tab', { name: 'Hoje' }).click()
await page.getByText('Wrap de frango cajun').first().click()
await page.getByRole('link', { name: /Ver vídeos dessa receita/ }).waitFor()
await shot('14-receita')
await page.getByRole('button', { name: 'Comi isso agora' }).click()
await page.getByText('Registrado!').waitFor()
ok(true, 'receita pós-treino registrada')
await page.getByRole('button', { name: 'Trocar Almoço' }).click()
await page.getByRole('button', { name: 'Escolher Frango ao curry com arroz' }).click()
await page.getByText('Frango ao curry com arroz').first().waitFor()
ok(true, 'almoço trocado por variação')
await shot('15-dieta-trocada')
await page.getByRole('tab', { name: 'Receitas' }).click()
await page.getByRole('button', { name: 'Frango', exact: true }).click()
await page.getByText('Frango ao curry com arroz').waitFor({ state: 'detached', timeout: 5000 }); ok(true, 'filtro "não curto" esconde receitas com frango')
await page.getByRole('button', { name: '✕ Frango' }).click()
await shot('16-receitas')

await page.getByRole('link', { name: 'Progresso' }).click()
await page.getByRole('tab', { name: 'Cargas' }).click()
await shot('12-progresso')

// OFFLINE: recarrega sem rede
await ctx.setOffline(true)
await page.goto(URL + '#/treinos')
await page.getByRole('heading', { name: 'Superior B' }).waitFor({ timeout: 10000 })
await page.goto(URL + '#/exercicios/Incline_Dumbbell_Press')
const img2 = page.locator('img[alt="Demonstração: Supino inclinado com halteres"]').first()
await img2.waitFor()
await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, await img2.elementHandle(), { timeout: 10000 })
ok(true, 'offline: app abre e animação do plano carrega do cache')
await shot('13-offline-exercicio')
const hist = await page.evaluate(async () => (await new Promise((r) => { const q = indexedDB.open('forja'); q.onsuccess = () => { const t = q.result.transaction('sessoes').objectStore('sessoes').count(); t.onsuccess = () => r(t.result) } })))
ok(hist === 1, 'treino persistido no IndexedDB')

const relevantes = erros.filter((e) => !/net::ERR_INTERNET_DISCONNECTED|Failed to fetch|ERR_FAILED/.test(e))
ok(relevantes.length === 0, 'sem erros de JavaScript' + (relevantes.length ? ': ' + relevantes.join(' | ') : ''))
await browser.close()
console.log('TUDO OK')
