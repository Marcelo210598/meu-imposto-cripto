import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { z } from "zod";

const operacaoSchema = z.object({
  id: z.string(),
  tipo: z.enum(["compra", "venda"]),
  cripto: z.string(),
  quantidade: z.number().positive(),
  valorTotal: z.number().positive(),
  precoUnitario: z.number().positive(),
  data: z.string(),
  exchange: z.string().optional().nullable(),
});

const importSchema = z.object({
  operacoes: z.array(operacaoSchema).max(5000),
  paresComTrades: z.array(z.string()).optional(),
});

// POST /api/exchanges/[id]/import
// Recebe operações já buscadas pelo browser e salva no banco.
// O browser faz as chamadas à Binance (IP residencial do usuário, sem bloqueio).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!rateLimit(`exchanges-import:${session.user.id}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Muitas sincronizações. Aguarde um minuto." },
      { status: 429 }
    );
  }

  const { id } = await params;
  const userId = session.user.id as string;
  const userPlano = (session.user as { plano?: string }).plano ?? "gratis";

  const conexao = await prisma.exchangeConnection.findFirst({
    where: { id, userId, active: true },
  });

  if (!conexao) {
    return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", detalhes: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { operacoes: novasOperacoes, paresComTrades = [] } = parsed.data;

  if (novasOperacoes.length === 0) {
    await prisma.exchangeConnection.update({
      where: { id },
      data: { lastSyncAt: new Date(), lastSyncOps: 0 },
    });
    return NextResponse.json({
      importadas: 0,
      paresComTrades,
      mensagem: "Nenhuma operação encontrada nos pares monitorados.",
    });
  }

  // Dedup por ID do trade
  const idsExistentes = await prisma.operacao
    .findMany({ where: { userId }, select: { id: true } })
    .then((ops) => new Set(ops.map((op) => op.id)));

  const opsNovas = novasOperacoes.filter((op) => !idsExistentes.has(op.id));

  // Paywall
  let opsParaSalvar = opsNovas;
  let limitadoPorPlano = false;

  if (userPlano === "gratis") {
    const countAtual = idsExistentes.size;
    const remaining = Math.max(0, 50 - countAtual);
    if (remaining === 0) {
      return NextResponse.json(
        { error: "Limite de 50 operações atingido. Faça upgrade para o plano Pro.", upgrade: true },
        { status: 403 }
      );
    }
    if (opsNovas.length > remaining) {
      opsParaSalvar = opsNovas.slice(0, remaining);
      limitadoPorPlano = true;
    }
  }

  // Salva em lotes de 100
  let importadas = 0;
  const LOTE = 100;
  for (let i = 0; i < opsParaSalvar.length; i += LOTE) {
    const lote = opsParaSalvar.slice(i, i + LOTE);
    await prisma.$transaction(
      lote.map((op) =>
        prisma.operacao.create({
          data: {
            id: op.id,
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
    importadas += lote.length;
  }

  await prisma.exchangeConnection.update({
    where: { id },
    data: { lastSyncAt: new Date(), lastSyncOps: importadas },
  });

  return NextResponse.json({
    importadas,
    jaExistiam: opsNovas.length - opsParaSalvar.length,
    paresComTrades,
    limitadoPorPlano,
    mensagem: `${importadas} operação(ões) nova(s) importadas com sucesso.`,
  });
}
