export type ColorScheme = {
  bg: string;
  primary: string;
  card: string;
  badge: string;
  button: string;
};

function normalizeSexo(sexo?: string): 'masculino' | 'feminino' | 'desconhecido' {
  if (!sexo) return 'desconhecido';
  const s = sexo.toString().trim().toLowerCase();
  const masc = new Set(['masculino', 'homem', 'm', 'male', 'man']);
  const fem  = new Set(['feminino', 'mulher', 'f', 'female', 'woman']);
  if (fem.has(s)) return 'feminino';
  if (masc.has(s)) return 'masculino';
  return 'desconhecido';
}

export function getColorScheme(sexo?: string): ColorScheme {
  const tipo = normalizeSexo(sexo);

  // 🔵 Homem → verde + azul
  const masculino: ColorScheme = {
    bg: 'from-green-100 via-blue-100 to-white',
    primary: 'from-green-600 to-blue-700',
    card: 'from-green-500 to-blue-600',
    badge: 'from-green-600 to-blue-800',
    button: 'from-green-600 to-blue-700',
  };

  // 🟣 Mulher → verde + roxo
  const feminino: ColorScheme = {
    bg: 'from-green-100 via-purple-100 to-white',
    primary: 'from-green-600 to-purple-700',
    card: 'from-green-500 to-purple-600',
    badge: 'from-green-600 to-purple-800',
    button: 'from-green-600 to-purple-700',
  };

  // Neutro / sem gênero definido → verde + esmeralda
  const neutro: ColorScheme = {
    bg: 'from-green-100 via-emerald-100 to-white',
    primary: 'from-emerald-600 to-indigo-600',
    card: 'from-emerald-500 to-indigo-600',
    badge: 'from-emerald-600 to-indigo-700',
    button: 'from-emerald-600 to-indigo-600',
  };

  if (tipo === 'masculino') return masculino;
  if (tipo === 'feminino') return feminino;
  return neutro;
}
