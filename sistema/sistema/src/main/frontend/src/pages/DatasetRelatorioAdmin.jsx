import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function DatasetRelatorioAdmin() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const [totalDatasets, setTotalDatasets] = useState(0);
  const [datasetsMaisVistos, setDatasetsMaisVistos] = useState([]);
  const [datasetsMaisBaixados, setDatasetsMaisBaixados] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) { navigate('/login'); return; }

    const user = JSON.parse(usuarioSalvo)
    setUsuario(user)

    if (!user.e_admin && !user.admin && user.nome !== "Waldemar" && user.nome !== "Bruna") {
        alert("Acesso negado: Esta página é exclusiva para administradores.")
        navigate('/home')
        return
    }

    const carregarDadosGeraisAdmin = async () => {
        try {
        setCarregando(true)
        const response = await axios.get(`${API_URL}/dataset/admin/relatorio-geral`)
        
        setTotalDatasets(response.data.totalDatasets)
        setDatasetsMaisVistos(response.data.maisVistos || [])
        setDatasetsMaisBaixados(response.data.maisBaixados || [])
        } catch (err) {
        console.error("Erro ao buscar dados admin", err)
        setErro("Não foi possível carregar os dados do painel.")
        } finally {
        setCarregando(false)
        }
    }

    carregarDadosGeraisAdmin(); 
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center text-sm text-gray-500">
        Verificando credenciais de administrador...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* BARRA SUPERIOR (Padrão do sistema) */}
      <header className="bg-[#1a2e4c] text-white px-6 py-3 flex justify-between items-center border-b border-[#d0d7de] shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <svg className="w-6 h-6 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"></path>
            </svg>
            <span className="font-bold text-lg tracking-wide flex items-center gap-2">
              FeatureStore <span className="text-xs bg-[#ffc107] text-slate-900 px-2 py-0.5 rounded font-mono uppercase font-black">Admin</span>
            </span>
          </Link>
        </div>

        {usuario && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#ffc107] flex items-center justify-center text-slate-900 font-bold text-sm uppercase border border-white/20">
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

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        <div>
          <Link to="/home" className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            ‹ Voltar para Home
          </Link>
        </div>

        {/* card total de datasets */}
        <section className="bg-white p-6 rounded-lg border border-[#d0d7de] shadow-xs flex flex-col items-center text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total de Datasets Cadastrados</span>
          <h1 className="text-5xl font-black text-[#1a2e4c]">{totalDatasets}</h1>
        </section>

        {/* tabelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tabela dos 5 mais vistos */}
          <section className="bg-white p-5 rounded-lg border border-[#d0d7de] shadow-xs">
            <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span></span> Top 5 Datasets Mais Vistos
            </h2>
            
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                    <th className="p-3">Nome do Dataset</th>
                    <th className="p-3 text-right w-1/4">Visualizações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {datasetsMaisVistos.map((dataset) => (
                    <tr key={dataset.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-800 truncate max-w-xs">
                        {dataset.nome}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#0969da]">
                        {dataset.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tabela dos 5 mais baixados */}
          <section className="bg-white p-5 rounded-lg border border-[#d0d7de] shadow-xs">
            <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span></span> Top 5 Datasets Mais Baixados
            </h2>
            
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                    <th className="p-3">Nome do Dataset</th>
                    <th className="p-3 text-right w-1/4">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {datasetsMaisBaixados.map((dataset) => (
                    <tr key={dataset.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-800 truncate max-w-xs">
                        {dataset.nome}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">
                        {dataset.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

      </div>
    </div>
  )
}

export default DatasetRelatorioAdmin