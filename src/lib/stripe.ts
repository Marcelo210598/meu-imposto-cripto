import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
    _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  }
  return _stripe;
}

// Mantém export nomeado para compatibilidade (acesso via getter)
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    plano: "pro" as const,
    nome: "Pro",
    preco: "R$ 29/mês",
  },
  contador: {
    priceId: process.env.STRIPE_PRICE_CONTADOR!,
    plano: "contador" as const,
    nome: "Contador",
    preco: "R$ 99/mês",
  },
} as const;

export type PlanoKey = keyof typeof STRIPE_PLANS;
