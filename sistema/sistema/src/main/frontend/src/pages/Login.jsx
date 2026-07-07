import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../constants/api'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    try {
      const response = await axios.post(`${API_URL}/usuario/login`, { email, senha })

      if (response.status === 200) {
        // salva os dados do usuário logado no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify(response.data))
        
        navigate('/home')
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErro(error.response.data.message)
      } else {
        setErro('Erro ao conectar com o servidor.')
      }
    }
  }

  return (
    <div className="w-full h-screen bg-white flex justify-center items-center font-sans">
      <div className="w-full max-w-95 px-5 py-5 text-left">
        <h1 className="text-[#1a2e4c] text-[28px] font-bold text-center mb-7.5 tracking-[1px]">
          LOGIN
        </h1>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="bg-[#ffebe9] text-[#cf222e] border border-[rgba(255,129,130,0.4)] p-3 rounded-md text-sm font-medium mb-5">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Email */}
          <div className="flex flex-col mb-5">
            <label htmlFor="email" className="block mb-2 text-[#555555] text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md bg-[#f0f4f8] text-[15px] text-[#333333] outline-none transition-colors duration-200 focus:border-[#1F883D]"
            />
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col mb-5">
            <label htmlFor="senha" className="block mb-2 text-[#555555] text-sm">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              placeholder="senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-3 border border-[#e2e8f0] rounded-md bg-[#f0f4f8] text-[15px] text-[#333333] outline-none transition-colors duration-200 focus:border-[#1F883D]"
            />
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full p-3 bg-[#1F883D] hover:bg-[#1F883D] text-white rounded-md text-base font-medium mt-2.5 transition-colors duration-200 cursor-pointer"
          >
            Entrar
          </button>
        </form>

        {/* Link para alternar para a tela de Registro se não tiver conta */}
        <div className="mt-5 text-center">
          <Link to="/registro" className="text-sm text-[#00a2ed] hover:underline">
            Não tem uma conta? Cadastre-se aqui
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login