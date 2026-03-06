import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PLANS, PlanoKey } from "@/lib/stripe";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { z } from "zod";

const schema = z.object({
  plano: z.enum(["pro", "contador"]),
});

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const planoKey = parsed.data.plano as PlanoKey;
  const plan = STRIPE_PLANS[planoKey];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://workspace-tau-olive.vercel.app";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: user?.stripeCustomerId ?? undefined,
    customer_email: user?.stripeCustomerId ? undefined : (user?.email ?? session.user.email),
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${baseUrl}/perfil?success=1&plano=${planoKey}`,
    cancel_url: `${baseUrl}/precos?canceled=1`,
    metadata: {
      userId: session.user.id,
      plano: planoKey,
    },
    subscription_data: {
      metadata: {
        userId: session.user.id,
        plano: planoKey,
      },
    },
    locale: "pt-BR",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
