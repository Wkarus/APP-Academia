import { useNavigate } from 'react-router-dom'
import { BotaoIcone, Card, Secao } from '../components/ui'

const FONTES = [
  {
    nome: 'free-exercise-db',
    autor: 'yuhonas e colaboradores (dados originais de exercises.json, Ollie Jennings)',
    url: 'https://github.com/yuhonas/free-exercise-db',
    licenca: 'Unlicense — domínio público',
    uso: 'Base dos ~870 exercícios: nomes em inglês, músculos, equipamento, nível, instruções e as fotos de início/fim do movimento. As animações em WebP do app foram geradas a partir dessas fotos.',
  },
  {
    nome: 'Traduções, erros comuns e respiração (PT-BR)',
    autor: 'FORJA',
    url: null,
    licenca: 'Texto próprio',
    uso: 'Tradução dos ~160 exercícios mais comuns, textos do plano, programas, guias de dieta e modo cuidado, escritos com palavras próprias.',
  },
  {
    nome: 'Inter',
    autor: 'Rasmus Andersson',
    url: 'https://github.com/rsms/inter',
    licenca: 'SIL Open Font License 1.1',
    uso: 'Fonte do corpo de texto (hospedada no app).',
  },
  {
    nome: 'Barlow Condensed',
    autor: 'Jeremy Tribby',
    url: 'https://github.com/jpt/barlow',
    licenca: 'SIL Open Font License 1.1',
    uso: 'Fonte dos títulos (hospedada no app).',
  },
  {
    nome: 'Tabela Brasileira de Composição de Alimentos (TACO)',
    autor: 'NEPA/UNICAMP',
    url: 'https://www.nepa.unicamp.br/taco/',
    licenca: 'Referência (valores aproximados)',
    uso: 'Base para as calorias e proteínas do banco de alimentos.',
  },
]

const AVALIADAS = [
  {
    nome: 'ExerciseDB V1 (exercisedb.dev / AscendAPI)',
    decisao: 'Não usada por enquanto. Os GIFs são de propriedade da AscendAPI, a API tem verificação anti-robô e os termos de uso mencionam restrição de armazenamento — e baixar/guardar os GIFs no app depende disso. Pode ser licenciada depois e plugada sem refazer nada (campo de mídia trocável).',
  },
  {
    nome: 'wger (wger.de)',
    decisao: 'Avaliada. Dados e mídia sob licenças Creative Commons por item (CC-BY-SA 3/4, CC-BY 4, CC0), com atribuição por autor. Cobertura de mídia menor (~400 imagens, ~80 vídeos pesados). Fica como opção futura via media-overrides.',
  },
]

export default function Creditos() {
  const nav = useNavigate()
  return (
    <div>
      <header className="flex items-center gap-3 pb-3 pt-2">
        <BotaoIcone icone="voltar" rotulo="Voltar" onClick={() => nav(-1)} />
        <h1 className="font-display text-3xl font-bold">Créditos e licenças</h1>
      </header>
      <div className="space-y-3">
        {FONTES.map((f) => (
          <Card key={f.nome}>
            <h2 className="font-display text-xl font-bold">{f.nome}</h2>
            <p className="text-sm text-tx2">{f.autor}</p>
            <p className="mt-1 text-sm"><span className="rounded bg-amber/15 px-1.5 py-0.5 font-semibold text-amber">{f.licenca}</span></p>
            <p className="mt-2 text-sm">{f.uso}</p>
            {f.url && <a href={f.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-10 items-center text-sm text-amber underline underline-offset-2">{f.url.replace('https://', '')}</a>}
          </Card>
        ))}
      </div>
      <Secao titulo="Fontes avaliadas">
        <div className="space-y-3">
          {AVALIADAS.map((a) => (
            <Card key={a.nome}><h3 className="font-semibold">{a.nome}</h3><p className="mt-1 text-sm text-tx2">{a.decisao}</p></Card>
          ))}
        </div>
      </Secao>
      <Secao titulo="Bibliotecas">
        <p className="text-sm text-tx2">React, Vite, Tailwind CSS, Zustand, Dexie, Recharts, canvas-confetti, React Router, vite-plugin-pwa / Workbox — todas sob licença MIT ou Apache-2.0.</p>
      </Secao>
      <Secao titulo="Programas e guias">
        <p className="text-sm text-tx2">Programas e guias de dieta foram descritos com palavras próprias; cada um cita sua fonte na própria tela.</p>
      </Secao>
    </div>
  )
}
