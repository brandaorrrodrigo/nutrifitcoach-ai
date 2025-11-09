import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas protegidas
  const protectedRoutes = ['/dashboard', '/anamnese'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Verificar assinatura ativa
    try {
      const userDataStr = Buffer.from(token, 'base64').toString('utf-8');
      const userData = JSON.parse(userDataStr);

      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userData.id,
          OR: [
            { stripeStatus: 'active' },
            { stripeStatus: 'trialing' }
          ]
        }
      });

      if (!subscription) {
        const url = request.nextUrl.clone();
        url.pathname = '/precos';
        url.searchParams.set('error', 'subscription_required');
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/anamnese/:path*']
};
