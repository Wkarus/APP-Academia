import { useState } from 'react'
import { salvarAjustes } from '../lib/hooks'
import { Botao, Folha, Interruptor } from './ui'
import { Icone } from './Icone'

/** Primeira abertura: nome, sugestão do modo cuidado e aviso informativo. */
export function Boasvindas() {
  const [nome, setNome] = useState('')
  const [cuidado, setCuidado] = useState(true)
  const [aberta, setAberta] = useState(true)

  const concluir = () => {
    salvarAjustes({ nome: nome.trim(), modoCuidado: cuidado, onboarding: true })
    setAberta(false)
  }

  return (
    <Folha aberta={aberta} onFechar={concluir} titulo="Bem-vindo à FORJA">
      <div className="space-y-5">
        <p className="text-tx2">Seu plano de 4 dias, a dieta e o modo treino já estão carregados. Tudo fica salvo só neste aparelho e funciona offline.</p>
        <label className="block">
          <span className="mb-1 block text-sm text-tx2">Como quer ser chamado?</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="min-h-12 w-full rounded-2xl border border-line bg-s2 px-4 text-tx placeholder:text-tx2/70"
            autoComplete="given-name"
          />
        </label>
        <div className="rounded-2xl border border-info/30 bg-info/10 p-4">
          <div className="mb-1 flex items-center gap-2 font-semibold"><Icone nome="sol" className="text-info" /> Modo cuidado (sugerido)</div>
          <p className="text-sm text-tx2">Você comentou sensibilidade ao calor e fadiga. Este modo adiciona lembretes de água durante o treino, checklist antes de começar e os sinais para parar.</p>
          <Interruptor ligado={cuidado} onChange={setCuidado} rotulo="Ativar modo cuidado" />
        </div>
        <p className="text-xs text-tx2">O FORJA é informativo e não substitui médico, nutricionista ou educador físico.</p>
        <Botao grande className="w-full" onClick={concluir}>Começar</Botao>
      </div>
    </Folha>
  )
}
