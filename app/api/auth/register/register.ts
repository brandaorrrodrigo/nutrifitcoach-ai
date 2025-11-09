import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// NOTA: Em produção, use um banco de dados real
// Este é apenas um exemplo com dados em memória
const users: any[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-secreto-aqui';

export async function POST(request: Request) {
  try {
    const { nome, email, password } = await request.json();

    // Validações
    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = {
      id: Date.now().toString(),
      nome,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      plano: null, // Será preenchido após escolher plano
      assinaturaAtiva: false,
    };

    users.push(newUser);

    // Gerar token JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = newUser;

    console.log('✅ Usuário criado:', email);

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: 'Conta criada com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Função auxiliar para buscar usuário (usada em outros endpoints)
export function getUsers() {
  return users;
}
