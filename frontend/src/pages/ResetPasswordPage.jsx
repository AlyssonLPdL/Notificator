import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordValid, setPasswordValid] = useState(false);

  useEffect(() => {
    // Verificar força da senha
    let strength = 0;

    if (novaSenha.length >= 8) strength += 1;
    if (/[A-Z]/.test(novaSenha)) strength += 1;
    if (/[0-9]/.test(novaSenha)) strength += 1;
    if (/[^A-Za-z0-9]/.test(novaSenha)) strength += 1;

    setPasswordStrength(strength);

    // Verificar se a senha atende aos requisitos mínimos
    const isValid = strength >= 3 && novaSenha.length >= 8;
    setPasswordValid(isValid);

    // Se confirmSenha estiver preenchida, verificar se coincide
    if (confirmSenha && novaSenha !== confirmSenha) {
      setMessage({ text: "As senhas não coincidem", type: "error" });
    } else if (confirmSenha && novaSenha === confirmSenha) {
      setMessage({ text: "", type: "" });
    }
  }, [novaSenha, confirmSenha]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      setMessage({
        text: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números",
        type: "error"
      });
      return;
    }

    if (novaSenha !== confirmSenha) {
      setMessage({ text: "As senhas não coincidem", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const txt = await res.text();
      if (res.ok) {
        setMessage({
          text: "Senha redefinida com sucesso! Redirecionando para login...",
          type: "success"
        });
        console.log("Reset OK:", txt);

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setMessage({ text: "Erro: " + txt, type: "error" });
        console.error("Reset falhou:", txt);
      }
    } catch (err) {
      setMessage({ text: "Erro na requisição. Tente novamente.", type: "error" });
      console.error("Reset exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength === 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-orange-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "Muito fraca";
    if (passwordStrength === 1) return "Fraca";
    if (passwordStrength === 2) return "Média";
    if (passwordStrength === 3) return "Boa";
    return "Forte";
  };

  // Se não vier token, informe e não mostre o form
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
            <FiLock className="text-red-500 text-3xl mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Token Inválido</h2>
          <p className="text-gray-600 mb-6">
            O token de redefinição de senha está ausente ou expirou.
            Por favor, solicite um novo link de redefinição.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Solicitar Novo Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full inline-block">
            <FiLock className="text-indigo-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Redefinir Senha</h1>
          <p className="text-gray-600 mt-2">
            Digite uma nova senha segura para sua conta
          </p>
        </div>

        <form onSubmit={handleReset}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Digite sua nova senha"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {novaSenha && (
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Força da senha: {getPasswordStrengthLabel()}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {novaSenha.length}/20
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength * 25}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                  <div className="flex items-center">
                    <FiCheck className={`mr-2 ${novaSenha.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className={`mr-2 ${/[A-Z]/.test(novaSenha) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Letra maiúscula</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className={`mr-2 ${/[0-9]/.test(novaSenha) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Número</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className={`mr-2 ${/[^A-Za-z0-9]/.test(novaSenha) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span>Símbolo</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Confirme a senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirme sua nova senha"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passwordValid || novaSenha !== confirmSenha}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading || !passwordValid || novaSenha !== confirmSenha
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </div>
            ) : (
              "Redefinir Senha"
            )}
          </button>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded-lg text-center ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}