import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function CriarVersao() {
  const { id } = useParams() // Captura o ID do dataset pai
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [usuario, setUsuario] = useState(null)
  
  // Captura os dados da versão pai da URL (?baseId=X&numBase=v1.0)
  const baseId = searchParams.get('baseId')
  const numBase = searchParams.get('numBase')

  // Estados do Formulário da Versão
  const [numVersao, setNumVersao] = useState('')
  const [descricaoModificacoes, setDescricaoModificacoes] = useState('')
  const [arquivo, setArquivo] = useState(null)

  // Estados de controle
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado')
    if (!usuarioSalvo) {
      navigate('/login')
      return
    }
    setUsuario(JSON.parse(usuarioSalvo))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setArquivo(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (!arquivo) {
      setErro('Por favor, faça o upload do novo arquivo CSV correspondente a esta versão.')
      return
    }

    try {
      setCarregando(true)

      // Monta os dados em formato Multipart para suportar o arquivo CSV binário
      const formData = new FormData()
      formData.append('datasetId', id)
      formData.append('contaId', usuario.id)
      formData.append('numVersao', numVersao)
      formData.append('descricaoModificacoes', descricaoModificacoes)
      formData.append('arquivo', arquivo)
      
      if (baseId) {
        formData.append('versaoBaseId', baseId)
      }

      // Altere o endpoint abaixo para bater com a sua nova rota de criação de versão no Spring
      await axios.post(`${API_URL}/dataset/versao/nova`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      })

      // Sucesso! Retorna para os detalhes do dataset de origem
      navigate(`/dataset/${id}`)

    } catch (err) {
      console.error('Erro ao criar nova versão:', err)
      setErro(err.response?.data?.message || 'Erro ao registrar nova versão no banco de dados.')
    } finally {
      setCarregando(false)
    }
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

      {/* ── CORPO DO FORMULÁRIO ── */}
      <main className="flex-1 max-w-200 w-full mx-auto px-4 py-8 flex flex-col gap-4">
        <div>
          <Link to={`/dataset/detalhes/${id}`} className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-[#1f2328]">Nova Versão do Dataset</h1>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-md font-medium">
             {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#d0d7de] rounded-lg shadow-2xs p-6 flex flex-col gap-5">
          
          {numBase && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-700">Linhagem de Origem:</span>
              <span className="bg-slate-200 border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                {numBase}
              </span>
            </div>
          )}

          {/* CAMPOS TEXTUAIS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">Nova Versão *</label>
              <input 
                type="text" 
                required
                value={numVersao}
                onChange={(e) => setNumVersao(e.target.value)}
                placeholder="Ex: v1.1-beta"
                className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Mudanças *</label>
              <input 
                type="text" 
                required
                value={descricaoModificacoes}
                onChange={(e) => setDescricaoModificacoes(e.target.value)}
                placeholder="Ex: Adicionadas novas colunas de comportamento do cliente."
                className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30"
              />
            </div>
          </div>

          {/* UPLOAD DO NOVO CSV */}
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-sm font-semibold text-slate-700">Upload do Arquivo (.CSV) *</label>
            <div className="border-2 border-dashed border-slate-300 hover:border-[#00a2ed] bg-slate-50/50 rounded-lg p-6 text-center transition-colors relative flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-xs text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-semibold text-[#0969da] hover:underline focus-within:outline-hidden">
                  <span>Selecione o novo arquivo</span>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="sr-only" 
                  />
                </label>
              </div>
              
              {arquivo && (
                <div className="mt-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                  ✓ {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {/* BOTÕES DE SUBMIT */}
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            <Link 
              to={`/dataset/detalhes/${id}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#d0d7de] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={carregando}
              className={`px-5 py-2 text-sm font-medium text-white bg-[#00a2ed] hover:bg-[#0089ca] border border-[#0089ca] rounded-md shadow-2xs transition-colors flex items-center gap-2 cursor-pointer ${
                carregando ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {carregando ? 'Gravando versão...' : 'Salvar Nova Versão'}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}

export default CriarVersao