'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-green-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Transforme Seu Corpo e Sua Saúde
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Nutrição inteligente com IA para resultados reais. Planos personalizados, acompanhamento profissional e suporte 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/registro"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Comece Grátis Agora
              </Link>
              <Link
                href="/planos"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/50"
              >
                Ver Planos
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
          Por Que Escolher o NutriFitCoach?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🤖',
              title: 'IA Avançada',
              desc: 'Planos alimentares personalizados gerados por inteligência artificial treinada com milhares de protocolos nutricionais'
            },
            {
              icon: '📊',
              title: 'Resultados Reais',
              desc: 'Acompanhamento detalhado com gráficos, métricas e ajustes automáticos baseados na sua evolução'
            },
            {
              icon: '💬',
              title: 'Suporte 24/7',
              desc: 'Chat inteligente disponível a qualquer hora para tirar dúvidas sobre alimentação e treino'
            },
            {
              icon: '🍽️',
              title: 'Cardápios Variados',
              desc: 'Milhares de receitas saudáveis e saborosas adaptadas ao seu objetivo e restrições alimentares'
            },
            {
              icon: '📱',
              title: 'App Completo',
              desc: 'Acesse de qualquer lugar: celular, tablet ou computador. Sincronização automática'
            },
            {
              icon: '🎯',
              title: 'Foco em Você',
              desc: 'Cada plano é único, considerando seu biotipo, rotina, preferências e metas específicas'
            }
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-50 via-green-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Cadastro Rápido', desc: 'Crie sua conta em menos de 2 minutos' },
              { num: '2', title: 'Perfil Completo', desc: 'Responda perguntas sobre seus objetivos' },
              { num: '3', title: 'IA Personaliza', desc: 'Algoritmo cria seu plano ideal' },
              { num: '4', title: 'Resultados', desc: 'Acompanhe sua evolução diariamente' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
          Histórias de Sucesso
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Maria Silva',
              result: 'Perdeu 15kg em 3 meses',
              text: 'Nunca achei que seria tão fácil! O plano personalizado se encaixou perfeitamente na minha rotina.',
              avatar: '👩'
            },
            {
              name: 'João Santos',
              result: 'Ganhou 8kg de massa',
              text: 'A IA entendeu exatamente o que eu precisava. Resultados visíveis em 6 semanas!',
              avatar: '👨'
            },
            {
              name: 'Ana Costa',
              result: 'Mais energia e saúde',
              text: 'Minha qualidade de vida melhorou muito. O suporte 24/7 faz toda diferença!',
              avatar: '👩‍🦰'
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-6xl mb-4">{testimonial.avatar}</div>
              <div className="text-yellow-400 text-2xl mb-3">★★★★★</div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <div className="border-t pt-4">
                <p className="font-bold text-gray-800">{testimonial.name}</p>
                <p className="text-sm text-green-600 font-semibold">{testimonial.result}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-500 via-green-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto Para Começar Sua Transformação?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se a milhares de pessoas que já transformaram suas vidas
          </p>
          <Link
            href="/registro"
            className="inline-block bg-white text-purple-600 px-12 py-5 rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Começar Agora - 15 Dias Grátis
          </Link>
          <p className="mt-6 text-white/80 text-sm">
            Sem compromisso • Cancele quando quiser
          </p>
        </div>
      </section>
    </div>
  );
}
