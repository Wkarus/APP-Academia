import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Esqueleto } from './components/ui'
import { garantirDadosIniciais } from './lib/db'
import { PLANO } from './content/plano'
import { useAjustes } from './lib/hooks'
import { carregarExercicios } from './lib/exercicios'
import { AtualizacaoPWA } from './components/AtualizacaoPWA'
import Hoje from './screens/Hoje'
import { LimiteErro } from './components/LimiteErro'

const Treinos = lazy(() => import('./screens/Treinos'))
const EditarRotina = lazy(() => import('./screens/EditarRotina'))
const ProgramaDetalhe = lazy(() => import('./screens/ProgramaDetalhe'))
const Exercicios = lazy(() => import('./screens/Exercicios'))
const ExercicioTela = lazy(() => import('./screens/ExercicioTela'))
const Dieta = lazy(() => import('./screens/Dieta'))
const Progresso = lazy(() => import('./screens/Progresso'))
const ModoTreino = lazy(() => import('./screens/ModoTreino'))
const Ajustes = lazy(() => import('./screens/Ajustes'))
const Creditos = lazy(() => import('./screens/Creditos'))
const Cuidado = lazy(() => import('./screens/Cuidado'))

function Carregando() {
  return (
    <div className="space-y-3 px-4 pt-6" aria-busy="true" aria-label="Carregando">
      <Esqueleto className="h-10 w-1/2" />
      <Esqueleto className="h-40" />
      <Esqueleto className="h-24" />
    </div>
  )
}

export default function App() {
  const [pronto, setPronto] = useState(false)
  const aj = useAjustes()

  useEffect(() => {
    garantirDadosIniciais(PLANO).then(() => setPronto(true))
    carregarExercicios()
    navigator.storage?.persist?.().catch(() => {})
    // Pré-carrega as telas em segundo plano para funcionarem offline desde a 1ª visita
    const t = setTimeout(() => {
      void Promise.all([
        import('./screens/Treinos'), import('./screens/EditarRotina'), import('./screens/ProgramaDetalhe'),
        import('./screens/Exercicios'), import('./screens/ExercicioTela'), import('./screens/Dieta'),
        import('./screens/Progresso'), import('./screens/ModoTreino'), import('./screens/Ajustes'),
        import('./screens/Creditos'), import('./screens/Cuidado'),
      ]).catch(() => {})
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('fonte-grande', aj.fonteGrande)
    document.documentElement.classList.toggle('sem-movimento', aj.menosMovimento)
  }, [aj.fonteGrande, aj.menosMovimento])

  if (!pronto) return <Carregando />

  return (
    <HashRouter>
      <LimiteErro>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route path="/treino" element={<ModoTreino />} />
          <Route element={<Layout />}>
            <Route index element={<Hoje />} />
            <Route path="treinos" element={<Treinos />} />
            <Route path="treinos/rotina/:id" element={<EditarRotina />} />
            <Route path="treinos/programa/:id" element={<ProgramaDetalhe />} />
            <Route path="exercicios" element={<Exercicios />} />
            <Route path="exercicios/:id" element={<ExercicioTela />} />
            <Route path="dieta" element={<Dieta />} />
            <Route path="progresso" element={<Progresso />} />
            <Route path="ajustes" element={<Ajustes />} />
            <Route path="creditos" element={<Creditos />} />
            <Route path="cuidado" element={<Cuidado />} />
            <Route path="*" element={<Hoje />} />
          </Route>
        </Routes>
      </Suspense>
      </LimiteErro>
      <AtualizacaoPWA />
    </HashRouter>
  )
}
