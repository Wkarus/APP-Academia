import { useNavigate } from 'react-router-dom'
import { CHECKLIST_PRE_TREINO, DICAS_CALOR, SINAIS_PARAR, LEMBRETE_AGUA_MIN } from '../content/cuidado'
import { useAjustes, salvarAjustes } from '../lib/hooks'
import { BotaoIcone, Card, Interruptor, Secao, Aviso } from '../components/ui'

export default function Cuidado() {
  const nav = useNavigate()
  const aj = useAjustes()
  return (
    <div>
      <header className="flex items-center gap-3 pb-3 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav(-1)} />
        <h1 className="font-display text-3xl font-bold">Modo cuidado</h1>
      </header>
      <Card className="py-1">
        <Interruptor ligado={aj.modoCuidado} onChange={(v) => salvarAjustes({ modoCuidado: v })} rotulo="Modo cuidado ativo" descricao={`Checklist antes do treino e lembrete de água a cada ${LEMBRETE_AGUA_MIN} min`} />
      </Card>

      <Secao titulo="Sinais para parar">
        <ul className="space-y-2">
          {SINAIS_PARAR.map((s) => (
            <li key={s.titulo} className="rounded-2xl border border-warn/30 bg-warn/10 p-3">
              <p className="font-semibold text-warn">{s.titulo}</p>
              <p className="text-sm text-tx2">{s.detalhe}</p>
            </li>
          ))}
        </ul>
        <Aviso tipo="alerta" className="mt-3">Se algum sinal aparecer: pare, vá para um local fresco, beba água e avise alguém. Se não melhorar em poucos minutos, procure atendimento — SAMU 192.</Aviso>
      </Secao>

      <Secao titulo="Calor e fadiga">
        <ul className="space-y-2">
          {DICAS_CALOR.map((d) => <li key={d} className="rounded-2xl bg-s1 p-3 text-sm">{d}</li>)}
        </ul>
      </Secao>

      <Secao titulo="Checklist antes do treino">
        <ul className="list-disc space-y-1 pl-5 text-sm text-tx2">
          {CHECKLIST_PRE_TREINO.map((c) => <li key={c.id}>{c.texto}</li>)}
        </ul>
      </Secao>
      <p className="mt-6 text-sm text-tx2">Conteúdo informativo. Se você tem uma condição de saúde diagnosticada, siga as orientações do seu médico sobre exercício e calor.</p>
    </div>
  )
}
