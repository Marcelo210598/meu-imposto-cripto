import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { verifyCsrf, csrfError } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://workspace-tau-olive.vercel.app";

  let portalSession;
  try {
    portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/perfil`,
    });
  } catch (err) {
    console.error("[stripe/portal] Erro ao criar sessão:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro no portal: ${message}` }, { status: 500 });
  }

  return NextResponse.json({ url: portalSession.url });
}
