import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function CriarDataset() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  
  // Estados do Formulário do Dataset
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fontes, setFontes] = useState('')
  const [ePrivado, setEPrivado] = useState(false)

  // Estados da Versão Inicial Padrão
  const [numVersao, setNumVersao] = useState('v1.0')
  const [descricaoModificacoes, setDescricaoModificacoes] = useState('Criação inicial do dataset')
  const [arquivo, setArquivo] = useState(null)

  // 🔥 NOVO: Estado para armazenar a lista dinâmica de features mapeadas
  const [features, setFeatures] = useState([])

  // Estados de controle da tela
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

  // 🔥 Funções de manipulação dinâmica da tabela de features
  const adicionarLinhaFeature = () => {
    setFeatures([...features, { nome: '', tipo: '', descricao: '' }])
  }

  const removerLinhaFeature = (indexParaRemover) => {
    setFeatures(features.filter((_, index) => index !== indexParaRemover))
  }

  const atualizarCampoFeature = (index, campo, valor) => {
    const novasFeatures = [...features]
    novasFeatures[index][campo] = valor
    setFeatures(novasFeatures)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (!arquivo) {
      setErro('Por favor, selecione um arquivo CSV para a versão inicial do dataset.')
      return
    }

    try {
      setCarregando(true)

      const formData = new FormData()
      formData.append('nome', nome)
      formData.append('descricao', descricao)
      formData.append('fontes', fontes)
      formData.append('ePrivado', ePrivado)
      formData.append('numVersao', numVersao)
      formData.append('descricaoModificacoes', descricaoModificacoes)
      formData.append('arquivo', arquivo) 
      formData.append('contaId', usuario.id)

      // 🔥 NOVO: Insere as listas paralelas de features no FormData para o Spring Boot capturar
      features.forEach((feat) => {
        // Envia apenas se o nome da feature estiver preenchido para evitar lixo no banco
        if (feat.nome.trim()) {
          formData.append('featureNome', feat.nome.trim())
          formData.append('featureTipo', feat.tipo.trim() || 'VARCHAR') // Default caso deixem em branco
          formData.append('featureDescricao', feat.descricao.trim())
        }
      })

      await axios.post(`${API_URL}/dataset/criar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      navigate('/home')

    } catch (err) {
      console.error('Erro ao criar dataset:', err)
      setErro(err.response?.data?.message || 'Erro ao salvar o dataset, versão e features no banco.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#1f2328] font-sans flex flex-col">
      
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

      <main className="flex-1 max-w-220 w-full mx-auto px-4 py-8 flex flex-col gap-4">
        <div>
          <Link to="/home" className="text-xs font-semibold text-[#0969da] hover:underline flex items-center gap-1">
            ‹ Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-[#1f2328]">Cadastrar Novo Dataset</h1>
          <p className="text-xs text-gray-500">Crie um repositório de dados e defina sua primeira versão de features.</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-md font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-[#d0d7de] rounded-lg shadow-2xs p-6 flex flex-col gap-6">
          
          {/* SEÇÃO 1: DADOS DO DATASET */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Nome do Dataset *</label>
              <input 
                type="text" 
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: historico_vendas"
                className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Descrição Geral</label>
              <textarea 
                rows="3"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do dataset..."
                className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30 resize-y"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700">Fontes</label>
              <input 
                type="text" 
                value={fontes}
                onChange={(e) => setFontes(e.target.value)}
                placeholder="Ex: Google Analytics"
                className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30"
              />
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-md border border-slate-200 mt-1">
              <input 
                type="checkbox" 
                id="ePrivado"
                checked={ePrivado}
                onChange={(e) => setEPrivado(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-slate-300 rounded text-[#00a2ed] focus:ring-[#00a2ed]"
              />
              <label htmlFor="ePrivado" className="flex flex-col cursor-pointer">
                <span className="text-sm font-semibold text-slate-800">Privado</span>
              </label>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DA VERSÃO */}
          <div className="flex flex-col gap-4 mt-2 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="text-sm font-semibold text-slate-700">Número da Versão *</label>
                <input 
                  type="text" 
                  required
                  value={numVersao}
                  onChange={(e) => setNumVersao(e.target.value)}
                  placeholder="v1.0"
                  className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Notas de Modificação *</label>
                <input 
                  type="text" 
                  required
                  value={descricaoModificacoes}
                  onChange={(e) => setDescricaoModificacoes(e.target.value)}
                  className="border border-[#d0d7de] rounded-md px-3 py-2 text-sm focus:border-[#00a2ed] focus:outline-hidden bg-slate-50/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-semibold text-slate-700">Upload do Arquivo das Features (.CSV) *</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-[#00a2ed] bg-slate-50/50 rounded-lg p-6 text-center transition-colors relative flex flex-col items-center justify-center gap-2">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-xs text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-semibold text-[#0969da] hover:underline focus-within:outline-hidden">
                    <span>Clique para selecionar o arquivo</span>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileChange}
                      className="sr-only" 
                    />
                  </label>
                </div>
                
                {arquivo && (
                  <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                    ✓ {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔥 SEÇÃO 3: MAPEAMENTO DE FEATURES EM TABELA DINÂMICA */}
          <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-5">
            <div className="flex justify-between items-center flex-wrap gap-2 px-1">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Dicionário de Features (Opcional)</h3>
                <p className="text-xs text-gray-400">Mapeie o nome, tipo e a utilidade de cada coluna contida no arquivo CSV.</p>
              </div>
              <button
                type="button" // 💡 Fundamental para NÃO submeter o formulário ao clicar
                onClick={adicionarLinhaFeature}
                className="text-xs font-bold bg-[#00a2ed] text-white hover:bg-[#0089ca] px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-3xs"
              >
                <span className="text-base font-normal">+</span> Adicionar Feature
              </button>
            </div>

            {features.length > 0 ? (
              <div className="w-full overflow-x-auto rounded-lg border border-[#d0d7de] bg-white shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-[#d0d7de] text-gray-500 font-bold uppercase tracking-wider">
                      <th className="p-3 w-1/4">Nome da Feature *</th>
                      <th className="p-3 w-1/5">Tipo</th>
                      <th className="p-3 w-2/4">Descrição</th>
                      <th className="p-2 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {features.map((feature, index) => (
                      <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            placeholder="Ex: idade_cliente"
                            value={feature.nome}
                            onChange={(e) => atualizarCampoFeature(index, 'nome', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-[#00a2ed] focus:outline-hidden bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Ex: INT, FLOAT, VARCHAR"
                            value={feature.tipo}
                            onChange={(e) => atualizarCampoFeature(index, 'tipo', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono text-xs focus:border-[#00a2ed] focus:outline-hidden bg-white uppercase"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Ex: Idade calculada a partir da data de nascimento"
                            value={feature.descricao}
                            onChange={(e) => atualizarCampoFeature(index, 'descricao', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:border-[#00a2ed] focus:outline-hidden bg-white"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removerLinhaFeature(index)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remover linha"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg bg-slate-50/50 text-xs text-gray-400 italic">
                Nenhuma feature cadastrada. Clique no botão acima caso deseje documentar as colunas dessa versão.
              </div>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            <Link 
              to="/home" 
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
              {carregando ? 'Salvando dados...' : 'Criar Dataset e Versão'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CriarDataset