import { Operacao } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Parser de PDF — Binance Spot Trade History (PT-BR)
//
// Formato real exportado pela Binance:
//   Tempo   Par   Lado   Preço   Executado   Quantidade   Taxa
//   26-03-02 21:11:06   ETHBRL   SELL   10502.13   0.1705ETH   1790.613165BRL   1.79BRL
//
// Observações:
//   - Data com 2 dígitos de ano: "26-03-02" → "2026-03-02"
//   - Números colados com a unidade: "0.1705ETH", "1790.613165BRL"
//   - Separador de colunas: múltiplos espaços
//   - Lado (Side): BUY / SELL (inglês, mesmo no export PT-BR)
// ─────────────────────────────────────────────────────────────────────────────

const EXCHANGES_USD = ["USDT", "USD", "USDC", "BUSD"];

// Regex: captura cada linha de trade
// Grupos:
//   1 — data     (YY-MM-DD)
//   2 — par      (ex: ETHBRL, ETHUSDT)
//   3 — lado     (BUY | SELL)
//   4 — preço
//   5 — executado (qty sem unidade)
//   6 — quantidade/total (valor na moeda cotada, sem unidade)
const ROW_PATTERN =
  /^(\d{2}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+([A-Z0-9]{4,12})\s+(BUY|SELL)\s+([\d.]+)\s+([\d.]+)[A-Z]+\s+([\d.]+)[A-Z]+/i;

export function parseBinancePDF(text: string): Operacao[] {
  const operacoes: Operacao[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const match = line.match(ROW_PATTERN);
    if (!match) continue;

    const [, dateYY, pair, side, priceRaw, executedRaw, amountRaw] = match;

    try {
      const tipo: "compra" | "venda" = side.toUpperCase() === "BUY" ? "compra" : "venda";
      const cripto = extrairCriptoDoPar(pair);
      const moedaCotada = extrairMoedaCotada(pair);
      const isUSD = EXCHANGES_USD.includes(moedaCotada);

      const quantidade = parseFloat(executedRaw) || 0;
      const valorTotal = parseFloat(amountRaw) || 0;
      const precoUnitario = parseFloat(priceRaw) || 0;

      if (quantidade <= 0 || valorTotal <= 0) continue;

      operacoes.push({
        id: `binance-pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tipo,
        cripto,
        quantidade,
        valorTotal,
        precoUnitario,
        data: expandirAno(dateYY),
        exchange: isUSD ? "Binance (USDT)" : "Binance",
      });
    } catch (e) {
      console.error("parseBinancePDF: erro na linha:", line, e);
    }
  }

  return operacoes;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** "26-03-02" → "2026-03-02" */
function expandirAno(dateYY: string): string {
  const [yy, mm, dd] = dateYY.split("-");
  const year = 2000 + parseInt(yy, 10);
  return `${year}-${mm}-${dd}`;
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
