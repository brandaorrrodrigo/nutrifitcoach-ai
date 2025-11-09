import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-secreto-aqui';

// NOTA: Importar da API de registro para acessar users
// Em produção, use um banco de dados real
let users: any[] = [];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = users.find((u) => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login bem-sucedido:', email);

    return NextResponse.json({
      token,
      user: userWithoutPassword,
      message: 'Login realizado com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Para outros endpoints terem acesso aos users
export function setUsers(userList: any[]) {
  users = userList;
}
