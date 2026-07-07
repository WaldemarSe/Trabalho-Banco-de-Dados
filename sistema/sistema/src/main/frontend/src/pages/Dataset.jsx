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

  const [colaboradores, setColaboradores] = useState([]) 
  const [emailConvite, setEmailConvite] = useState("") 
  const [mensagemConvite, setMensagemConvite] = useState({ texto: "", erro: false }) 
  const [mostrarInputConvite, setMostrarInputConvite] = useState(false)
  
  // 🔔 Estados para o botão de notificações sincronizado com a Home
  const [convites, setConvites] = useState([])
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false)

  const ehDonoOuColaborador = dataset && usuario && (
    Number(dataset.criador_id) === Number(usuario.id) || 
    Number(dataset.criador?.id) === Number(usuario.id) ||
    colaboradores.some(c => Number(c.id || c) === Number(usuario.id))
  );

  const podeConvidar = ehDonoOuColaborador;

  const [versoesAbertas, setVersoesAbertas] = useState({})

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      navigate('/login')
      return
    }
    const user = JSON.parse(usuarioSalvo)
    setUsuario(user)

    const carregarDados = async () => {
      try {
        setCarregando(true)
        // Busca os detalhes e os convites pendentes paralelamente
        const [response, resConvites] = await Promise.all([
          axios.get(`${API_URL}/dataset/detalhes/${id}`),
          axios.get(`${API_URL}/dataset/convites?contaId=${user.id}`)
        ])
        
        setDataset(response.data.dataset)
        setVersoes(response.data.versoes || [])
        setColaboradores(response.data.colaboradores || [])
        setConvites(resConvites.data || [])
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
      setTimeout(() => setMostrarInputConvite(false), 2000)
    } catch (err) {
      setMensagemConvite({ 
        texto: err.response?.data?.message || "Erro ao enviar convite.", 
        erro: true 
      })
    }
  }

  const handleResponderConvite = async (datasetId, aceitou) => {
    try {
      await axios.post(`${API_URL}/dataset/convites/responder?contaId=${usuario.id}&datasetId=${datasetId}&aceitou=${aceitou}`)
      setConvites(prev => prev.filter(c => c.dataset_id !== datasetId))
      window.location.reload() 
    } catch (err) {
      alert("Erro ao responder convite.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const toggleVersao = async (versaoId) => {
    const estaAbrindo = !versoesAbertas[versaoId];
    setVersoesAbertas(prev => ({ ...prev, [versaoId]: estaAbrindo }))

    if (estaAbrindo && usuario) {
      try {
        await axios.post(`${API_URL}/dataset/versao/${versaoId}/visualizar?contaId=${usuario.id}`)
      } catch (err) {
        console.error("Erro silencioso ao registrar visualização:", err)
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
        <Link to="/home" className="text-sm text-[#0969da] hover:underline">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* 1. BARRA SUPERIOR ATUALIZADA (Com Central de Notificações inclusa) */}
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
          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00a2ed] flex items-center justify-center text-white font-bold text-sm uppercase border border-white/20">
                {usuario.nome.charAt(0)}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{usuario.nome}</span>
            </div>
            
            {/* 🔔 NOTIFICAÇÕES */}
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

      <div className="flex-1 max-w-275 w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        <div>
          <Link to="/home" className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            ‹ Voltar
          </Link>
        </div>

        {/* 🎯 SEÇÃO CENTRALIZADA CORRETAMENTE */}
        <section className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-xs flex flex-col items-center text-center">
          <div className="w-full flex flex-col items-center border-b border-[#d0d7de] pb-5 mb-5">
            <div className="flex items-center gap-3 justify-center flex-wrap w-full relative">
              
              <h1 className="text-3xl font-bold text-[#1f2328] break-all">{dataset.nome}</h1>
              <span className="text-xs font-semibold text-gray-500 border border-[#d0d7de] px-2.5 py-0.5 rounded-full bg-[#f6f8fa]">
                {dataset.e_privado ? 'Privado' : 'Público'}
              </span>
              
              {podeConvidar && (
                <button
                  onClick={() => {
                    setMostrarInputConvite(!mostrarInputConvite);
                    setMensagemConvite({ texto: "", erro: false });
                  }}
                  className="text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded transition-colors cursor-pointer md:absolute md:right-0"
                >
                  {mostrarInputConvite ? "Cancelar" : "+ Convidar Membro"}
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-400 mt-2.5">
              Criado em: <span className="font-medium text-gray-600">
                {dataset.dt_criacao || dataset.dtCriacao ? new Date(dataset.dt_criacao || dataset.dtCriacao).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </p>
            
            {mostrarInputConvite && (
              <form onSubmit={handleEnviarConvite} className="mt-4 bg-slate-50 p-3 rounded-md border border-slate-200 w-full max-w-sm text-left">
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

          {/* 📄 Bloco da Descrição também centralizado e bem estruturado */}
          <div className="w-full max-w-2xl text-left">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 text-center">Descrição Geral</h4>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 leading-relaxed text-center">
              {dataset.descricao || dataset.descricao_geral || "Nenhuma descrição fornecida para este dataset."}
            </p>
          </div>
        </section>

        {/* Versões */}
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
                    <div className="p-4 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/40">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 border border-slate-300 font-mono text-xs font-bold px-2.5 py-1 rounded text-slate-700 shadow-3xs">
                          {versao.numVersao || versao.num_versao}
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">
                            Publicado em: {versao.dtCriacao || versao.dt_criacao ? new Date(versao.dtCriacao || versao.dt_criacao).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 🔒 BOTÃO DE NOVA VERSÃO PROTEGIDO POR PERMISSÃO */}
                        {ehDonoOuColaborador && (
                          <Link
                              to={`/dataset/${id}/versao/nova?baseId=${versao.id}&numBase=${versao.numVersao || versao.num_versao}`}
                              className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-md font-medium shadow-3xs transition-colors cursor-pointer"
                          >
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                              </svg>
                              Nova Versão
                          </Link>
                        )}
                        
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

                    {estaAberto && (
                      <div className="border-t border-gray-100 bg-slate-50/60 p-5 flex flex-col gap-5">
                        
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Modificações</h4>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                              {versao.descricaoModificacoes || versao.descricao_modificacoes || "Sem nota de modificação registrada."}
                            </p>
                          </div>
                          
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

                        {/* 📊 TABELA DE FEATURES ORGANIZADA (Nome, Tipo, Descrição) */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</h4>
                          {versao.features && versao.features.length > 0 ? (
                            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-3xs">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-100/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="p-3 w-1/4">Nome</th>
                                    <th className="p-3 w-1/5">Tipo</th>
                                    <th className="p-3 w-2/4">Descrição</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-sans">
                                  {versao.features.map((feature) => (
                                    <tr key={feature.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-3 font-mono font-semibold text-[#0969da] break-all">
                                        {feature.nome}
                                      </td>
                                      <td className="p-3">
                                        <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                                          {feature.tipo || "N/A"}
                                        </span>
                                      </td>
                                      <td className="p-3 text-gray-600 leading-normal">
                                        {feature.descricao || "Sem metadados informados para esta coluna."}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic bg-white p-4 rounded border border-gray-200 text-center">
                              Sem features registradas para esta versão.
                            </p>
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