import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' 
import axios from 'axios'
import { API_URL } from '../constants/api'

function Registro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('') 

  const navigate = useNavigate() 

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('') 

    try {
      // Monta o objeto exatamente como a classe Usuario.java espera receber via @RequestBody
      const dadosUsuario = { nome, email, senha }

      // Faz a requisição POST para o endpoint que alteramos no seu Spring Controller
      const response = await axios.post(`${API_URL}/usuario/registro`, dadosUsuario)

      if (response.status === 201) {
        // Se o Spring respondeu CREATED, salvamos o usuário logado no navegador (opcional, mas muito útil)
        localStorage.setItem('usuarioLogado', JSON.stringify(response.data))
        
        // Redireciona o usuário instantaneamente para a Home usando o React Router
        navigate('/home')
      }
    } catch (error) {
      // Se o Spring devolver um erro (ex: Bad Request 400), capturamos a mensagem
      if (error.response && error.response.data) {
        setErro(error.response.data.message)
      } else {
        setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
      }
    }
  }

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center font-sans">
      
      <div className="w-full max-width-[380px] px-5 py-5 text-left">
        <h1 className="text-[#1a2e4c] text-[28px] font-bold text-center mb-7.5 tracking-[1px]">
          REGISTRO
        </h1>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="bg-[#ffebe9] text-[#cf222e] border border-[rgba(255,129,130,0.4)] p-3 rounded-md text-sm font-medium mb-5">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col mb-5">
            <label htmlFor="nome" className="block mb-2 color-[#555555] text-sm">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              placeholder="nome"
              required
              autoComplete="off"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md bg-[#f0f4f8] text-[15px] color-[#333333] outline-none transition-colors duration-200 focus:border-[#1F883D]"
            />
          </div>

          <div className="flex flex-col mb-5">
            <label htmlFor="email" className="block mb-2 color-[#555555] text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="@mail.com"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md bg-[#f0f4f8] text-[15px] color-[#333333] outline-none transition-colors duration-200 focus:border-[#1F883D]"
            />
          </div>

          <div className="flex flex-col mb-5">
            <label htmlFor="senha" className="block mb-2 color-[#555555] text-sm">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              placeholder="senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md bg-[#f0f4f8] text-[15px] color-[#333333] outline-none transition-colors duration-200 focus:border-[#1F883D]"
            />
          </div>

          {/* Botão de criar */}
          <button
            type="submit"
            className="w-full p-3 bg-[#1F883D] hover:bg-[#1F883D] text-white rounded-md text-base font-medium mt-2.5 transition-colors duration-200 cursor-pointer"
          >
            Criar Conta
          </button>
        </form>

        {/* Link auxiliar para voltar pro Login se já tiver conta */}
        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-[#00a2ed] hover:underline">
            Já tem conta? Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Registro