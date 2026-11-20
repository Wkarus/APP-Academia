import { useNavigate, useParams } from 'react-router-dom'
import { useExercicio, useExercicios } from '../lib/exercicios'
import { ConteudoExercicio } from '../components/ComoFazer'
import { BotaoIcone, Esqueleto } from '../components/ui'

export default function ExercicioTela() {
  const { id } = useParams()
  const lista = useExercicios()
  const ex = useExercicio(id)
  const nav = useNavigate()
  return (
    <div>
      <header className="flex items-center gap-3 pb-3 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav(-1)} />
        <h1 className="font-display text-2xl font-bold leading-tight">{ex?.nome ?? (lista ? 'Exercício não encontrado' : '')}</h1>
      </header>
      {!lista ? <Esqueleto className="h-72" /> : ex ? <ConteudoExercicio ex={ex} /> : null}
    </div>
  )
}
