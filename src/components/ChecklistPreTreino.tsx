import { useState } from 'react'
import { CHECKLIST_PRE_TREINO, SINAIS_PARAR } from '../content/cuidado'
import { Botao, Folha, Aviso } from './ui'
import { Icone } from './Icone'

export function ChecklistPreTreino({ onOk, onCancelar }: { onOk: () => void; onCancelar: () => void }) {
  const [marcados, setMarcados] = useState<Set<string>>(new Set())
  const todos = marcados.size === CHECKLIST_PRE_TREINO.length
  const alternar = (id: string) =>
    setMarcados((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  return (
    <Folha aberta onFechar={onCancelar} titulo="Antes de começar">
      <div className="space-y-4">
        <ul className="space-y-2">
          {CHECKLIST_PRE_TREINO.map((c) => {
            const on = marcados.has(c.id)
            return (
              <li key={c.id}>
                <button onClick={() => alternar(c.id)} aria-pressed={on} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-s2 p-3 text-left">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 ${on ? 'border-ok bg-ok text-bg' : 'border-line'}`}>
                    {on && <Icone nome="check" size={18} strokeWidth={3} />}
                  </span>
                  <span className="text-sm">{c.texto}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {!todos && <Aviso>Se algum item não estiver ok, considere um treino mais leve (só 2 séries) ou cardio leve hoje.</Aviso>}
        <details className="rounded-2xl bg-warn/10 p-3">
          <summary className="min-h-10 cursor-pointer font-semibold text-warn">Sinais para parar na hora</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {SINAIS_PARAR.map((s) => <li key={s.titulo}>{s.titulo}</li>)}
          </ul>
        </details>
        <div className="flex gap-2">
          <Botao variante="secundario" className="flex-1" onClick={onCancelar}>Agora não</Botao>
          <Botao className="flex-1" onClick={onOk} icone="play">{todos ? 'Tudo certo, iniciar' : 'Iniciar mesmo assim'}</Botao>
        </div>
      </div>
    </Folha>
  )
}
