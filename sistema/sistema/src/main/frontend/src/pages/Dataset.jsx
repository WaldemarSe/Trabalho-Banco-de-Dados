import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function Dataset() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [usuario, setUsuario] = useState(null)
  const [dataset, setDataset] = useState(null)
  const [versoes, setVersoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [colaboradores, setColaboradores] = useState([]) // Armazena os IDs vindos do back
  const [emailConvite, setEmailConvite] = useState("") // Campo do input
  const [mensagemConvite, setMensagemConvite] = useState({ texto: "", erro: false }) // Alertas visual
  const [mostrarInputConvite, setMostrarInputConvite] = useState(false) // Controla a exibição do mini-formulário
  const podeConvidar = dataset && usuario && (dataset.criador?.id === usuario.id || colaboradores.includes(usuario.id));

  // Controla o colapso individual de cada versão pelo ID
  const [versoesAbertas, setVersoesAbertas] = useState({})

  useEffect(() => {
    // 1. Recupera o usuário logado idêntico à Home
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioSalvo))

    // 2. Carrega as informações estruturadas do Backend
    const carregarDados = async () => {
      try {
        setCarregando(true)
        const response = await axios.get(`${API_URL}/dataset/detalhes/${id}`)
        
        setDataset(response.data.dataset)
        setVersoes(response.data.versoes || [])
        setColaboradores(response.data.colaboradores || [])
      } catch (err) {
        console.error("Erro ao carregar detalhes", err)
        setErro(err.response?.data?.message || "Erro ao conectar com o servidor.")
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, navigate])

  const handleEnviarConvite = async (e) => {
    e.preventDefault()
    if (!emailConvite.trim()) return

    try {
      setMensagemConvite({ texto: "", erro: false })
      const res = await axios.post(`${API_URL}/dataset/${id}/convidar?remetenteId=${usuario.id}&emailDestinatario=${emailConvite}`)
      
      setMensagemConvite({ texto: res.data.message, erro: false })
      setEmailConvite("")
      setTimeout(() => setMostrarInputConvite(false), 2000) // Fecha a caixinha após sucesso
    } catch (err) {
      setMensagemConvite({ 
        texto: err.response?.data?.message || "Erro ao enviar convite.", 
        erro: true 
      })
    }
  }

  // Limpa o localStorage e desloga
  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  // Abre/Fecha a seção de features e histórico de modificações
  const toggleVersao = async (versaoId) => {
    const estaAbrindo = !versoesAbertas[versaoId];

    // Atualiza o estado visual imediatamente para não travar a tela do usuário
    setVersoesAbertas(prev => ({
      ...prev,
      [versaoId]: estaAbrindo
    }))

    // Se o usuário está abrindo o painel, enviamos o registro de visualização pro Java
    if (estaAbrindo && usuario) {
      try {
        await axios.post(`${API_URL}/dataset/versao/${versaoId}/visualizar?contaId=${usuario.id}`)
      } catch (err) {
        console.error("Erro silencioso ao registrar visualização:", err)
        // Não exibimos erro na tela para o usuário para não estragar a experiência dele
      }
    }
}

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center text-sm text-gray-500">
        Carregando informações do banco...
      </div>
    )
  }

  if (erro || !dataset) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{erro || "Dataset não encontrado."}</p>
        <Link to="/home" className="text-sm text-[#0969da] hover:underline">Voltar para a Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* barra superior */}
      <header className="bg-[#1a2e4c] text-white px-6 py-3 flex justify-between items-center border-b border-[#d0d7de] shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <svg className="w-6 h-6 text-[#00a2ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"></path>
            </svg>
            <span className="font-bold text-lg tracking-wide">FeatureStore</span>
          </Link>
        </div>

        {usuario && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
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
        )}
      </header>

      <div className="flex-1 max-w-275 w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        <div>
          <Link to="/home" className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            Voltar
          </Link>
        </div>

        <section className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-xs">
          <div className="flex justify-between items-start border-b border-[#d0d7de] pb-4 mb-4 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1f2328] break-all">{dataset.nome}</h1>
                <span className="text-xs font-semibold text-gray-500 border border-[#d0d7de] px-2.5 py-0.5 rounded-full bg-[#f6f8fa]">
                  {dataset.e_privado ? 'Privado' : 'Público'}
                </span>
                
                {podeConvidar && (
                  <button
                    onClick={() => {
                      setMostrarInputConvite(!mostrarInputConvite);
                      setMensagemConvite({ texto: "", erro: false });
                    }}
                    className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    {mostrarInputConvite ? "Cancelar" : "+ Convidar Membro"}
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                Criado em: <span className="font-medium text-gray-600">
                  {dataset.dtCriacao ? new Date(dataset.dtCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                </span>
              </p>
              
              {mostrarInputConvite && (
                <form onSubmit={handleEnviarConvite} className="mt-3 bg-slate-50 p-3 rounded-md border border-slate-200 max-w-sm">
                  <label className="block text-xs font-bold text-slate-500 mb-1">E-mail do Participante</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="exemplo@email.com"
                      value={emailConvite}
                      onChange={(e) => setEmailConvite(e.target.value)}
                      className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-[#00a2ed]"
                    />
                    <button type="submit" className="text-xs font-bold bg-[#00a2ed] text-white px-3 py-1.5 rounded hover:bg-[#0089ca] cursor-pointer">
                      Enviar
                    </button>
                  </div>
                  {mensagemConvite.texto && (
                    <p className={`text-[11px] font-medium mt-1.5 ${mensagemConvite.erro ? 'text-red-500' : 'text-emerald-600'}`}>
                      {mensagemConvite.texto}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </section>

        {/* versões */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-[#1f2328] flex items-center gap-2 px-1">
            Histórico de Versões 
            <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{versoes.length}</span>
          </h2>

          <div className="flex flex-col gap-3">
            {versoes.length > 0 ? (
              versoes.map((versao) => {
                const estaAberto = !!versoesAbertas[versao.id];

                return (
                  <div 
                    key={versao.id} 
                    className="bg-white border border-[#d0d7de] rounded-lg shadow-xs overflow-hidden transition-all"
                  >
                    {/* LINHA PRINCIPAL DA VERSÃO */}
                    <div className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/40">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 border border-slate-300 font-mono text-xs font-bold px-2.5 py-1 rounded text-slate-700 shadow-3xs">
                          {versao.numVersao}
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">
                            Publicado em: {versao.dtCriacao ? new Date(versao.dtCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                            to={`/dataset/${id}/versao/nova?baseId=${versao.id}&numBase=${versao.numVersao}`}
                            className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-md font-medium shadow-3xs transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Nova Versão
                        </Link>
                        
                        {/* Botão "..." Reticências */}
                        <button
                          onClick={() => toggleVersao(versao.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded border shadow-3xs transition-all cursor-pointer ${
                            estaAberto 
                              ? 'bg-[#00a2ed] text-white border-[#00a2ed]' 
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          •••
                        </button>
                      </div>
                    </div>

                    {/* DETALHES DA VERSÃO (Aparecem ao clicar em "...") */}
                    {estaAberto && (
                      <div className="border-t border-gray-100 bg-slate-50/60 p-5 flex flex-col gap-4">
                        
                        {/* Seção das notas de Modificação e do Botão de Download Oculto */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Modificações</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                              {versao.descricaoModificacoes || "Sem nota de modificação registrada."}
                            </p>
                          </div>
                          
                          {/* 📥 O BOTÃO DE DOWNLOAD FOI AJUSTADO E SECOLOCOU AQUI DENTRO */}
                          <div className="sm:mt-5">
                            <a
                              href={`${API_URL}/dataset/versao/${versao.id}/download?contaId=${usuario.id}`}
                              download
                              className="flex items-center justify-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-[#f6f8fa] border border-[#d0d7de] px-4 py-2.5 rounded-md font-medium shadow-2xs transition-colors cursor-pointer whitespace-nowrap w-full sm:w-auto"
                            >
                              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                              </svg>
                              Download CSV
                            </a>
                          </div>
                        </div>

                        {/* Lista de Features (Mantida igual ao seu código original) */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</h4>
                          {versao.features && versao.features.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {versao.features.map((feature) => (
                                <div 
                                  key={feature.id} 
                                  className="bg-white p-3 rounded border border-gray-200 flex flex-col gap-0.5 shadow-3xs hover:border-[#00a2ed] transition-colors"
                                >
                                  <span className="text-sm font-mono font-semibold text-[#0969da]">{feature.nome}</span>
                                  <span className="text-xs text-gray-500">
                                    {feature.descricao || "Sem metadados informados para esta coluna."}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">Sem features registradas.</p>
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-8 bg-white rounded-lg border border-[#d0d7de]">
                Versões não encontradas.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dataset