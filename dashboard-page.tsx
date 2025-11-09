'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [plano, setPlano] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cardapio');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    objetivo: 'perda de peso',
    peso: '',
    altura: '',
    idade: '',
    sexo: 'masculino',
    restricoes: '',
    nivelAtividade: 'moderado',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setUsuario({
      nome: 'João Silva',
      email: 'joao@email.com',
      plano: 'Premium',
      pontos: 1250,
    });
  }, []);

  const gerarPlano = async () => {
    if (!formData.peso || !formData.altura || !formData.idade) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPlano(data.plano);
      setShowModal(false);
      setActiveTab('cardapio');
      alert('✅ Plano gerado com sucesso!');
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-green-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Olá, {usuario.nome}! 👋
              </h1>
              <p className="text-white/90 text-lg">Plano {usuario.plano}</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              {plano ? '🔄 Regenerar Plano' : '✨ Gerar Meu Plano'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Se não tem plano */}
        {!plano && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="text-8xl mb-6">🍽️</div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
              Comece Sua Transformação!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Clique em "Gerar Meu Plano" para criar seu cardápio personalizado
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white px-12 py-5 rounded-xl font-bold hover:shadow-2xl transition-all text-xl"
            >
              Gerar Plano Agora ✨
            </button>
          </div>
        )}

        {/* Se tem plano */}
        {plano && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['cardapio', 'macros', 'observacoes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white shadow-xl'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'cardapio' && '🍽️ Cardápio'}
                  {tab === 'macros' && '📊 Macros'}
                  {tab === 'observacoes' && '💡 Dicas'}
                </button>
              ))}
            </div>

            {/* Conteúdo das Tabs */}
            {activeTab === 'cardapio' && (
              <div className="grid md:grid-cols-2 gap-6">
                {plano.refeicoes && Object.entries(plano.refeicoes).map(([key, refeicao]: [string, any]) => (
                  <div key={key} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{refeicao.horario}</span>
                    </div>
                    <ul className="space-y-3">
                      {refeicao.alimentos?.map((alimento: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-start border-b pb-2 last:border-0">
                          <div>
                            <div className="font-medium text-gray-800">{alimento.nome}</div>
                            <div className="text-sm text-gray-600">{alimento.quantidade}</div>
                          </div>
                          <div className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                            {alimento.calorias} kcal
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'macros' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Seus Macronutrientes</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {plano.calorias}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Calorias/dia</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      {plano.macros?.proteina}g
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Proteína</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                    <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      {plano.macros?.carboidrato}g
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Carboidrato</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl">
                    <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      {plano.macros?.gordura}g
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">Gordura</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'observacoes' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Observações Importantes</h2>
                <ul className="space-y-4">
                  {plano.observacoes?.map((obs: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-xl">
                      <span className="text-3xl flex-shrink-0">💡</span>
                      <span className="text-gray-700 pt-1 text-lg">{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 m-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                Gerar Plano Personalizado
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Peso (kg)*</label>
                  <input
                    type="number"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Altura (cm)*</label>
                  <input
                    type="number"
                    value={formData.altura}
                    onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Idade*</label>
                  <input
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Sexo*</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Objetivo*</label>
                <select
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="perda de peso">Perda de Peso</option>
                  <option value="ganho de massa">Ganho de Massa</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Nível de Atividade*</label>
                <select
                  value={formData.nivelAtividade}
                  onChange={(e) => setFormData({ ...formData, nivelAtividade: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="sedentario">Sedentário</option>
                  <option value="leve">Leve (1-2x/semana)</option>
                  <option value="moderado">Moderado (3-5x/semana)</option>
                  <option value="intenso">Intenso (6-7x/semana)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Restrições Alimentares</label>
                <textarea
                  value={formData.restricoes}
                  onChange={(e) => setFormData({ ...formData, restricoes: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ex: Intolerância à lactose, vegetariano..."
                />
              </div>

              <button
                onClick={gerarPlano}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 text-lg"
              >
                {loading ? 'Gerando plano... ⏳' : 'Gerar Plano ✨'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
