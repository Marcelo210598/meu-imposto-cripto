import { Operacao } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Parser de XLSX — Binance Spot Trade History
//
// Formato das colunas (PT-BR ou EN):
//   Date(UTC) / Tempo | Pair / Par | Type/Side / Lado | Price / Preço |
//   Filled / Executado | Total / Amount / Quantidade | Fee | Fee Coin
// ─────────────────────────────────────────────────────────────────────────────

type XlsxRow = Record<string, unknown>;

function getCol(row: XlsxRow, keys: string[]): string | undefined {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return String(row[key]);
    }
    const found = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
    if (found && row[found] !== undefined && row[found] !== null && row[found] !== "") {
      return String(row[found]);
    }
  }
  return undefined;
}

export function parseBinanceXLSX(rows: XlsxRow[]): Operacao[] {
  const operacoes: Operacao[] = [];

  for (const row of rows) {
    const dateRaw  = getCol(row, ["Date(UTC)", "Tempo", "Date", "Data", "Time"]);
    const pair     = getCol(row, ["Pair", "Par", "Symbol"]);
    const side     = getCol(row, ["Type", "Side", "Lado", "Order Type"]);
    const price    = getCol(row, ["Price", "Preço", "Preco", "Avg Price"]);
    const executed = getCol(row, ["Filled", "Executado", "Executed", "Qty"]);
    const amount   = getCol(row, ["Total", "Amount", "Quantidade", "Quote Qty"]);

    if (!dateRaw || !pair || !side || !amount) continue;

    // Parse date — pode vir como "2026-03-02 21:11:06" ou serial do Excel
    let data: string;
    const dateMatch = dateRaw.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      data = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    } else {
      // Excel serial date (days since 1900-01-01)
      const serial = parseInt(dateRaw, 10);
      if (!isNaN(serial) && serial > 0) {
        const ms = (serial - 25569) * 86400 * 1000;
        const d = new Date(ms);
        data = d.toISOString().split("T")[0];
      } else {
        continue;
      }
    }

    const tipo: "compra" | "venda" = side.toUpperCase().includes("BUY") ? "compra" : "venda";
    const cripto = extrairCriptoDoPar(pair);
    const moedaCotada = extrairMoedaCotada(pair);
    const isUSD = EXCHANGES_USD.includes(moedaCotada);

    const quantidade = parseFloat(executed ?? "0") || 0;
    const valorTotal = parseFloat(amount) || 0;
    const precoUnitario =
      parseFloat(price ?? "0") || (quantidade > 0 ? valorTotal / quantidade : 0);

    if (quantidade <= 0 || valorTotal <= 0) continue;

    operacoes.push({
      id: `binance-xlsx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo,
      cripto,
      quantidade,
      valorTotal,
      precoUnitario,
      data,
      exchange: isUSD ? "Binance (USDT)" : "Binance",
    });
  }

  return operacoes;
}

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

// Regex principal — Binance Spot Trade History PDF (PT-BR e EN)
//
// Formato: "26-03-02 21:11:06 ETHBRL SELL 10502.13 0.1705ETH 1790.613165BRL 1.79BRL"
//
// Variações suportadas:
//   - Número e unidade juntos:  0.1705ETH  ou separados: 0.1705 ETH
//   - Decimais com ponto ou vírgula: 1.790,61 ou 1790.61
//   - Linha sem âncora (pdfjs pode adicionar lixo no início)
//
// Grupos:
//   1 — data YY-MM-DD  2 — par  3 — lado  4 — preço  5 — executado  6 — total
const ROW_PATTERN =
  /(\d{2}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+([A-Z0-9]{4,16})\s+(BUY|SELL)\s+([\d.,]+)\s+([\d.,]+)\s*[A-Z]+\s+([\d.,]+)\s*[A-Z]+/i;

// Normaliza número no formato PT-BR (1.234,56 → 1234.56) ou EN (1234.56 → 1234.56)
function normalizarNumero(raw: string): number {
  // Se tem vírgula E ponto: "1.234,56" → remover ponto, trocar vírgula
  if (raw.includes(",") && raw.includes(".")) {
    return parseFloat(raw.replace(/\./g, "").replace(",", "."));
  }
  // Se só tem vírgula: "1234,56" → "1234.56"
  if (raw.includes(",")) {
    return parseFloat(raw.replace(",", "."));
  }
  return parseFloat(raw);
}

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

      const quantidade    = normalizarNumero(executedRaw);
      const valorTotal    = normalizarNumero(amountRaw);
      const precoUnitario = normalizarNumero(priceRaw);

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
