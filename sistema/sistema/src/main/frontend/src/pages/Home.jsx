import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function Home() {
  const [usuario, setUsuario] = useState(null)
  const [meusDatasets, setMeusDatasets] = useState([])
  const [datasetsPublicos, setDatasetsPublicos] = useState([])
  const [buscaMeusDatasets, setBuscaMeusDatasets] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Recupera o usuário logado do localStorage
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      // Se não tiver usuário logado, chuta ele de volta pro Login
      navigate('/login')
      return
    }
    const user = JSON.parse(usuarioSalvo)
    setUsuario(user)

    // 2. Buscar os dados do Backend (Substitua pelos seus endpoints reais depois)
    const carregarDados = async () => {
      try {
        const response = await axios.post(`${API_URL}/dataset/listar-datasets-visiveis`, user)

        const todosDatasets = response.data
        
        const meus = todosDatasets.filter(ds => ds.criador_id === user.id)
        const publicos = todosDatasets.filter(ds => ds.e_privado === false && ds.criador_id !== user.id)
        setMeusDatasets(meus)
        setDatasetsPublicos(publicos)
      } catch (error) {
        console.error("Erro ao carregar datasets", error)
      }
    }

    carregarDados()
  }, [navigate])

  // Desloga o usuário limpando o localStorage
  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  // Filtra a barra lateral conforme o usuário digita na busca
  const meusDatasetsFiltrados = meusDatasets.filter(ds => 
    ds.nome.toLowerCase().includes(buscaMeusDatasets.toLowerCase())
  )

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* ── BARRA SUPERIOR (NAVBAR ESTILO GITHUB) ── */}
      <header className="bg-[#1a2e4c] text-white px-6 py-3 flex justify-between items-center border-b border-[#d0d7de] shadow-sm">
        <div className="flex items-center gap-3">
          {/* Ícone de Banco de Dados representando a Feature Store */}
          <svg className="w-6 h-6 text-[#00a2ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-wide">FeatureStore</span>
        </div>

        {/* Seção do Usuário na Direita */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Ícone padrão de foto redondo */}
            <div className="w-8 h-8 rounded-full bg-[#00a2ed] flex items-center justify-center text-white font-bold text-sm uppercase border border-white/20">
              {usuario.nome.charAt(0)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{usuario.nome}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-xs text-slate-300 hover:text-white border border-slate-500 hover:border-white px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      {/* ── CORPO PRINCIPAL DO SITE (GRID GITHUB) ── */}
      <div className="flex-1 flex flex-col md:flex-row max-w-350 w-full mx-auto px-4 py-8 gap-8">
        
        {/* BARRA LATERAL ESQUERDA (MEUS DATASETS) */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-4 bg-white p-4 rounded-lg border border-[#d0d7de]">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm text-[#1f2328]">Seus Datasets</h2>
            {/* Botão verde clássico do GitHub */}
            <Link 
              to="/dataset/novo" 
              className="bg-[#1f883d] hover:bg-[#1a7132] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Novo
            </Link>
          </div>

          {/* Input de Filtro rápido */}
          <input
            type="text"
            placeholder="Filtrar seus datasets..."
            value={buscaMeusDatasets}
            onChange={(e) => setBuscaMeusDatasets(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm outline-none bg-[#f6f8fa] focus:bg-white focus:border-[#00a2ed] focus:ring-1 focus:ring-[#00a2ed] transition-all"
          />

          {/* Lista de Reposórios/Datasets */}
          <div className="flex flex-col gap-1 mt-2 max-h-100 overflow-y-auto">
            {meusDatasetsFiltrados.length > 0 ? (
              meusDatasetsFiltrados.map((ds) => (
                <Link 
                  key={ds.id} 
                  to={`/dataset/${ds.id}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-[#f6f8fa] group transition-colors"
                >
                  <span className="text-sm text-[#0969da] font-medium group-hover:underline truncate max-w-45">
                    {ds.nome}
                  </span>
                  <span className="text-[10px] text-gray-500 border border-[#d0d7de] px-1.5 py-0.2 rounded-full bg-gray-50">
                    {ds.e_privado ? 'Privado' : 'Público'}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum dataset encontrado.</p>
            )}
          </div>
        </aside>

        {/* FEED CENTRAL (DATASETS PÚBLICOS DE OUTROS) */}
        <main className="flex-1 min-w-0 bg-white p-6 rounded-lg border border-[#d0d7de]">
          <div className="border-b border-[#d0d7de] pb-3 mb-6">
            <h2 className="font-bold text-xl text-[#1f2328]">Explorar Datasets Públicos</h2>
            <p className="text-xs text-gray-500 mt-1">Veja o que a comunidade está publicando na Feature Store</p>
          </div>

          {/* Cards do Feed */}
          <div className="flex flex-col gap-4">
            {datasetsPublicos.map((ds) => (
              <div 
                key={ds.id} 
                className="p-5 border border-[#d0d7de] rounded-lg hover:border-[#00a2ed] hover:shadow-sm transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {/* Link para entrar na tela de detalhes do Dataset */}
                    <Link 
                      to={`/dataset/${ds.id}`}
                      className="text-lg text-[#0969da] font-semibold hover:underline block break-all"
                    >
                      {ds.nome}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Criado por <span className="font-medium text-gray-600">{ds.nome_criador}</span>
                    </p>
                  </div>
                  
                  <Link 
                    to={`/dataset/${ds.id}`}
                    className="text-xs text-gray-600 bg-[#f6f8fa] hover:bg-[#f3f4f6] border border-[#d0d7de] px-3 py-1.5 rounded-md font-medium shadow-2xs transition-colors"
                  >
                    Ver detalhes
                  </Link>
                </div>

                {/* Descrição do Dataset */}
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {ds.descricao || "Sem descrição fornecida."}
                </p>

                {/* Rodapé do Card */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>Disponível</span>
                  </div>
                  <span>Criado em: {ds.dt_criacao ? new Date(ds.dt_criacao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  )
}

export default Home