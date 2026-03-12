import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/exchanges/[id]/credentials
// Retorna apiKey + apiSecret descriptografado APENAS para o dono da conexão.
// Necessário para que o browser faça as chamadas à Binance diretamente (IP do usuário).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!rateLimit(`credentials:${session.user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições" }, { status: 429 });
  }

  const { id } = await params;

  const conexao = await prisma.exchangeConnection.findFirst({
    where: { id, userId: session.user.id as string, active: true },
  });

  if (!conexao) {
    return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 });
  }

  let apiSecret: string;
  try {
    apiSecret = decrypt(conexao.apiSecret);
  } catch {
    return NextResponse.json(
      { error: "Falha ao descriptografar. Reconecte a exchange." },
      { status: 500 }
    );
  }

  // Cache: não armazena em CDN, expira imediatamente
  return NextResponse.json(
    { apiKey: conexao.apiKey, apiSecret },
    { headers: { "Cache-Control": "no-store" } }
  );
}
