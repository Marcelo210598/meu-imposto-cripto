import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const userId = session.user.id as string;

  // Suporte a bulk import (array) ou single (objeto)
  const items = Array.isArray(body) ? body : [body];

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
  }

  const operacao = await prisma.operacao.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!operacao) {
    return NextResponse.json({ error: "Operação não encontrada" }, { status: 404 });
  }

  await prisma.operacao.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
