import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { db, exportarTudo, importarTudo } from '../lib/db'
import { hojeISO, dataCurta } from '../lib/datas'
import { useSessoes } from '../lib/consultas'
import { exPorId, useExercicios } from '../lib/exercicios'
import { e1rm } from '../lib/treino'
import { Titulo, Abas, Card, Botao, BotaoIcone, Aviso, Esqueleto, Secao, Chip } from '../components/ui'
import type { Foto } from '../lib/types'

type Aba = 'corpo' | 'cargas' | 'fotos' | 'dados'

export default function Progresso() {
  const [aba, setAba] = useState<Aba>('corpo')
  return (
    <div>
      <Titulo sub="Tudo guardado só neste aparelho">Progresso</Titulo>
      <Abas abas={[{ id: 'corpo', nome: 'Corpo' }, { id: 'cargas', nome: 'Cargas' }, { id: 'fotos', nome: 'Fotos' }, { id: 'dados', nome: 'Backup' }]} ativa={aba} onChange={setAba} />
      <div className="mt-4">
        {aba === 'corpo' && <Corpo />}
        {aba === 'cargas' && <Cargas />}
        {aba === 'fotos' && <Fotos />}
        {aba === 'dados' && <Dados />}
      </div>
    </div>
  )
}

function Grafico({ dados, chave, unidade, cor = '#FFC21A' }: { dados: Record<string, number | string>[]; chave: string; unidade: string; cor?: string }) {
  if (dados.length < 2) return <p className="rounded-2xl bg-s2 p-4 text-center text-sm text-tx2">Registre pelo menos 2 medidas para ver o gráfico.</p>
  return (
    <div className="h-56 w-full" role="img" aria-label={`Gráfico de ${chave}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#262A33" vertical={false} />
          <XAxis dataKey="rotulo" tick={{ fill: '#9AA0AB', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#9AA0AB', fontSize: 12 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => String(Math.round(v))} />
          <Tooltip
            contentStyle={{ background: '#1C1F26', border: '1px solid #2C313B', borderRadius: 12, color: '#F2F3F5' }}
            labelStyle={{ color: '#9AA0AB' }}
            formatter={(v) => [`${String(Math.round(Number(v) * 10) / 10).replace('.', ',')} ${unidade}`, '']}
            separator=""
          />
          <Line type="monotone" dataKey={chave} stroke={cor} strokeWidth={3} dot={{ r: 3, fill: cor }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Corpo() {
  const medidas = useLiveQuery(() => db.medidas.orderBy('data').toArray(), [])
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const salvar = async () => {
    const p = Number(peso.replace(',', '.')) || undefined
    const c = Number(cintura.replace(',', '.')) || undefined
    if (!p && !c) return
    const data = hojeISO()
    const ex = await db.medidas.where('data').equals(data).first()
    if (ex) await db.medidas.update(ex.id!, { ...(p ? { peso: p } : {}), ...(c ? { cintura: c } : {}) })
    else await db.medidas.add({ data, peso: p, cintura: c })
    setPeso(''); setCintura('')
  }
  if (!medidas) return <Esqueleto className="h-64" />
  const dp = medidas.filter((m) => m.peso).map((m) => ({ rotulo: dataCurta(m.data), peso: m.peso! }))
  const dc = medidas.filter((m) => m.cintura).map((m) => ({ rotulo: dataCurta(m.data), cintura: m.cintura! }))
  const ult = (k: 'peso' | 'cintura') => [...medidas].reverse().find((m) => m[k])?.[k]
  const pri = (k: 'peso' | 'cintura') => medidas.find((m) => m[k])?.[k]
  const delta = (k: 'peso' | 'cintura') => { const a = ult(k), b = pri(k); return a && b ? a - b : null }
  const fmt = (n: number | null | undefined) => (n == null ? '—' : String(Math.round(n * 10) / 10).replace('.', ','))

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">Registrar hoje</p>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <label className="flex items-center rounded-2xl bg-s2 pr-3"><input inputMode="decimal" placeholder="Peso" aria-label="Peso em kg" value={peso} onChange={(e) => setPeso(e.target.value)} className="tnum min-h-12 w-full bg-transparent px-3" /><span className="text-tx2">kg</span></label>
          <label className="flex items-center rounded-2xl bg-s2 pr-3"><input inputMode="decimal" placeholder="Cintura" aria-label="Cintura em cm" value={cintura} onChange={(e) => setCintura(e.target.value)} className="tnum min-h-12 w-full bg-transparent px-3" /><span className="text-tx2">cm</span></label>
          <Botao onClick={salvar}>Salvar</Botao>
        </div>
        <p className="mt-2 text-xs text-tx2">Dica: pese-se pela manhã, em jejum, depois do banheiro. Olhe a tendência, não o dia.</p>
      </Card>
      <Card>
        <div className="mb-2 flex items-baseline justify-between"><h3 className="font-display text-xl font-bold">Peso</h3><span className="tnum text-tx2">{fmt(ult('peso'))} kg {delta('peso') != null && <span className={delta('peso')! <= 0 ? 'text-ok' : 'text-tx2'}>({delta('peso')! > 0 ? '+' : ''}{fmt(delta('peso'))})</span>}</span></div>
        <Grafico dados={dp} chave="peso" unidade="kg" />
      </Card>
      <Card>
        <div className="mb-2 flex items-baseline justify-between"><h3 className="font-display text-xl font-bold">Cintura</h3><span className="tnum text-tx2">{fmt(ult('cintura'))} cm {delta('cintura') != null && <span className={delta('cintura')! <= 0 ? 'text-ok' : 'text-tx2'}>({delta('cintura')! > 0 ? '+' : ''}{fmt(delta('cintura'))})</span>}</span></div>
        <Grafico dados={dc} chave="cintura" unidade="cm" cor="#7CC4FF" />
      </Card>
    </div>
  )
}

function Cargas() {
  const sessoes = useSessoes()
  useExercicios()
  const [sel, setSel] = useState<string | null>(null)
  const porEx = useMemo(() => {
    const m = new Map<string, { data: number; max: number; e1: number }[]>()
    for (const s of [...(sessoes ?? [])].reverse()) {
      const grupo = new Map<string, { max: number; e1: number }>()
      for (const x of s.series) {
        if (!x.kg || !x.reps) continue
        const g = grupo.get(x.exId) ?? { max: 0, e1: 0 }
        grupo.set(x.exId, { max: Math.max(g.max, x.kg), e1: Math.max(g.e1, e1rm(x.kg, x.reps)) })
      }
      for (const [id, g] of grupo) m.set(id, [...(m.get(id) ?? []), { data: s.inicio, ...g }])
    }
    return m
  }, [sessoes])
  const ids = [...porEx.keys()]
  const atual = sel ?? ids[0] ?? null
  useEffect(() => { if (sel && !porEx.has(sel)) setSel(null) }, [sel, porEx])
  if (!sessoes) return <Esqueleto className="h-64" />
  if (!ids.length) return <p className="py-10 text-center text-tx2">Registre um treino com carga para ver a evolução por exercício.</p>
  const dados = (porEx.get(atual!) ?? []).map((d) => ({ rotulo: dataCurta(d.data), carga: d.max, e1rm: Math.round(d.e1 * 10) / 10 }))
  return (
    <div className="space-y-4">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {ids.map((id) => <Chip key={id} ativo={id === atual} onClick={() => setSel(id)}>{exPorId(id)?.nome ?? id}</Chip>)}
      </div>
      <Card>
        <h3 className="mb-1 font-display text-xl font-bold">Carga máxima</h3>
        <Grafico dados={dados} chave="carga" unidade="kg" />
      </Card>
      <Card>
        <h3 className="mb-1 font-display text-xl font-bold">1RM estimado</h3>
        <p className="mb-2 text-xs text-tx2">Fórmula de Epley: carga × (1 + reps/30)</p>
        <Grafico dados={dados} chave="e1rm" unidade="kg" cor="#3DDC84" />
      </Card>
      <Secao titulo="Treinos recentes">
        <ul className="space-y-2">
          {sessoes.slice(0, 10).map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-2xl bg-s1 p-3">
              <div><p className="font-semibold">{s.nome}</p><p className="tnum text-sm text-tx2">{dataCurta(s.inicio)} · {s.series.length} séries</p></div>
              <BotaoIcone icone="lixo" rotulo="Apagar treino" onClick={() => confirm('Apagar este treino do histórico?') && db.sessoes.delete(s.id)} />
            </li>
          ))}
        </ul>
      </Secao>
    </div>
  )
}

function Fotos() {
  const fotos = useLiveQuery(() => db.fotos.orderBy('data').reverse().toArray(), [])
  const input = useRef<HTMLInputElement>(null)
  const [ver, setVer] = useState<Foto | null>(null)
  const adicionar = async (f: File) => {
    const blob = await reduzir(f)
    await db.fotos.add({ data: hojeISO(), blob })
  }
  return (
    <div className="space-y-4">
      <Aviso>As fotos ficam <strong>só neste aparelho</strong> (não vão para nenhum servidor). Entram no backup JSON se você exportar.</Aviso>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) adicionar(f); e.target.value = '' }} />
      <Botao className="w-full" icone="camera" onClick={() => input.current?.click()}>Adicionar foto</Botao>
      {!fotos ? <Esqueleto className="h-40" /> : fotos.length === 0 ? <p className="text-center text-sm text-tx2">Tire fotos de frente, lado e costas a cada 2-4 semanas, mesma luz e horário.</p> : (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((f) => <MiniFoto key={f.id} f={f} onClick={() => setVer(f)} />)}
        </div>
      )}
      {ver && <VerFoto f={ver} onFechar={() => setVer(null)} />}
    </div>
  )
}

function useBlobUrl(b: Blob) {
  const [u, setU] = useState('')
  useEffect(() => { const x = URL.createObjectURL(b); setU(x); return () => URL.revokeObjectURL(x) }, [b])
  return u
}
function MiniFoto({ f, onClick }: { f: Foto; onClick: () => void }) {
  const u = useBlobUrl(f.blob)
  return (
    <button onClick={onClick} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-s2">
      {u && <img src={u} alt={`Foto de ${dataCurta(f.data)}`} className="h-full w-full object-cover" />}
      <span className="absolute bottom-1 left-1 rounded bg-bg/80 px-1.5 text-xs">{dataCurta(f.data)}</span>
    </button>
  )
}
function VerFoto({ f, onFechar }: { f: Foto; onFechar: () => void }) {
  const u = useBlobUrl(f.blob)
  return createPortal(
    <div className="fade fixed inset-0 z-50 flex flex-col bg-black/95 p-4" role="dialog" aria-modal="true" aria-label="Foto de progresso">
      <div className="flex justify-between"><span className="text-tx2">{dataCurta(f.data)}</span><BotaoIcone icone="x" rotulo="Fechar" onClick={onFechar} /></div>
      {u && <img src={u} alt="" className="min-h-0 flex-1 object-contain" />}
      <Botao variante="perigo" icone="lixo" className="mt-3" onClick={async () => { if (confirm('Apagar esta foto?')) { await db.fotos.delete(f.id!); onFechar() } }}>Apagar</Botao>
    </div>,
    document.body,
  )
}

/** Reduz a foto para ~1280 px em JPEG para economizar espaço */
async function reduzir(f: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(f)
    const esc = Math.min(1, 1280 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * esc)
    c.height = Math.round(bmp.height * esc)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    return await new Promise((res) => c.toBlob((b) => res(b ?? f), 'image/jpeg', 0.82))
  } catch {
    return f
  }
}

function Dados() {
  const input = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const exportar = async () => {
    const d = await exportarTudo()
    const blob = new Blob([JSON.stringify(d)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `forja-backup-${hojeISO()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    setMsg('Backup exportado. Guarde o arquivo no Drive, e-mail ou computador.')
  }
  const importar = async (f: File) => {
    if (!confirm('Importar vai SUBSTITUIR todos os dados atuais deste aparelho. Continuar?')) return
    try {
      await importarTudo(JSON.parse(await f.text()))
      setMsg('Backup importado com sucesso.')
    } catch (e) {
      setMsg('Não foi possível importar: ' + (e as Error).message)
    }
  }
  return (
    <div className="space-y-4">
      <Aviso>Seus dados vivem só no navegador deste aparelho. Exporte um backup de vez em quando — se o app for desinstalado ou os dados do navegador forem apagados, o backup é o que salva seu histórico.</Aviso>
      <Botao className="w-full" icone="baixar" onClick={exportar}>Exportar backup (JSON)</Botao>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} />
      <Botao variante="secundario" className="w-full" icone="subir" onClick={() => input.current?.click()}>Importar backup</Botao>
      {msg && <Aviso tipo="ok">{msg}</Aviso>}
    </div>
  )
}
