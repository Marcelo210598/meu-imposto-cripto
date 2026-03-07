import { Operacao } from "./types";

// ─────────────────────────────────────────────────────────────
// Parser de PDF — Binance Spot Trade History
//
// Formato exportado pela Binance (PDF):
//   Date(UTC)  Pair  Side  Price  Executed  Amount  Fee
//   2024-01-15 08:23:45  BTCBRL  BUY  285000.00  0.0010 BTC  285.00 BRL  0.001 USDT
// ─────────────────────────────────────────────────────────────

const EXCHANGES_USD = ["USDT", "USD", "USDC", "BUSD"];

/**
 * Faz o parse do texto extraído de um PDF Binance Spot Trade History.
 * Retorna lista de Operacao[] com exchange "Binance" ou "Binance (USDT)"
 * dependendo da moeda do par.
 */
export function parseBinancePDF(text: string): Operacao[] {
  const operacoes: Operacao[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Regex principal: captura cada linha que começa com data + hora + par + side
  // Aceita espaçamento variável — PDFs podem omitir espaços entre células
  //
  // Grupos:
  //   1 — data (YYYY-MM-DD)
  //   2 — par  (ex: BTCBRL, ETHUSDT)
  //   3 — side (BUY | SELL)
  //   4 — price
  //   5 — executed qty
  //   6 — amount (total na moeda cotada)
  const ROW_PATTERN =
    /(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+([A-Z0-9]{4,12})\s+(BUY|SELL)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s*[A-Z]*\s*([\d,]+\.?\d*)/i;

  for (const line of lines) {
    const match = line.match(ROW_PATTERN);
    if (!match) continue;

    const [, date, pair, side, priceRaw, executedRaw, amountRaw] = match;

    try {
      const tipo: "compra" | "venda" = side.toUpperCase() === "BUY" ? "compra" : "venda";
      const cripto = extrairCriptoDoPar(pair);
      const moedaCotada = extrairMoedaCotada(pair);
      const isUSD = EXCHANGES_USD.includes(moedaCotada);

      const quantidade = parseNum(executedRaw);
      const valorTotal = parseNum(amountRaw);
      const precoUnitario = parseNum(priceRaw);

      if (quantidade <= 0 || valorTotal <= 0) continue;

      operacoes.push({
        id: `binance-pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tipo,
        cripto,
        quantidade,
        valorTotal,
        precoUnitario,
        data: date,
        exchange: isUSD ? "Binance (USDT)" : "Binance",
      });
    } catch (e) {
      console.error("parseBinancePDF: erro na linha:", line, e);
    }
  }

  return operacoes;
}

// ─── helpers ──────────────────────────────────────────────────

function parseNum(raw: string): number {
  // Remove separadores de milhar (vírgula) e converte
  return parseFloat(raw.replace(/,/g, "")) || 0;
}

const MOEDAS_COTADAS = ["BRL", "USDT", "USDC", "BUSD", "USD", "EUR", "BTC", "ETH", "BNB"];

function extrairCriptoDoPar(pair: string): string {
  const p = pair.toUpperCase();
  for (const moeda of MOEDAS_COTADAS) {
    if (p.endsWith(moeda) && p.length > moeda.length) {
      return p.slice(0, -moeda.length);
    }
  }
  return p;
}

function extrairMoedaCotada(pair: string): string {
  const p = pair.toUpperCase();
  for (const moeda of MOEDAS_COTADAS) {
    if (p.endsWith(moeda) && p.length > moeda.length) {
      return moeda;
    }
  }
  return "BRL";
}
