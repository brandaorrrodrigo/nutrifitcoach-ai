import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'NutriFitCoach API', ts: Date.now() });
}
