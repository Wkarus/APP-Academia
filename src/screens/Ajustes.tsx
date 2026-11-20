import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAjustes, salvarAjustes, useOnline } from '../lib/hooks'
import { carregarExercicios, urlPublica } from '../lib/exercicios'
import { semanaDoPlano, segundaDaSemana, hojeISO } from '../lib/datas'
import { Card, Interruptor, BotaoIcone, Botao, Secao, Barra, Aviso } from '../components/ui'
import { Icone } from '../components/Icone'

export default function Ajustes() {
  const aj = useAjustes()
  const nav = useNavigate()
  const online = useOnline()
  const [uso, setUso] = useState<string | null>(null)
  const [baixando, setBaixando] = useState<{ feito: number; total: number } | null>(null)

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => setUso(`${((e.usage ?? 0) / 1e6).toFixed(1).replace('.', ',')} MB usados`))
  }, [baixando])

  const baixarTudo = async () => {
    const lista = await carregarExercicios()
    const urls = lista.filter((e) => e.media?.url && e.media.local).map((e) => urlPublica(e.media.url))
    setBaixando({ feito: 0, total: urls.length })
    let feito = 0
    const fila = [...urls]
    const trabalhador = async () => {
      while (fila.length) {
        const u = fila.shift()!
        try { await fetch(u) } catch { /* ignora */ }
        feito++
        if (feito % 10 === 0 || feito === urls.length) setBaixando({ feito, total: urls.length })
      }
    }
    await Promise.all(Array.from({ length: 6 }, trabalhador))
    setBaixando({ feito: urls.length, total: urls.length })
  }

  return (
    <div>
      <header className="flex items-center gap-3 pb-3 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav(-1)} />
        <h1 className="font-display text-3xl font-bold">Ajustes</h1>
      </header>

      <Card>
        <label className="block">
          <span className="mb-1 block text-sm text-tx2">Seu nome</span>
          <input value={aj.nome} onChange={(e) => salvarAjustes({ nome: e.target.value })} className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" />
        </label>
      </Card>

      <Secao titulo="Acessibilidade">
        <Card className="divide-y divide-line/60 py-1">
          <Interruptor ligado={aj.fonteGrande} onChange={(v) => salvarAjustes({ fonteGrande: v })} rotulo="Fonte grande" descricao="Aumenta todo o texto do app" />
          <Interruptor ligado={aj.menosMovimento} onChange={(v) => salvarAjustes({ menosMovimento: v })} rotulo="Menos movimento" descricao="Animações paradas (toque para tocar), sem confete" />
          <Interruptor ligado={aj.vibrar} onChange={(v) => salvarAjustes({ vibrar: v })} rotulo="Vibrar ao marcar série" descricao="No iPhone a vibração não é suportada pelo navegador" />
          <Interruptor ligado={aj.telaLigada} onChange={(v) => salvarAjustes({ telaLigada: v })} rotulo="Tela sempre ligada no treino" descricao="Usa a Wake Lock API quando disponível" />
        </Card>
      </Secao>

      <Secao titulo="Saúde">
        <Card className="py-1">
          <Interruptor ligado={aj.modoCuidado} onChange={(v) => salvarAjustes({ modoCuidado: v })} rotulo="Modo cuidado" descricao="Calor e fadiga: lembretes de água, checklist e sinais para parar" />
          <Link to="/cuidado" className="flex min-h-12 items-center justify-between border-t border-line/60 text-amber">Ver guia do modo cuidado <Icone nome="seta" size={18} /></Link>
        </Card>
      </Secao>

      <Secao titulo="Plano">
        <Card className="space-y-3">
          <p className="text-sm text-tx2">Você está na <strong className="text-tx">semana {semanaDoPlano(aj.inicioPlano)}</strong> (semanas 1-2: 2 séries; a partir da 3: 3 séries).</p>
          <label className="block">
            <span className="mb-1 block text-sm text-tx2">Início do plano (semana 1)</span>
            <input type="date" value={aj.inicioPlano} onChange={(e) => e.target.value && salvarAjustes({ inicioPlano: segundaDaSemana(e.target.value) })} className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" />
          </label>
          <Botao variante="secundario" className="w-full" onClick={() => salvarAjustes({ inicioPlano: segundaDaSemana(hojeISO()) })}>Recomeçar na semana 1</Botao>
          <label className="block">
            <span className="mb-1 block text-sm text-tx2">Horário do treino</span>
            <input type="time" value={aj.horarioTreino} onChange={(e) => salvarAjustes({ horarioTreino: e.target.value })} className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-tx2">Meta de água (ml)</span>
            <input inputMode="numeric" value={aj.metaAguaMl} onChange={(e) => salvarAjustes({ metaAguaMl: Number(e.target.value) || 0 })} className="tnum min-h-12 w-full rounded-2xl border border-line bg-s2 px-4" />
          </label>
        </Card>
      </Secao>

      <Secao titulo="Uso offline">
        <Card className="space-y-3">
          <p className="text-sm text-tx2">As animações do seu plano e dos programas já ficam salvas. Baixe as demais (~20 MB) para ver qualquer exercício sem internet.</p>
          {baixando && <Barra valor={baixando.feito} max={baixando.total} />}
          {baixando && <p className="tnum text-sm">{baixando.feito} / {baixando.total} animações</p>}
          <Botao className="w-full" icone="baixar" disabled={!online || (baixando != null && baixando.feito < baixando.total)} onClick={baixarTudo}>
            {baixando?.feito === baixando?.total && baixando ? 'Tudo salvo para offline' : 'Baixar todas as animações'}
          </Botao>
          {!online && <Aviso>Você está offline agora.</Aviso>}
          {uso && <p className="text-xs text-tx2">{uso} neste aparelho.</p>}
        </Card>
      </Secao>

      <Secao titulo="Sobre">
        <Card className="space-y-1 py-1">
          <Link to="/creditos" className="flex min-h-12 items-center justify-between">Créditos e licenças <Icone nome="seta" size={18} /></Link>
          <Link to="/progresso" className="flex min-h-12 items-center justify-between border-t border-line/60">Backup (exportar/importar) <Icone nome="seta" size={18} /></Link>
        </Card>
        <p className="mt-3 text-xs text-tx2">FORJA v{__APP_VERSION__} · dados salvos só neste aparelho (IndexedDB) · sem anúncios, sem conta, sem servidor.</p>
      </Secao>
    </div>
  )
}
