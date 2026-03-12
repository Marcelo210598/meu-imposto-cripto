// Integração Binance via proxy Frankfurt (fra1).
// Binance não bloqueia IPs europeus — apenas EUA, Malaysia e Ontario são restritos.
// O erro anterior "restricted location" era porque o servidor estava nos EUA (iad1).
// Proxy Frankfurt → api.binance.com funciona.

import { Operacao } from "@/lib/types";

const PARES_BRL = [
  "BTCBRL", "ETHBRL", "BNBBRL", "SOLBRL", "XRPBRL",
  "ADABRL", "DOTBRL", "LINKBRL", "LTCBRL", "MATICBRL",
  "AVAXBRL", "DOGBRL", "FTMBRL", "TRXBRL",
];

const PARES_USDT = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "LINKUSDT", "LTCUSDT", "MATICUSDT",
  "AVAXUSDT", "DOTUSDT", "UNIUSDT", "SHIBUSDT", "AAVEUSDT",
  "ATOMUSDT", "FTMUSDT", "TRXUSDT", "NEARUSDT",
];

const TODOS_PARES = [...new Set([...PARES_BRL, ...PARES_USDT])];
const MOEDAS_USD = ["USDT", "USDC", "BUSD", "USD"];

// ─── HMAC-SHA256 via Web Crypto API ──────────────────────────────────────────

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── request via proxy Railway ou Vercel ─────────────────────────────────────
// NEXT_PUBLIC_BINANCE_PROXY_URL → Railway (EU, IP não bloqueado pela Binance)
// Fallback → /api/binance-proxy (Vercel, pode estar bloqueado)

const PROXY_URL =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_BINANCE_PROXY_URL
    ? `${process.env.NEXT_PUBLIC_BINANCE_PROXY_URL}/binance`
    : "/api/binance-proxy";

async function binanceProxy(
  path: string,
  params: Record<string, string | number>,
  apiKey: string,
  apiSecret: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const timestamp = Date.now();
  const qs = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    timestamp: String(timestamp),
  }).toString();

  const signature = await hmacSHA256(apiSecret, qs);
  const queryString = `${qs}&signature=${signature}`;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, queryString, apiKey }),
    signal: AbortSignal.timeout(25_000),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function extrairMoedaCotada(symbol: string): string {
  for (const moeda of ["USDT", "USDC", "BUSD", "BRL", "ETH", "BNB", "BTC"]) {
    if (symbol.endsWith(moeda) && symbol.length > moeda.length) return moeda;
  }
  return "BRL";
}

function extrairCripto(symbol: string): string {
  for (const moeda of ["USDT", "USDC", "BUSD", "BRL", "ETH", "BNB", "BTC"]) {
    if (symbol.endsWith(moeda) && symbol.length > moeda.length) {
      return symbol.slice(0, -moeda.length);
    }
  }
  return symbol;
}

// ─── testa conexão ────────────────────────────────────────────────────────────

export async function testarConexaoBinanceBrowser(
  apiKey: string,
  apiSecret: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    const { ok, status, data } = await binanceProxy("/api/v3/account", {}, apiKey, apiSecret);

    if (ok) return { ok: true };

    if (status === 401 || status === 403) {
      return { ok: false, erro: "API Key inválida ou sem permissão de leitura" };
    }

    const msg = (data as { msg?: string; error?: string })?.msg
      ?? (data as { msg?: string; error?: string })?.error
      ?? `Erro ${status}`;
    return { ok: false, erro: msg };
  } catch (err) {
    console.error("[binance] teste erro:", err);
    return { ok: false, erro: "Não foi possível conectar. Verifique sua conexão." };
  }
}

// ─── busca trades de um par ───────────────────────────────────────────────────

async function buscarTradesPar(
  symbol: string,
  apiKey: string,
  apiSecret: string
): Promise<{ id: number; symbol: string; price: string; qty: string; quoteQty: string; time: number; isBuyer: boolean }[]> {
  try {
    const { ok, data } = await binanceProxy("/api/v3/myTrades", { symbol, limit: 1000 }, apiKey, apiSecret);
    if (!ok) return [];
    return Array.isArray(data) ? (data as Record<string, unknown>[]).map((t) => ({ ...t, symbol })) as never : [];
  } catch {
    return [];
  }
}

// ─── sincronização principal ──────────────────────────────────────────────────

export async function sincronizarBinanceBrowser(
  apiKey: string,
  apiSecret: string,
  onProgress?: (par: string, total: number) => void
): Promise<{ operacoes: Operacao[]; paresComTrades: string[] }> {
  const operacoes: Operacao[] = [];
  const paresComTrades: string[] = [];

  for (let i = 0; i < TODOS_PARES.length; i += 5) {
    const lote = TODOS_PARES.slice(i, i + 5);
    const resultados = await Promise.allSettled(
      lote.map((symbol) => buscarTradesPar(symbol, apiKey, apiSecret))
    );

    for (let j = 0; j < lote.length; j++) {
      const symbol = lote[j];
      const resultado = resultados[j];
      if (resultado.status !== "fulfilled" || resultado.value.length === 0) continue;

      paresComTrades.push(symbol);
      onProgress?.(symbol, operacoes.length);

      const moedaCotada = extrairMoedaCotada(symbol);
      const isUSD = MOEDAS_USD.includes(moedaCotada);
      const cripto = extrairCripto(symbol);

      for (const t of resultado.value) {
        const quantidade = parseFloat(t.qty);
        const valorTotal = parseFloat(t.quoteQty);
        const precoUnitario = parseFloat(t.price);
        if (quantidade <= 0 || valorTotal <= 0) continue;

        operacoes.push({
          id: `binance-api-${t.id}-${symbol}`,
          tipo: t.isBuyer ? "compra" : "venda",
          cripto,
          quantidade,
          valorTotal,
          precoUnitario,
          data: new Date(t.time).toISOString().split("T")[0],
          exchange: isUSD ? "Binance (USDT)" : "Binance",
        });
      }
    }

    if (i + 5 < TODOS_PARES.length) await new Promise((r) => setTimeout(r, 200));
  }

  operacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  return { operacoes, paresComTrades };
}
