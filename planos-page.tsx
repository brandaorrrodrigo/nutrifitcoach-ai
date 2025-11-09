'use client';

export default function PlanosPage() {
  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId,
          email: 'teste@email.com',
          userId: 'test-user'
        }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao criar checkout');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar pagamento');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-green-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Escolha Seu Plano
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Comece sua transformação hoje! Todos os planos incluem período de teste grátis.
          </p>
        </div>
      </div>

      {/* Planos */}
      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* PLANO MENSAL */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 hover:scale-105 transition-all border-2 border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-cyan-500 to-green-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                POPULAR
              </div>
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Plano Mensal</h3>
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-green-600 bg-clip-text text-transparent mb-2">
                R$ 100
              </div>
              <p className="text-gray-500">por mês</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                '✓ 15 dias grátis para testar',
                '✓ Planos alimentares personalizados',
                '✓ Chat com IA 24/7',
                '✓ Receitas ilimitadas',
                '✓ Acompanhamento de métricas',
                '✓ Suporte via email'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">{item.split(' ')[0]}</span>
                  <span className="text-gray-700">{item.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('price_1SPB0ORDXdPv3IndFDjlqWa4')}
              className="w-full bg-gradient-to-r from-cyan-500 to-green-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Assinar Mensal
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Cancele quando quiser
            </p>
          </div>

          {/* PLANO ANUAL */}
          <div className="bg-gradient-to-br from-purple-600 to-cyan-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden hover:scale-105 transition-all">
            <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              ECONOMIZE R$ 200
            </div>

            <div className="relative z-10 text-center mb-8">
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
                MELHOR VALOR
              </div>
              <h3 className="text-3xl font-bold mb-2">Plano Anual</h3>
              <div className="text-5xl font-bold mb-2">
                R$ 1.000
              </div>
              <p className="text-white/80">por ano</p>
              <p className="text-sm text-white/70 mt-2">
                Apenas R$ 83,33/mês
              </p>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
              {[
                '✓ 30 dias grátis para testar',
                '✓ Tudo do plano mensal',
                '✓ Suporte prioritário',
                '✓ Consultorias exclusivas',
                '✓ Acesso antecipado a novidades',
                '✓ Economize R$ 200 por ano'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">{item.split(' ')[0]}</span>
                  <span className="text-white">{item.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('price_1SPB1MRDXdPv3IndaW0AKyWe')}
              className="w-full bg-white text-purple-600 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 relative z-10"
            >
              Assinar Anual
            </button>

            <p className="text-center text-sm text-white/80 mt-4 relative z-10">
              Melhor custo-benefício
            </p>

            {/* Decoração */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border-2 border-green-200">
          <div className="text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Garantia de Satisfação</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Teste sem risco! Se você não estiver 100% satisfeito durante o período de teste, 
              cancelamos sem cobrar nada. Seu sucesso é nossa prioridade.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto mb-20">
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim! Você pode cancelar a qualquer momento sem multa ou burocracia.'
              },
              {
                q: 'O período de teste é realmente grátis?',
                a: 'Sim! Você só será cobrado após o período de teste se decidir continuar.'
              },
              {
                q: 'Funciona para veganos/vegetarianos?',
                a: 'Com certeza! Nossa IA adapta o plano para qualquer restrição alimentar.'
              }
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow p-6 group">
                <summary className="font-bold text-gray-800 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-purple-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
