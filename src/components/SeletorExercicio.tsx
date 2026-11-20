import type { Exercicio, Musculo } from '../lib/types'
import { Folha } from './ui'
import { PainelFiltros, useFiltrosExercicios, useListaFiltrada, ListaIncremental, ItemExercicio, grupoDoMusculo, EsqueletoLista } from './ListaExercicios'
import { Icone } from './Icone'

export function SeletorExercicio({ titulo, lista, musculo, onEscolher, onFechar }: { titulo: string; lista: Exercicio[]; musculo?: Musculo; onEscolher: (id: string) => void; onFechar: () => void }) {
  const [f, setF] = useFiltrosExercicios({ grupo: grupoDoMusculo(musculo) })
  const itens = useListaFiltrada(lista.length ? lista : null, f)
  return (
    <Folha aberta onFechar={onFechar} titulo={titulo} alta>
      <PainelFiltros f={f} setF={setF} total={itens?.length ?? 0} />
      <div className="mt-3">
        {!itens ? <EsqueletoLista /> : (
          <ListaIncremental
            itens={itens}
            render={(e) => <ItemExercicio ex={e} onClick={() => onEscolher(e.id)} direita={<Icone nome="mais" className="shrink-0 text-amber" />} />}
          />
        )}
      </div>
    </Folha>
  )
}
