import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { API_URL } from '../constants/api'
import axios from 'axios' 

function DatasetRelatorio() {
  const { id } = useParams() 
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  const [dadosGrafico, setDadosGrafico] = useState([])
  const [dadosTabela, setDadosTabela] = useState([])
  
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    // Validação de Usuário Logado
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioSalvo))

    const buscarMetricasRelatorio = async () => {
      try {
        setCarregando(true)
        setErro(null)
        
        const response = await axios.get(`${API_URL}/dataset/${id}/relatorio`)
        
        // Seta as duas listas vindas do Map do backend
        setDadosGrafico(response.data.dadosGrafico || [])
        setDadosTabela(response.data.dadosTabela || [])
      } catch (err) {
        console.error("Erro ao carregar dados do relatório:", err)
        setErro("Não foi possível carregar as métricas do dataset. Tente novamente mais tarde.")
      } finally {
        setCarregando(false)
      }
    }

    buscarMetricasRelatorio()
  }, [id, navigate])

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
        <p className="text-sm font-medium text-gray-500 animate-pulse">Carregando dados analíticos do relatório...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
      {/* barra superior */}
      <header className="bg-[#1a2e4c] text-white px-6 py-3 flex justify-between items-center border-b border-[#d0d7de] shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <svg className="w-6 h-6 text-[#00a2ed]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* corpo do relatório */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <Link to={`/dataset/${id}`} className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            ‹ Voltar para o Dataset
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-[#1f2328]">Acessos do Dataset</h1>
          <p className="text-xs text-gray-500">Métricas consolidadas de visualizações e downloads no período de 08/06/2026 até Hoje.</p>
        </div>

        {erro && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {erro}
          </div>
        )}

        {/* gráfico de duas linhas */}
        <div className="bg-white border border-[#d0d7de] rounded-lg shadow-2xs p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Evolução Temporal</h3>
          </div>
          
          <div className="w-full h-80 pr-4 pt-2">
            {dadosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="dataEixo" 
                    stroke="#64748b" 
                    style={{ fontSize: '11px', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    style={{ fontSize: '11px' }} 
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '12px', borderRadius: '6px', borderColor: '#d0d7de' }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visualizacoes" 
                    name="Visualizações" 
                    stroke="#5a92af" 
                    strokeWidth={2.5} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downloads" 
                    name="Downloads" 
                    stroke="#0f4c5c" 
                    strokeWidth={2.5} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                Nenhum dado de acesso registrado para este gráfico desde 08/06/2026.
              </div>
            )}
          </div>
        </div>

        {/* tabela de acessos */}
        <div className="bg-white border border-[#d0d7de] rounded-lg shadow-2xs p-6 flex flex-col gap-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Usuários que acessaram neste período</h3>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-[#d0d7de]">
            {dadosTabela.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#d0d7de] text-gray-600 font-bold tracking-wider">
                    <th className="p-3 border-r border-[#d0d7de]">Nome</th>
                    <th className="p-3 border-r border-[#d0d7de]">Email</th>
                    <th className="p-3 border-r border-[#d0d7de]">Data de Acesso</th>
                    <th className="p-3 text-center">Baixou o arquivo?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {dadosTabela.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-800 border-r border-gray-100">
                        {row.nome}
                      </td>
                      <td className="p-3 text-gray-500 border-r border-gray-100">
                        {row.email}
                      </td>
                      <td className="p-3 text-gray-600 font-mono border-r border-gray-100">
                        {row.dataAcesso}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-xs font-semibold text-[11px] ${
                          row.baixouArquivo === 'Sim' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {row.baixouArquivo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400 italic">
                Nenhum usuário acessou este dataset no período selecionado.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

export default DatasetRelatorio