import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { sincronizarBinance } from "@/lib/exchanges/binance";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";

// POST /api/exchanges/[id]/sync — puxa trades e importa como Operacao
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Rate limit: max 5 syncs por minuto por usuário
  if (!rateLimit(`exchanges-sync:${session.user.id}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Muitas sincronizações. Aguarde um minuto." },
      { status: 429 }
    );
  }

  const { id } = await params;
  const userId = session.user.id as string;
  const userPlano = (session.user as { plano?: string }).plano ?? "gratis";

  // Busca conexão verificando ownership
  const conexao = await prisma.exchangeConnection.findFirst({
    where: { id, userId, active: true },
  });

  if (!conexao) {
    return NextResponse.json({ error: "Conexão não encontrada" }, { status: 404 });
  }

  // Descriptografa o secret
  let apiSecret: string;
  try {
    apiSecret = decrypt(conexao.apiSecret);
  } catch {
    return NextResponse.json(
      { error: "Falha ao descriptografar credenciais. Reconecte a exchange." },
      { status: 500 }
    );
  }

  // Sincroniza conforme a exchange
  let novasOperacoes: Awaited<ReturnType<typeof sincronizarBinance>>["operacoes"] = [];
  let paresComTrades: string[] = [];

  if (conexao.exchange === "binance") {
    const resultado = await sincronizarBinance(conexao.apiKey, apiSecret);
    novasOperacoes = resultado.operacoes;
    paresComTrades = resultado.paresComTrades;
  } else {
    return NextResponse.json({ error: "Exchange não suportada" }, { status: 400 });
  }

  if (novasOperacoes.length === 0) {
    await prisma.exchangeConnection.update({
      where: { id },
      data: { lastSyncAt: new Date(), lastSyncOps: 0 },
    });
    return NextResponse.json({ importadas: 0, paresComTrades, mensagem: "Nenhuma operação encontrada nos pares monitorados." });
  }

  // Verifica quais ops já existem no banco (evita duplicatas por ID do trade)
  const idsExistentes = await prisma.operacao.findMany({
    where: { userId },
    select: { id: true },
  }).then((ops) => new Set(ops.map((op) => op.id)));

  const opsNovas = novasOperacoes.filter((op) => !idsExistentes.has(op.id));

  // Paywall: plano grátis max 50 ops
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

  // Salva em lotes de 100 para não estourar o payload do Prisma
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

  // Atualiza metadados da conexão
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
