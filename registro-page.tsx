'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegistroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      localStorage.setItem('token', data.token);
      router.push('/planos?new=true');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-green-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-16 h-16">
              <Image
                src="/nfc-logo.png"
                alt="NutriFitCoach"
                fill
                className="object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
              NutriFitCoach
            </span>
          </Link>
          <p className="text-gray-600 mt-4 text-lg">Crie sua conta grátis</p>
        </div>

        {/* Card de Registro */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleRegistro} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Digite a senha novamente"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Termos */}
            <div className="text-xs text-gray-600 text-center bg-gray-50 p-3 rounded-xl">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="/termos" className="text-purple-600 hover:underline font-semibold">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-purple-600 hover:underline font-semibold">
                Política de Privacidade
              </Link>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02]"
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Já tem conta?{' '}
              <Link href="/login" className="text-purple-600 hover:underline font-bold">
                Entrar
              </Link>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-6 bg-gradient-to-r from-cyan-500 via-green-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="text-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">15 dias de teste grátis</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="font-semibold">Sem compromisso</span>
            </div>
          </div>
        </div>

        {/* Voltar */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 font-medium">
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
