import { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'react-feather';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validação de força da senha
  const validarSenha = () => {
    const temMinuscula = /[a-z]/.test(senha);
    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    const temComprimento = senha.length >= 8;

    return {
      temMinuscula,
      temMaiuscula,
      temNumero,
      temEspecial,
      temComprimento,
      valida: temMinuscula && temMaiuscula && temNumero && temEspecial && temComprimento
    };
  };

  const forcaSenha = validarSenha();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setIsLoading(true);

    // Validações no frontend
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      setIsLoading(false);
      return;
    }

    if (!forcaSenha.valida) {
      setErro('A senha não atende aos requisitos de segurança!');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.text();
      if (!res.ok) {
        console.error('Erro no cadastro:', data);
        setErro(data);
      } else {
        console.log('Usuário cadastrado com sucesso!');
        setSucesso('Cadastro realizado com sucesso! Redirecionando...');
        // Simulação de redirecionamento
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setErro('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
          <p className="text-blue-100 mt-1">Preencha os dados abaixo</p>
        </div>

        {/* Formulário de registro */}
        <div className="p-6">
          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Indicador de força da senha */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    {forcaSenha.temComprimento ?
                      <Check className="text-green-500 mr-2" size={16} /> :
                      <X className="text-red-500 mr-2" size={16} />
                    }
                    <span className={`text-sm ${forcaSenha.temComprimento ? 'text-green-600' : 'text-gray-600'}`}>
                      Mínimo de 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center">
                    {forcaSenha.temMinuscula ?
                      <Check className="text-green-500 mr-2" size={16} /> :
                      <X className="text-red-500 mr-2" size={16} />
                    }
                    <span className={`text-sm ${forcaSenha.temMinuscula ? 'text-green-600' : 'text-gray-600'}`}>
                      Letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center">
                    {forcaSenha.temMaiuscula ?
                      <Check className="text-green-500 mr-2" size={16} /> :
                      <X className="text-red-500 mr-2" size={16} />
                    }
                    <span className={`text-sm ${forcaSenha.temMaiuscula ? 'text-green-600' : 'text-gray-600'}`}>
                      Letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center">
                    {forcaSenha.temNumero ?
                      <Check className="text-green-500 mr-2" size={16} /> :
                      <X className="text-red-500 mr-2" size={16} />
                    }
                    <span className={`text-sm ${forcaSenha.temNumero ? 'text-green-600' : 'text-gray-600'}`}>
                      Pelo menos um número
                    </span>
                  </div>
                  <div className="flex items-center">
                    {forcaSenha.temEspecial ?
                      <Check className="text-green-500 mr-2" size={16} /> :
                      <X className="text-red-500 mr-2" size={16} />
                    }
                    <span className={`text-sm ${forcaSenha.temEspecial ? 'text-green-600' : 'text-gray-600'}`}>
                      Caractere especial (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmarSenha"
                    type={mostrarConfirmarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Mensagens de erro/sucesso */}
              {erro && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                  <X className="mr-2" size={18} />
                  <span>{erro}</span>
                </div>
              )}

              {sucesso && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
                  <Check className="mr-2" size={18} />
                  <span>{sucesso}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </div>
                ) : (
                  "Criar conta"
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                Já tem uma conta?{' '}
                <a href="/" className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
                  Faça login
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}