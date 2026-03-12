import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Dublin/Irlanda (dub1) = AWS eu-west-1.
// CoinTracking (serviço de imposto cripto) usa exatamente esses IPs e funciona com Binance.
// IPs publicados deles: 18.202.x.x, 18.203.x.x, 34.241.x.x — todos AWS eu-west-1 (Irlanda).
// Frankfurt foi bloqueado. Irlanda não é.
export const preferredRegion = ["dub1"];

const ALLOWED_PATHS = new Set([
  "/api/v3/account",
  "/api/v3/myTrades",
]);

const BINANCE_BASES = [
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!rateLimit(`binance-proxy:${session.user.id}`, 300, 60_000)) {
    return NextResponse.json({ error: "Rate limit excedido" }, { status: 429 });
  }

  let body: { path?: string; queryString?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { path, queryString, apiKey } = body;

  if (!path || !ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ error: "Caminho não permitido" }, { status: 400 });
  }

  if (!queryString || !apiKey) {
    return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 });
  }

  let lastStatus = 502;
  let lastData: unknown = { error: "Não foi possível conectar à Binance" };

  for (const base of BINANCE_BASES) {
    try {
      const url = `${base}${path}?${queryString}`;
      const res = await fetch(url, {
        headers: { "X-MBX-APIKEY": apiKey },
        signal: AbortSignal.timeout(15_000),
      });

      const data = await res.json();

      if (res.status !== 503 && res.status !== 502) {
        return NextResponse.json(data, { status: res.status });
      }

      lastStatus = res.status;
      lastData = data;
    } catch {
      continue;
    }
  }

  return NextResponse.json(lastData, { status: lastStatus });
}
