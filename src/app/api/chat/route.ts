import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Resposta simples - você pode conectar ao Ollama depois
    const response = {
      message: `Obrigado pela sua pergunta! Em breve nosso sistema de IA estará completamente integrado. Por enquanto, recomendo entrar em contato pelo email: contato@nutrifitcoach.com.br`
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro no chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
