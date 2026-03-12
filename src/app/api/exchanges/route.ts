import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Força execução no servidor de São Paulo — Binance bloqueia IPs dos EUA
export const preferredRegion = ["gru1"];
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { z } from "zod";

const connectSchema = z.object({
  exchange: z.enum(["binance"]),
  apiKey: z.string().min(10).max(200),
  apiSecret: z.string().min(10).max(200),
  label: z.string().max(50).optional(),
});

// GET /api/exchanges — lista conexões do usuário (sem expor o secret)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const conexoes = await prisma.exchangeConnection.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      exchange: true,
      label: true,
      apiKey: true, // chave pública — ok expor
      lastSyncAt: true,
      lastSyncOps: true,
      createdAt: true,
    },
  });

  return NextResponse.json(conexoes);
}

// POST /api/exchanges — adiciona nova conexão (testa antes de salvar)
export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!rateLimit(`exchanges-post:${session.user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { exchange, apiKey, apiSecret, label } = parsed.data;
  const userId = session.user.id as string;

  if (!["binance"].includes(exchange)) {
    return NextResponse.json({ error: "Exchange não suportada" }, { status: 400 });
  }

  // Verifica se já existe conexão para essa exchange
  const existente = await prisma.exchangeConnection.findUnique({
    where: { userId_exchange: { userId, exchange } },
  });

  if (existente) {
    // Atualiza as chaves (usuário pode ter gerado novas keys)
    const updated = await prisma.exchangeConnection.update({
      where: { id: existente.id },
      data: {
        apiKey,
        apiSecret: encrypt(apiSecret),
        label: label ?? existente.label,
        active: true,
        updatedAt: new Date(),
      },
      select: { id: true, exchange: true, label: true, apiKey: true, lastSyncAt: true, lastSyncOps: true, createdAt: true },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.exchangeConnection.create({
    data: {
      userId,
      exchange,
      apiKey,
      apiSecret: encrypt(apiSecret),
      label,
    },
    select: { id: true, exchange: true, label: true, apiKey: true, lastSyncAt: true, lastSyncOps: true, createdAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}

// DELETE /api/exchanges?id=xxx — remove conexão
export async function DELETE(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const conexao = await prisma.exchangeConnection.findFirst({
    where: { id, userId: session.user.id as string },
  });

  if (!conexao) {
    return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 });
  }

  await prisma.exchangeConnection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

