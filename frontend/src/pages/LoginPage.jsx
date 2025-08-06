import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [erroRecuperacao, setErroRecuperacao] = useState("");

  // Estados para controle do recovery
  const [isSending, setIsSending] = useState(false);
  const [retryTimer, setRetryTimer] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Timer para tentar novamente (5 segundos)
  useEffect(() => {
    if (retryTimer > 0) {
      const timer = setTimeout(() => setRetryTimer(retryTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retryTimer]);

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowRecovery(false);
      }
    };

    if (showRecovery) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRecovery]);

  const handleLogin = async () => {
    setErroEmail("");
        setErroSenha("");

        // Validação
          let valido = true;
          if (!email) {
            setErroEmail("Por favor, informe seu email");
            valido = false;
          } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErroEmail("Email inválido");
            valido = false;
          }

          if (!senha) {
            setErroSenha("Por favor, informe sua senha");
            valido = false;
          }

          if (!valido) return;

        if (!recoveryEmail) {
          setRecoveryMessage("Por favor, informe seu email");
          return;
        }

    if (!email || !senha) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    setIsLoggingIn(true);
      try {
        const res = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          navigate("/conta");
        } else {
          const errorText = await res.text();
          // Mostra erro genérico acima do formulário
          setErroSenha(errorText);
        }
      } catch (error) {
        setErroSenha("Erro na conexão. Tente novamente.");
      } finally {
        setIsLoggingIn(false);
      }
    };
  };

  const handleForgotPassword = async () => {
      setErroRecuperacao("");
        setRecoveryMessage("");

        if (!recoveryEmail) {
          setErroRecuperacao("Por favor, informe seu email");
          return;
        } else if (!/\S+@\S+\.\S+/.test(recoveryEmail)) {
          setErroRecuperacao("Email inválido");
          return;
        }

    setIsSending(true);
    setRecoveryMessage("");

    try {
        const res = await fetch("http://localhost:8080/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        });

        const msg = await res.text();
        setRecoveryMessage(msg);

        if (res.ok) {
          setCountdownTimer(60 * 15);
          setRetryTimer(5);
        }
      } catch (error) {
        setErroRecuperacao("Erro na conexão. Tente novamente.");
      } finally {
        setIsSending(false);
      }
    };

  const handleRetry = () => {
    if (retryTimer === 0) {
      handleForgotPassword();
    }
  };

  useEffect(() => {
      if (countdownTimer > 0) {
        const interval = setInterval(() => {
          setCountdownTimer(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
      }
    }, [countdownTimer]);

    // Formatar para MM:SS
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-blue-100 mt-1">Faça login para continuar</p>
        </div>

        {/* Formulário de login */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {erroEmail && (
                    <span className="text-sm text-red-600 block mb-1">{erroEmail}</span>
                  )}
              <input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                        setEmail(e.target.value);
                        setErroEmail("");
                      }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setShowRecovery(true)}
                >
                  Esqueceu a senha?
                </button>
              </div>
              {erroSenha && (
                    <span className="text-sm text-red-600 block mb-1">{erroSenha}</span>
                  )}
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => {
                        setSenha(e.target.value);
                        setErroSenha("");
                      }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 transition shadow-md hover:shadow-lg ${
                isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a href="/cadastro" className="text-blue-600 font-medium hover:text-blue-800 hover:underline">
              Cadastre-se
            </a>
          </div>
        </div>
      </div>

      {/* Modal de recuperação de senha */}
      {showRecovery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5">
              <h2 className="text-xl font-bold text-white text-center">Recuperar Senha</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Digite seu email abaixo para receber um link de redefinição de senha.
              </p>

              {erroRecuperacao && (
                  <span className="text-sm text-red-600 block mb-2">{erroRecuperacao}</span>
                )}

              {countdownTimer > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
                  <div className="text-sm font-medium text-blue-700">
                    O Link enviado expira em:
                  </div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">
                    {formatTime(countdownTimer)}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isSending || countdownTimer > 0}
                />
              </div>

              {isSending && (
                <div className="flex justify-center items-center py-3 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              )}

              <button
                onClick={handleForgotPassword}
                disabled={isSending || countdownTimer > 0}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  isSending || countdownTimer > 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md"
                }`}
              >
                Enviar link de recuperação
              </button>

              {recoveryMessage && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  recoveryMessage.includes("sucesso") || recoveryMessage.includes("enviado")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}>
                  {recoveryMessage}
                </div>
              )}

              {retryTimer > 0 && (
                <div className="mt-4">
                  <button
                    onClick={handleRetry}
                    disabled={true}
                    className="w-full bg-gray-200 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    Tentar novamente em ({retryTimer}s)
                  </button>
                </div>
              )}

              {retryTimer === 0 && recoveryMessage && !recoveryMessage.includes("sucesso") && !recoveryMessage.includes("enviado") && (
                <div className="mt-4">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowRecovery(false)}
                  className="text-blue-600 font-medium hover:text-blue-800"
                >
                  Voltar para login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}