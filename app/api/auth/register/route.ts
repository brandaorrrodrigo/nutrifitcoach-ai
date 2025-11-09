import { NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const USERS_FILE = join(process.cwd(), 'users.json');

function getUsers() {
  if (!existsSync(USERS_FILE)) {
    writeFileSync(USERS_FILE, JSON.stringify([]));
    return [];
  }
  return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users: any[]) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function POST(request: Request) {
  try {
    const { nome, email, password } = await request.json();

    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
    }

    const users = getUsers();
    
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const newUser = {
      id: Date.now().toString(),
      nome,
      email,
      password: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = Buffer.from(JSON.stringify({ id: newUser.id, email })).toString('base64');

    console.log('✅ Usuário criado:', email);

    return NextResponse.json({ 
      success: true,
      token,
      user: { nome, email }
    });

  } catch (error: any) {
    console.error('❌ Erro no registro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
