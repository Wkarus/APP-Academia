import { useNavigate } from 'react-router-dom'
import { useExercicios } from '../lib/exercicios'
import { Titulo } from '../components/ui'
import { PainelFiltros, useFiltrosExercicios, useListaFiltrada, ListaIncremental, ItemExercicio, EsqueletoLista } from '../components/ListaExercicios'

let filtrosSalvos: ReturnType<typeof useFiltrosExercicios>[0] | undefined

export default function Exercicios() {
  const lista = useExercicios()
  const nav = useNavigate()
  const [f, setF0] = useFiltrosExercicios(filtrosSalvos)
  const setF = (x: typeof f) => { filtrosSalvos = x; setF0(x) }
  const itens = useListaFiltrada(lista, f)
  return (
    <div>
      <Titulo sub="Animação, músculos e passo a passo de cada um">Exercícios</Titulo>
      <PainelFiltros f={f} setF={setF} total={itens?.length ?? 0} />
      <div className="mt-3">
        {!itens ? <EsqueletoLista /> : itens.length === 0 ? (
          <p className="py-10 text-center text-tx2">Nada encontrado. Tente desligar “Minha academia” ou limpar filtros.</p>
        ) : (
          <ListaIncremental itens={itens} render={(e) => <ItemExercicio ex={e} onClick={() => nav(`/exercicios/${e.id}`)} />} />
        )}
      </div>
    </div>
  )
}
