import { createHmac } from "crypto";
import { Operacao } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Pares mais comuns na Binance Brasil
// Estratégia: buscar todos → filtrar os que têm trades
// ─────────────────────────────────────────────────────────────────────────────
const PARES_BRL = [
  "BTCBRL", "ETHBRL", "BNBBRL", "SOLBRL", "XRPBRL",
  "ADABRL", "DOTBRL", "LINKBRL", "LTCBRL", "MATICBRL",
  "AVAXBRL", "DOGBRL", "UNIUSDT", "SHIBUSDT", "PEPE",
  "FTMBRL", "TRXBRL",
];

const PARES_USDT = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "LINKUSDT", "LTCUSDT", "MATICUSDT",
  "AVAXUSDT", "DOTUSDT", "UNIUSDT", "SHIBUSDT", "AAVEUSDT",
  "ATOMUSDT", "FTMUSDT", "TRXUSDT", "NEARUSDT", "APTUSD",
];

const TODOS_PARES = [...new Set([...PARES_BRL, ...PARES_USDT])];

const MOEDAS_USD = ["USDT", "USDC", "BUSD", "USD"];
const BASE_URL = "https://api.binance.com";

// ─── tipos internos da API da Binance ────────────────────────────────────────

interface BinanceTrade {
  id: number;
  orderId: number;
  symbol: string;
  price: string;
  qty: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function sign(queryString: string, secret: string): string {
  return createHmac("sha256", secret).update(queryString).digest("hex");
}

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

// ─── requisição autenticada ───────────────────────────────────────────────────

async function binanceGet(
  path: string,
  params: Record<string, string | number>,
  apiKey: string,
  apiSecret: string
): Promise<Response> {
  const timestamp = Date.now();
  const qs = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    timestamp: String(timestamp),
  }).toString();

  const signature = sign(qs, apiSecret);
  const url = `${BASE_URL}${path}?${qs}&signature=${signature}`;

  return fetch(url, {
    headers: {
      "X-MBX-APIKEY": apiKey,
      "Content-Type": "application/json",
    },
    // timeout de 10s por request
    signal: AbortSignal.timeout(10_000),
  });
}

// ─── testa se a chave é válida ────────────────────────────────────────────────

export async function testarConexaoBinance(
  apiKey: string,
  apiSecret: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    const res = await binanceGet("/api/v3/account", {}, apiKey, apiSecret);

    if (res.status === 401 || res.status === 403) {
      return { ok: false, erro: "API Key inválida ou sem permissão de leitura" };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, erro: (body as { msg?: string }).msg ?? `Erro ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { ok: false, erro: "Timeout ao conectar na Binance. Verifique sua conexão." };
    }
    return { ok: false, erro: "Erro de conexão com a Binance" };
  }
}

// ─── busca trades de um par específico ───────────────────────────────────────

async function buscarTradesPar(
  symbol: string,
  apiKey: string,
  apiSecret: string,
  limit = 1000
): Promise<BinanceTrade[]> {
  try {
    const res = await binanceGet(
      "/api/v3/myTrades",
      { symbol, limit },
      apiKey,
      apiSecret
    );

    // Par sem trades ou inexistente — não é erro crítico
    if (res.status === 400) return [];
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── função principal: busca todos os trades ─────────────────────────────────

export async function sincronizarBinance(
  apiKey: string,
  apiSecret: string,
  paresExtras: string[] = []
): Promise<{ operacoes: Operacao[]; paresComTrades: string[]; total: number }> {
  const pares = [...new Set([...TODOS_PARES, ...paresExtras.map((p) => p.toUpperCase())])];

  // Busca todos os pares em paralelo (lotes de 5 para não bater rate limit)
  const resultados: { symbol: string; trades: BinanceTrade[] }[] = [];

  for (let i = 0; i < pares.length; i += 5) {
    const lote = pares.slice(i, i + 5);
    const promessas = lote.map(async (symbol) => ({
      symbol,
      trades: await buscarTradesPar(symbol, apiKey, apiSecret),
    }));
    const loteResultados = await Promise.allSettled(promessas);
    for (const r of loteResultados) {
      if (r.status === "fulfilled") resultados.push(r.value);
    }
    // Pequena pausa entre lotes para respeitar rate limit (1200 req/min)
    if (i + 5 < pares.length) await new Promise((r) => setTimeout(r, 200));
  }

  const paresComTrades: string[] = [];
  const operacoes: Operacao[] = [];

  for (const { symbol, trades } of resultados) {
    if (trades.length === 0) continue;
    paresComTrades.push(symbol);

    const moedaCotada = extrairMoedaCotada(symbol);
    const isUSD = MOEDAS_USD.includes(moedaCotada);
    const cripto = extrairCripto(symbol);

    for (const t of trades) {
      const quantidade = parseFloat(t.qty);
      const valorTotal = parseFloat(t.quoteQty);
      const precoUnitario = parseFloat(t.price);

      if (quantidade <= 0 || valorTotal <= 0) continue;

      const data = new Date(t.time).toISOString().split("T")[0];

      operacoes.push({
        id: `binance-api-${t.id}-${symbol}`,
        tipo: t.isBuyer ? "compra" : "venda",
        cripto,
        quantidade,
        valorTotal,
        precoUnitario,
        data,
        exchange: isUSD ? "Binance (USDT)" : "Binance",
      });
    }
  }

  // Ordena por data desc
  operacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return { operacoes, paresComTrades, total: operacoes.length };
}
