import { useEffect, useState } from 'react';

const EmailLog = {
  id: number;
  destinatario: string;
  assunto: string;
  corpo: string;
  status: string;
  enviadoEm: string;
  erro?: string;
};

export default function AdminEmails() {
  const [falhas, setFalhas] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [falhaSelecionada, setFalhaSelecionada] = useState<EmailLog | null>(null);
  const [reenviando, setReenviando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(false);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  useEffect(() => {
    fetchFalhas();
  }, []);

  const fetchFalhas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/admin/emails/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao buscar falhas");

      const dados = await res.json();
      setFalhas(dados);
    } catch (err) {
      setMensagem("Erro ao buscar falhas.");
      setTimeout(() => setMensagem(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const testarFalha = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/admin/emails/testar-falha", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao testar falha");

      setMensagem("Falha gerada com sucesso!");
      setTimeout(() => setMensagem(''), 3000);
      fetchFalhas();
    } catch (err) {
      setMensagem("Erro ao gerar falha");
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  const reenviarEmail = async (id: number) => {
    try {
      setReenviando(true);
      const token = localStorage.getItem('token');

      // Envia o conteúdo editado para o backend
      const res = await fetch(`http://localhost:8080/admin/emails/reenvio/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assunto: falhaSelecionada?.assunto,
          corpo: falhaSelecionada?.corpo,
          destinatario: falhaSelecionada?.destinatario
        })
      });

      if (res.ok) {
        setMensagem('E-mail reenviado com sucesso!');
        fetchFalhas();
      } else {
        setMensagem('Erro ao reenviar e-mail.');
      }
    } catch (err) {
      setMensagem('Falha na comunicação com o servidor.');
    } finally {
      setReenviando(false);
      setTimeout(() => {
        setMensagem('');
        setModalAberto(false);
        setEditando(false);
      }, 2000);
    }
  };

  const abrirModal = (falha: EmailLog) => {
    setFalhaSelecionada(falha);
    setModalAberto(true);
    setEditando(false);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFalhaSelecionada(null);
    setEditando(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'falha': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'sucesso': return 'bg-green-100 text-green-800';
      case 'reenviado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return 'Sem data';

    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(data);
  };

  // Aplicar filtros
  const falhasFiltradas = falhas.filter(falha => {
    // Filtro por status
    if (filtroStatus !== 'todos' && falha.status.toLowerCase() !== filtroStatus) {
      return false;
    }

    // Filtro por busca
    if (filtroBusca &&
        !falha.destinatario.toLowerCase().includes(filtroBusca.toLowerCase()) &&
        !falha.assunto.toLowerCase().includes(filtroBusca.toLowerCase()) &&
        !falha.corpo.toLowerCase().includes(filtroBusca.toLowerCase())) {
      return false;
    }

    // Filtro por data
    if (filtroDataInicio) {
      const dataFalha = new Date(falha.enviadoEm);
      const dataInicio = new Date(filtroDataInicio);
      if (dataFalha < dataInicio) return false;
    }

    if (filtroDataFim) {
      const dataFalha = new Date(falha.enviadoEm);
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59); // Fim do dia
      if (dataFalha > dataFim) return false;
    }

    return true;
  });

  // Estatísticas para dashboard
  const totalEmails = falhas.length;
  const emailsFalha = falhas.filter(f => f.status.toLowerCase() === 'falha').length;
  const emailsEnviados = falhas.filter(f =>
    ['sucesso', 'reenviado'].includes(f.status.toLowerCase())
  ).length;
  const taxaSucesso = totalEmails > 0
    ? Math.round((emailsEnviados / totalEmails) * 100)
    : 0;

  const handleCampoEditavelChange = (
    campo: keyof EmailLog,
    valor: string
  ) => {
    if (!falhaSelecionada) return;

    setFalhaSelecionada({
      ...falhaSelecionada,
      [campo]: valor
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard de E-mails</h1>
        <button
          onClick={testarFalha}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Testar Falha
        </button>
      </div>

      {/* Dashboard de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total de E-mails</h3>
          <p className="text-2xl font-bold">{totalEmails}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Falhas</h3>
          <p className="text-2xl font-bold text-red-600">{emailsFalha}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Enviados</h3>
          <p className="text-2xl font-bold text-green-600">{emailsEnviados}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Taxa de Sucesso</h3>
          <p className="text-2xl font-bold">{taxaSucesso}%</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="todos">Todos</option>
              <option value="falha">Falha</option>
              <option value="pendente">Pendente</option>
              <option value="sucesso">Sucesso</option>
              <option value="reenviado">Reenviado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Destinatário, assunto..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {mensagem && (
        <div className={`mb-4 p-3 rounded-lg text-center ${
          mensagem.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {mensagem}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : falhasFiltradas.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma falha encontrada</h3>
          <p className="mt-1 text-gray-500">Todos os e-mails foram enviados com sucesso</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {falhasFiltradas.map((falha) => (
            <div
              key={falha.id}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => abrirModal(falha)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{falha.assunto}</h3>
                    <p className="text-sm text-gray-500 mt-1">{falha.destinatario}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(falha.status)}`}>
                    {falha.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatarData(falha.enviadoEm)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && falhaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900">
                  {editando ? (
                    <input
                      type="text"
                      value={falhaSelecionada.assunto}
                      onChange={(e) => handleCampoEditavelChange('assunto', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    falhaSelecionada.assunto
                  )}
                </h2>
                <button
                  onClick={fecharModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destinatário</label>
                  {editando ? (
                    <input
                      type="text"
                      value={falhaSelecionada.destinatario}
                      onChange={(e) => handleCampoEditavelChange('destinatario', e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{falhaSelecionada.destinatario}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(falhaSelecionada.status)}`}>
                    {falhaSelecionada.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Último envio</label>
                  <p className="mt-1 text-gray-900">
                    {formatarData(falhaSelecionada.enviadoEm)}
                  </p>
                </div>

                {falhaSelecionada.erro && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detalhes do erro</label>
                    <p className="mt-1 p-2 bg-red-50 text-red-700 rounded-md">
                      {falhaSelecionada.erro}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                  {editando ? (
                    <textarea
                      value={falhaSelecionada.corpo}
                      onChange={(e) => handleCampoEditavelChange('corpo', e.target.value)}
                      className="mt-1 w-full h-40 p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {falhaSelecionada.corpo}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={fecharModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>

                {!editando ? (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEditando(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => reenviarEmail(falhaSelecionada.id)}
                      disabled={reenviando}
                      className={`px-4 py-2 rounded-lg text-white flex items-center ${
                        reenviando
                          ? 'bg-indigo-400'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {reenviando ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                          Salvar e Reenviar
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}