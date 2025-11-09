import { NextRequest, NextResponse } from "next/server";
import { searchEmbedding } from "@/lib/rag/search";

// Carregar banco vetorial (JSON)
const DB_PATH = process.env.NFC_VECTOR_DB || "library_vector_db.json";

let db: { text: string; embedding: number[] }[] = [];
try {
  const file = await import(`../../../${DB_PATH}`);
  db = file.default;
} catch {
  console.warn("⚠️ Vector DB não encontrado.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query || "";

    if (!query) return NextResponse.json({ results: [] });

    const results = await searchEmbedding(query, db, 5);

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao buscar no RAG." },
      { status: 500 }
    );
  }
}
