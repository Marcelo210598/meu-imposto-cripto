import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { operacoesBulkSchema } from "@/lib/schemas";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { auditLog } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const operacoes = await prisma.operacao.findMany({
    where: { userId: session.user.id },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(
    operacoes.map((op) => ({
      id: op.id,
      tipo: op.tipo as "compra" | "venda",
      cripto: op.cripto,
      quantidade: op.quantidade,
      valorTotal: op.valorTotal,
      precoUnitario: op.precoUnitario,
      data: op.data.toISOString().split("T")[0],
      exchange: op.exchange ?? undefined,
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Rate limiting: 100 req/min por usuário
  if (!rateLimit(`operacoes-post:${session.user.id}`, 100, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde um momento." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = operacoesBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const items = parsed.data;
  const userId = session.user.id as string;
  const userPlano = (session.user as { plano?: string }).plano ?? "gratis";

  // Paywall: plano grátis limitado a 50 operações no banco
  if (userPlano === "gratis") {
    const count = await prisma.operacao.count({ where: { userId } });
    const remaining = 50 - count;
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "Limite de 50 operações atingido. Faça upgrade para o plano Pro para operações ilimitadas.", upgrade: true },
        { status: 403 }
      );
    }
    if (items.length > remaining) {
      return NextResponse.json(
        { error: `Você pode adicionar apenas mais ${remaining} operação(ões) no plano Grátis. Faça upgrade para o plano Pro.`, upgrade: true },
        { status: 403 }
      );
    }
  }

  const created = await prisma.$transaction(
    items.map((op) =>
      prisma.operacao.create({
        data: {
          userId,
          tipo: op.tipo,
          cripto: op.cripto,
          quantidade: op.quantidade,
          valorTotal: op.valorTotal,
          precoUnitario: op.precoUnitario,
          data: new Date(op.data),
          exchange: op.exchange ?? null,
        },
      })
    )
  );

  return NextResponse.json(
    created.map((op) => ({
      id: op.id,
      tipo: op.tipo as "compra" | "venda",
      cripto: op.cripto,
      quantidade: op.quantidade,
      valorTotal: op.valorTotal,
      precoUnitario: op.precoUnitario,
      data: op.data.toISOString().split("T")[0],
      exchange: op.exchange ?? undefined,
    })),
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Rate limiting: 60 req/min por usuário
  if (!rateLimit(`operacoes-delete:${session.user.id}`, 60, 60_000)) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde um momento." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const userId = session.user.id as string;

  // Bulk delete: remove TODAS as operações do usuário
  if (searchParams.get("all") === "true") {
    const { count } = await prisma.operacao.deleteMany({ where: { userId } });
    await auditLog({
      action: "operacao_delete",
      userId,
      ip: getIp(req),
      metadata: { bulk: true, count },
    });
    return NextResponse.json({ ok: true, count });
  }

  // Delete individual
  const id = searchParams.get("id");
  if (!id || typeof id !== "string" || id.length > 100) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  // Busca verificando ownership — nunca deletar operação de outro usuário
  const operacao = await prisma.operacao.findFirst({
    where: { id, userId },
  });

  if (!operacao) {
    return NextResponse.json({ error: "Operação não encontrada" }, { status: 404 });
  }

  await prisma.operacao.delete({ where: { id } });

  await auditLog({
    action: "operacao_delete",
    userId,
    ip: getIp(req),
    metadata: {
      operacaoId: id,
      cripto: operacao.cripto,
      tipo: operacao.tipo,
      valorTotal: operacao.valorTotal,
      data: operacao.data.toISOString().split("T")[0],
    },
  });

  return NextResponse.json({ ok: true });
}
