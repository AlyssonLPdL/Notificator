import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiShield, FiLogOut } from 'react-icons/fi';

const ContaPage = () => {
  const [usuario, setUsuario] = useState(null);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setErro('Você não está logado.');
      setLoading(false);
      return;
    }

    // Buscar dados do usuário
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao carregar usuário');
        }

        const data = await response.json();

        // Verificar se os dados necessários estão presentes
        if (!data.email) {
          throw new Error('Dados do usuário incompletos');
        }

        // Adicionar dataCadastro simulada para o frontend
        setUsuario({
          email: data.email,
          roles: data.roles || [],
          dataCadastro: new Date().toLocaleDateString('pt-BR')
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        setErro(error.message || 'Erro ao buscar dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    // Adicionar pequeno delay para mostrar o loader (opcional)
    const timer = setTimeout(fetchUserData, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações da conta...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FiShield className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso necessário</h2>
          <p className="text-gray-600 mb-6">{erro}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Fazer login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white rounded-full p-2 mr-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center">
                    <FiUser className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Minha Conta</h1>
                  <p className="text-blue-100">{usuario.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Informações da conta */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-600" />
                    Informações da Conta
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FiMail className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{usuario.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FiShield className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Permissões</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {usuario.roles.map((role, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                role === 'ROLE_ADMIN'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel de ações */}
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>

                  <div className="space-y-3">
                    {usuario.roles.includes('ROLE_ADMIN') && (
                      <a
                        href="/admin/emails"
                        className="block bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition shadow-sm"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <FiShield className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Painel de Falhas</p>
                            <p className="text-sm text-gray-500">Gerencie notificações</p>
                          </div>
                        </div>
                      </a>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                          <FiLogOut className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sair da Conta</p>
                          <p className="text-sm text-gray-500">Encerrar sessão</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Status da conta */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Status da Conta</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Conta verificada</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Sim</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Membro desde</span>
                      <span className="text-gray-800 font-medium">{usuario.dataCadastro}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContaPage;