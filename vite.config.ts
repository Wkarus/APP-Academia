import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync, existsSync } from 'node:fs'

// Caminho base: "/" localmente; no GitHub Pages o workflow define BASE_PATH=/APP-Academia/
const base = process.env.BASE_PATH ?? '/'

// Animações dos exercícios do plano e dos programas entram no pré-cache (offline desde a 1ª abertura).
// As demais ficam em cache sob demanda e podem ser baixadas em Ajustes > "Baixar tudo para offline".
const ids: string[] = JSON.parse(readFileSync('data/plan-ids.json', 'utf-8'))
const progIds: string[] = existsSync('data/program-ids.json')
  ? JSON.parse(readFileSync('data/program-ids.json', 'utf-8'))
  : []
const extra = [...new Set([...ids, ...progIds])]
  .filter((id) => existsSync(`public/media/ex/${id}.webp`))
  .map((id) => ({ url: `media/ex/${id}.webp`, revision: '1' }))

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'robots.txt'],
      manifest: {
        id: base,
        name: 'FORJA — treino e dieta',
        short_name: 'FORJA',
        description: 'Treino, dieta e progresso. Offline, dados só no seu aparelho.',
        lang: 'pt-BR',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B0C0F',
        theme_color: '#0B0C0F',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}', 'data/*.json', 'media/thumb/*.webp'],
        globIgnores: ['media/ex/**'],
        additionalManifestEntries: extra,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/media/ex/'),
            handler: 'CacheFirst',
            options: { cacheName: 'forja-media', expiration: { maxEntries: 1200 } },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'raw.githubusercontent.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'forja-media-remota',
              expiration: { maxEntries: 800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
