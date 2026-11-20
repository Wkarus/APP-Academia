import type { Musculo } from '../lib/types'
import { MUSCULO_PT } from '../lib/exercicios'

type Forma = { m: Musculo | null; d: string }

/** Espelha um path horizontalmente em torno de x=100 (só comandos absolutos M/L/Q/C/Z) */
function espelhar(d: string) {
  return d.replace(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)} ${y}`)
}
function par(m: Musculo | null, d: string): Forma[] {
  return [{ m, d }, { m, d: espelhar(d) }]
}
const elipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} Q${cx - rx} ${cy - ry} ${cx} ${cy - ry} Q${cx + rx} ${cy - ry} ${cx + rx} ${cy} Q${cx + rx} ${cy + ry} ${cx} ${cy + ry} Q${cx - rx} ${cy + ry} ${cx - rx} ${cy} Z`

// Base (partes sem músculo mapeado)
const BASE: Forma[] = [
  { m: null, d: elipse(100, 30, 17, 21) },
  ...par(null, elipse(48, 196, 7, 9)), // mãos
  ...par(null, 'M76 368 L96 368 L96 382 L72 382 Z'), // pés
  ...par(null, elipse(85, 276, 10, 8)), // joelhos
]

const FRENTE: Forma[] = [
  { m: 'neck', d: 'M90 50 L110 50 L112 64 L88 64 Z' },
  ...par('traps', 'M88 64 L100 66 L100 72 L76 72 Z'),
  ...par('shoulders', 'M74 72 Q58 72 54 92 Q56 100 64 102 L76 90 Z'),
  ...par('chest', 'M100 74 L78 74 Q68 84 70 100 Q80 112 100 110 Z'),
  ...par('biceps', 'M56 104 Q52 118 52 136 Q58 142 64 136 Q68 120 66 104 Z'),
  ...par('forearms', 'M52 142 Q46 160 46 184 L54 186 Q62 164 64 142 Z'),
  { m: 'abdominals', d: 'M86 114 L114 114 Q116 150 112 176 L88 176 Q84 150 86 114 Z' },
  ...par('abdominals', 'M84 116 Q74 130 76 160 L84 172 Q82 140 86 116 Z'),
  ...par('abductors', 'M76 172 Q68 184 70 200 L78 196 Q78 184 84 176 Z'),
  ...par('quadriceps', 'M78 194 Q70 224 74 262 Q84 270 94 262 Q98 228 96 196 Q88 184 78 194 Z'),
  ...par('adductors', 'M96 192 Q100 206 99 236 L94 240 Q96 214 92 194 Z'),
  ...par('calves', 'M76 288 Q70 316 76 352 L90 352 Q96 318 92 288 Z'),
]

const COSTAS: Forma[] = [
  { m: 'neck', d: 'M90 50 L110 50 L110 60 L90 60 Z' },
  { m: 'traps', d: 'M100 58 L74 72 L88 80 L100 108 L112 80 L126 72 Z' },
  ...par('shoulders', 'M74 72 Q58 72 54 92 Q56 100 64 102 L80 84 Z'),
  ...par('middle back', 'M88 82 L98 108 L98 128 L84 120 Q80 100 88 82 Z'),
  ...par('lats', 'M80 88 Q68 100 74 130 Q84 152 98 156 L98 132 L82 122 Q78 104 80 88 Z'),
  { m: 'lower back', d: 'M88 152 L112 152 L114 176 L86 176 Z' },
  ...par('triceps', 'M56 104 Q52 118 52 136 Q58 142 64 136 Q68 120 66 104 Z'),
  ...par('forearms', 'M52 142 Q46 160 46 184 L54 186 Q62 164 64 142 Z'),
  ...par('abductors', 'M74 168 Q66 180 70 196 L78 190 Z'),
  ...par('glutes', 'M98 176 L80 172 Q70 186 74 204 Q86 214 99 206 Z'),
  ...par('hamstrings', 'M76 208 Q70 236 76 266 Q86 272 94 266 Q98 238 98 210 Q86 214 76 208 Z'),
  ...par('calves', 'M74 286 Q66 306 74 344 L92 344 Q98 310 94 286 Q84 280 74 286 Z'),
]

function Figura({ formas, rotulo, primarios, secundarios }: { formas: Forma[]; rotulo: string; primarios: Musculo[]; secundarios: Musculo[] }) {
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="40 6 120 380" className="h-64 w-auto" role="img" aria-label={rotulo}>
        <defs>
          <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {BASE.map((f, i) => <path key={'b' + i} d={f.d} fill="#2A2E37" />)}
        {formas.map((f, i) => {
          const pri = f.m && primarios.includes(f.m)
          const sec = f.m && !pri && secundarios.includes(f.m)
          return (
            <path
              key={i}
              d={f.d}
              fill={pri ? '#FFC21A' : sec ? 'rgba(255,194,26,0.38)' : '#2A2E37'}
              stroke="#0B0C0F"
              strokeWidth={1.2}
              filter={pri ? 'url(#brilho)' : undefined}
            >
              {f.m && <title>{MUSCULO_PT[f.m]}</title>}
            </path>
          )
        })}
      </svg>
      <figcaption className="mt-1 text-xs uppercase tracking-wider text-tx2">{rotulo}</figcaption>
    </figure>
  )
}

export function MapaMuscular({ primarios, secundarios }: { primarios: Musculo[]; secundarios: Musculo[] }) {
  return (
    <div>
      <div className="flex justify-center gap-6 rounded-[20px] bg-s2 py-4">
        <Figura formas={FRENTE} rotulo="Frente" primarios={primarios} secundarios={secundarios} />
        <Figura formas={COSTAS} rotulo="Costas" primarios={primarios} secundarios={secundarios} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {primarios.map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 font-semibold text-bg">{MUSCULO_PT[m]}</span>
        ))}
        {secundarios.map((m) => (
          <span key={m} className="inline-flex items-center gap-1.5 rounded-full border border-amber/50 bg-amber/10 px-3 py-1 text-tx">{MUSCULO_PT[m]}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-tx2">Âmbar: músculo principal · translúcido: secundários</p>
    </div>
  )
}
