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
  const [convites, setConvites] = useState([])
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false)

  // Estado para controlar se o usuário é administrador
  const [ehAdmin, setEhAdmin] = useState(false)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      
      navigate('/login')
      return
    }
    const user = JSON.parse(usuarioSalvo)
    setUsuario(user)

    const adminCheck = !!(user.e_admin || user.admin || user.nome === "Waldemar" || user.nome === "Bruna");
    setEhAdmin(adminCheck)

    const carregarDados = async () => {
      try {
        // Dispara as requisições
        const [resBarraLateral, resFeed, resConvites] = await Promise.all([
          axios.get(`${API_URL}/dataset/barra-lateral?usuarioId=${user.id}`),
          axios.get(`${API_URL}/dataset/feed?usuarioId=${user.id}`),
          axios.get(`${API_URL}/dataset/convites?contaId=${user.id}`)
        ])

        setMeusDatasets(resBarraLateral.data || [])
        setDatasetsPublicos(resFeed.data || [])
        setConvites(resConvites.data || [])

      } catch (error) {
        console.error("Erro ao carregar dados do ecossistema de datasets", error)
      }
    }

    carregarDados()
  }, [navigate])

  // Desloga o usuário limpando o localStorage
  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const carregarConvites = async (usuarioId) => {
    try {
      const res = await axios.get(`${API_URL}/dataset/convites?contaId=${usuarioId}`)
      setConvites(res.data || [])
    } catch (err) {
      console.error("Erro ao buscar convites", err)
    }
  }

  const handleResponderConvite = async (datasetId, aceitou) => {
    try {
      await axios.post(`${API_URL}/dataset/convites/responder?contaId=${usuario.id}&datasetId=${datasetId}&aceitou=${aceitou}`)
      
      // Atualiza a lista de convites tirando o respondido
      setConvites(prev => prev.filter(c => c.dataset_id !== datasetId))
      
      // regarrega os datasets da tela
      window.location.reload() 
    } catch (err) {
      alert("Erro ao responder convite.")
    }
  }

  // Filtra a barra lateral conforme o usuário digita na busca
  const meusDatasetsFiltrados = meusDatasets.filter(ds => 
    ds.nome.toLowerCase().includes(buscaMeusDatasets.toLowerCase())
  )

  if (!usuario) return null

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* barra superior */}
      <header className="bg-[#1a2e4c] text-white px-6 py-3 flex justify-between items-center border-b border-[#d0d7de] shadow-sm">
        <div className="flex items-center gap-3">
          {/* Ícone de Banco de Dados */}
          <svg className="w-6 h-6 text-[#00a2ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"></path>
          </svg>
          <span className="font-bold text-lg tracking-wide mr-2">FeatureStore</span>

          {/* Visível apenas se o usuário for Administrador */}
          {ehAdmin && (
            <Link
              to="/admin/relatorio"
              className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900 bg-[#ffc107] hover:bg-[#e0a800] px-2.5 py-1 rounded shadow-3xs transition-all cursor-pointer transform hover:scale-102 uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/>
              </svg>
              Painel Admin
            </Link>
          )}
        </div>

        {usuario && (
          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00a2ed] flex items-center justify-center text-white font-bold text-sm uppercase border border-white/20">
                {usuario.nome.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{usuario.nome}</span>
            </div>
            
            {/* notificações */}
            <div className="relative">
              <button 
                onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
                className="text-xs font-semibold bg-slate-700/50 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer relative"
              >
                <span>🔔</span>
                <span className="hidden md:inline">Notificações</span>
                {convites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {convites.length}
                  </span>
                )}
              </button>

              {/* caixa de notificações */}
              {mostrarNotificacoes && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md border border-gray-200 shadow-lg z-50 text-[#1f2328]">
                  <div className="p-2.5 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider">
                    Convites Pendentes ({convites.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {convites.length > 0 ? (
                      convites.map((convite) => (
                        <div key={convite.dataset_id} className="p-3 border-b border-gray-50 flex flex-col gap-2 hover:bg-slate-50/50">
                          <p className="text-xs text-gray-600 leading-normal">
                            <strong className="text-slate-800">{convite.remetente_nome}</strong> te convidou para colaborar no dataset <strong className="text-[#0969da]">{convite.dataset_nome}</strong>.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleResponderConvite(convite.dataset_id, false)}
                              className="text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded cursor-pointer transition-colors"
                            >
                              Recusar
                            </button>
                            <button 
                              onClick={() => handleResponderConvite(convite.dataset_id, true)}
                              className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded cursor-pointer transition-colors"
                            >
                              Aceitar
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-gray-400 text-center italic">
                        Nenhuma notificação por aqui.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleLogout}
              className="text-xs text-slate-300 hover:text-white border border-slate-500 hover:border-white px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* corpo principal */}
      <div className="flex-1 flex flex-col md:flex-row max-w-350 w-full mx-auto px-4 py-8 gap-8">
        
        {/* barra lateral (meus datasets) */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-4 bg-white p-4 rounded-lg border border-[#d0d7de]">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-sm text-[#1f2328]">Seus Datasets</h2>
            
            <Link 
              to="/dataset/novo" 
              className="bg-[#1f883d] hover:bg-[#1a7132] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Novo
            </Link>
          </div>

          {/* Input de filtro */}
          <input
            type="text"
            placeholder="Buscar datasets..."
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

        {/* feed (datasets públicos) */}
        <main className="flex-1 min-w-0 bg-white p-6 rounded-lg border border-[#d0d7de]">
          <div className="border-b border-[#d0d7de] pb-3 mb-6">
            <h2 className="font-bold text-xl text-[#1f2328]">Explorar Datasets Públicos</h2>
            <p className="text-xs text-gray-500 mt-1">Datasets publicados pela comunidade</p>
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