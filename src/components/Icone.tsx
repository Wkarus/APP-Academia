import type { SVGProps } from 'react'

const P: Record<string, string> = {
  hoje: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10M10 19.5v-5h4v5',
  halter: 'M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11',
  busca: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM16.5 16.5 21 21',
  prato: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z',
  grafico: 'M4 20h16M6 16l4-5 4 3 5-7',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  check: 'M5 12.5 10 17.5 19.5 7',
  x: 'M6 6l12 12M18 6 6 18',
  mais: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  voltar: 'M15 5l-7 7 7 7',
  seta: 'M9 5l7 7-7 7',
  info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM12 11v5.5M12 7.6v.1',
  gota: 'M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z',
  fogo: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 .8 1.5 1.5 2 2.5 2C11.5 8 11 5.5 12 3Z',
  ajustes: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM19 12l2-1-1-3-2.2.2-1.5-1.6.2-2.2-3-1-1 2h-2l-1-2-3 1 .2 2.2-1.6 1.5L5 8 4 11l2 1v0l-2 1 1 3 2.2-.2 1.5 1.6-.2 2.2 3 1 1-2h2l1 2 3-1-.2-2.2 1.6-1.5 2.2.2 1-3-2-1Z',
  trofeu: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20h7M10 17h4',
  lixo: 'M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13',
  lapis: 'M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20ZM13.5 7l3.5 3.5',
  relogio: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17ZM12 7.5V12l3 2',
  livro: 'M5 4.5h9.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5ZM5 17a3 3 0 0 1 3-3h9.5',
  alerta: 'M12 3.5 21.5 20h-19L12 3.5ZM12 10v4.5M12 17.3v.1',
  coracao: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z',
  camera: 'M4 8h3l1.5-2.5h7L17 8h3v11H4V8ZM12 10.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z',
  baixar: 'M12 4v11M7 10.5l5 5 5-5M5 20h14',
  subir: 'M12 20V9M7 13.5l5-5 5 5M5 4h14',
  expandir: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  filtro: 'M4 6h16M7 12h10M10 18h4',
  estrela: 'M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8Z',
  sol: 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9ZM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  copiar: 'M8 8h11v12H8V8ZM5 16V4h11',
  musculo: 'M5 15c2-6 6-9 9-9 1.5 0 2 1 1.5 2l-2 2.5c2-.5 4.5 0 5.5 2s0 5-4 6-8 0-10-3.5Z',
  pular: 'M5 5.5v13l8-6.5-8-6.5ZM18 5v14',
  lua: 'M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z',
}

export type NomeIcone = keyof typeof P

export function Icone({ nome, size = 24, strokeWidth = 2, ...rest }: { nome: NomeIcone; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={P[nome]} />
    </svg>
  )
}
