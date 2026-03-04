import { Operacao } from "./types";

// ─────────────────────────────────────────────
// TOP EXCHANGES BRASIL — Parsers de CSV
// Suportadas: Binance, Mercado Bitcoin, Foxbit,
//             NovaDAX, Bybit, Bitget, OKX,
//             Coinbase, Kraken, Biscoint
// ─────────────────────────────────────────────

/** ───── BINANCE ─────────────────────────────
 * Formato Trade History:
 *   Date(UTC),Pair,Side,Price,Executed,Amount,Fee
 * Formato Transaction History:
 *   UTCTime,Account,Operation,Coin,Change,Remark
 */
export function parseBinanceCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];
  const header = lines[0].toLowerCase();

  if (header.includes("date") && header.includes("pair")) {
    return parseBinanceTradeHistory(lines.slice(1));
  } else if (header.includes("utc_time") && header.includes("operation")) {
    return parseBinanceTransactionHistory(lines.slice(1));
  }

  return operacoes;
}

function parseBinanceTradeHistory(lines: string[]): Operacao[] {
  const operacoes: Operacao[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    try {
      const [date, pair, side, price, executed, amount] = cols;

      const cripto = extrairCripto(pair);
      const tipo = side.toLowerCase() === "buy" ? "compra" : "venda";
      const quantidade = parseFloat(executed.replace(",", ".")) || 0;
      const valorTotal = parseFloat(amount.replace(",", ".")) || 0;
      const precoUnitario = parseFloat(price.replace(",", ".")) || 0;

      if (quantidade > 0 && valorTotal > 0) {
        operacoes.push({
          id: gerarId("binance"),
          tipo,
          cripto,
          quantidade,
          valorTotal,
          precoUnitario,
          data: formatarData(date),
          exchange: "Binance",
        });
      }
    } catch (e) {
      console.error("Binance parse error:", line, e);
    }
  }

  return operacoes;
}

function parseBinanceTransactionHistory(lines: string[]): Operacao[] {
  // Formato não contém valor BRL — retorna vazio e orienta o usuário
  return [];
}

/** ───── MERCADO BITCOIN ──────────────────────
 * Formato: Data,Tipo,Moeda,Quantidade,Preço,Total
 */
export function parseMercadoBitcoinCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    try {
      const [data, tipo, moeda, quantidade, preco, total] = cols;

      const tipoOp = tipo.toLowerCase().includes("compra") ? "compra" : "venda";
      const qtd = parseFloat(quantidade.replace(",", ".")) || 0;
      const valorTotal = parseFloat(total.replace(",", ".")) || 0;
      const precoUnitario = parseFloat(preco.replace(",", ".")) || 0;

      if (qtd > 0 && valorTotal > 0) {
        operacoes.push({
          id: gerarId("mb"),
          tipo: tipoOp,
          cripto: moeda.toUpperCase(),
          quantidade: qtd,
          valorTotal,
          precoUnitario,
          data: formatarData(data),
          exchange: "Mercado Bitcoin",
        });
      }
    } catch (e) {
      console.error("Mercado Bitcoin parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── FOXBIT ───────────────────────────────
 * Formato exportado:
 *   Número da ordem,Data/Hora,Mercado,Tipo,Preço,Quantidade,Valor total,Taxa,Status
 */
export function parseFoxbitCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 7) continue;

    try {
      // Número,Data/Hora,Mercado,Tipo,Preço,Quantidade,Valor total
      const [, dataHora, mercado, tipo, preco, quantidade, valorTotal] = cols;

      const tipoOp = tipo.toLowerCase().includes("compra") ? "compra" : "venda";
      const cripto = extrairCripto(mercado.replace("-", "").replace("/", ""));
      const qtd = parseFloat(quantidade.replace(",", ".")) || 0;
      const total = parseFloat(valorTotal.replace(",", ".")) || 0;
      const precoUnit = parseFloat(preco.replace(",", ".")) || 0;

      if (qtd > 0 && total > 0) {
        operacoes.push({
          id: gerarId("foxbit"),
          tipo: tipoOp,
          cripto,
          quantidade: qtd,
          valorTotal: total,
          precoUnitario: precoUnit,
          data: formatarData(dataHora.split(" ")[0]),
          exchange: "Foxbit",
        });
      }
    } catch (e) {
      console.error("Foxbit parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── NOVADAX ──────────────────────────────
 * Formato: Data de Criação,Tipo,Ativo,Quantidade,Preço (BRL),Total (BRL)
 */
export function parseNovaDAXCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    try {
      const [data, tipo, ativo, quantidade, preco, total] = cols;

      const tipoOp = tipo.toLowerCase().includes("compra") || tipo.toLowerCase() === "buy"
        ? "compra" : "venda";
      const qtd = parseFloat(quantidade.replace(",", ".")) || 0;
      const valorTotal = parseFloat(total.replace(",", ".")) || 0;
      const precoUnit = parseFloat(preco.replace(",", ".")) || 0;

      if (qtd > 0 && valorTotal > 0) {
        operacoes.push({
          id: gerarId("novadax"),
          tipo: tipoOp,
          cripto: ativo.toUpperCase().replace("BRL", "").replace("USDT", "").trim() || ativo.toUpperCase(),
          quantidade: qtd,
          valorTotal,
          precoUnitario: precoUnit,
          data: formatarData(data.split(" ")[0]),
          exchange: "NovaDAX",
        });
      }
    } catch (e) {
      console.error("NovaDAX parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── BYBIT ────────────────────────────────
 * Formato Spot: Date(UTC),Symbol,Side,Order Price,Order Amount,Exec Price,Exec Qty,Exec Value,Fee,Status
 * ⚠ Valores em USDT — precisa conversão BRL pelo usuário
 */
export function parseBybitCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 8) continue;

    try {
      // Date,Symbol,Side,OrderPrice,OrderAmount,ExecPrice,ExecQty,ExecValue
      const [date, symbol, side, , , execPrice, execQty, execValue] = cols;

      const status = cols[cols.length - 1]?.toLowerCase();
      if (status && !status.includes("filled")) continue;

      const tipo = side.toLowerCase() === "buy" ? "compra" : "venda";
      const cripto = extrairCripto(symbol);
      const qtd = parseFloat(execQty.replace(",", ".")) || 0;
      const valorUSDT = parseFloat(execValue.replace(",", ".")) || 0;
      const precoUnit = parseFloat(execPrice.replace(",", ".")) || 0;

      if (qtd > 0 && valorUSDT > 0) {
        operacoes.push({
          id: gerarId("bybit"),
          tipo,
          cripto,
          quantidade: qtd,
          valorTotal: valorUSDT, // ⚠ em USDT — converter pelo usuário
          precoUnitario: precoUnit,
          data: formatarData(date.split(" ")[0]),
          exchange: "Bybit (USDT)",
        });
      }
    } catch (e) {
      console.error("Bybit parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── BITGET ───────────────────────────────
 * Formato Spot: Time,Symbol,Side,Price(USDT),Amount,Total(USDT),Fee,Status
 * ⚠ Valores em USDT — precisa conversão BRL pelo usuário
 */
export function parseBitgetCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    try {
      // Time,Symbol,Side,Price,Amount,Total
      const [time, symbol, side, price, amount, total] = cols;

      const tipo = side.toLowerCase() === "buy" ? "compra" : "venda";
      const cripto = extrairCripto(symbol);
      const qtd = parseFloat(amount.replace(",", ".")) || 0;
      const valorUSDT = parseFloat(total.replace(",", ".")) || 0;
      const precoUnit = parseFloat(price.replace(",", ".")) || 0;

      if (qtd > 0 && valorUSDT > 0) {
        operacoes.push({
          id: gerarId("bitget"),
          tipo,
          cripto,
          quantidade: qtd,
          valorTotal: valorUSDT, // ⚠ em USDT
          precoUnitario: precoUnit,
          data: formatarData(time.split(" ")[0]),
          exchange: "Bitget (USDT)",
        });
      }
    } catch (e) {
      console.error("Bitget parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── OKX ─────────────────────────────────
 * Formato: Trade Time,Instrument ID,Trade ID,Side,Fill Size,Fill Price,Fee,Fee Currency,P&L
 * ⚠ Valores em USDT
 */
export function parseOKXCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 6) continue;

    try {
      // Trade Time,Instrument ID,Trade ID,Side,Fill Size,Fill Price
      const [tradeTime, instrumentId, , side, fillSize, fillPrice] = cols;

      const tipo = side.toLowerCase() === "buy" ? "compra" : "venda";
      const cripto = extrairCripto(instrumentId.replace("-SPOT", "").replace("-USDT", ""));
      const qtd = parseFloat(fillSize.replace(",", ".")) || 0;
      const precoUnit = parseFloat(fillPrice.replace(",", ".")) || 0;
      const valorUSDT = qtd * precoUnit;

      if (qtd > 0 && valorUSDT > 0) {
        operacoes.push({
          id: gerarId("okx"),
          tipo,
          cripto,
          quantidade: qtd,
          valorTotal: valorUSDT, // ⚠ em USDT
          precoUnitario: precoUnit,
          data: formatarData(tradeTime.split(" ")[0].split("T")[0]),
          exchange: "OKX (USDT)",
        });
      }
    } catch (e) {
      console.error("OKX parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── COINBASE ─────────────────────────────
 * Formato: Timestamp,Transaction Type,Asset,Quantity Transacted,
 *          Spot Price Currency,Spot Price at Transaction,Subtotal,
 *          Total (inclusive of fees),Fees,Notes
 * ⚠ Valores em USD
 */
export function parseCoinbaseCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 8) continue;

    try {
      // Timestamp,Transaction Type,Asset,Quantity,Spot Price Currency,Spot Price,Subtotal,Total
      const [timestamp, txType, asset, quantity, , spotPrice, , total] = cols;

      const txLower = txType.toLowerCase();
      if (!txLower.includes("buy") && !txLower.includes("sell")) continue;

      const tipo = txLower.includes("buy") ? "compra" : "venda";
      const qtd = parseFloat(quantity.replace(",", ".")) || 0;
      const valorUSD = parseFloat(total.replace(",", ".").replace("$", "")) || 0;
      const precoUnit = parseFloat(spotPrice.replace(",", ".").replace("$", "")) || 0;

      if (qtd > 0 && valorUSD > 0) {
        operacoes.push({
          id: gerarId("coinbase"),
          tipo,
          cripto: asset.toUpperCase(),
          quantidade: qtd,
          valorTotal: valorUSD, // ⚠ em USD — converter pelo usuário
          precoUnitario: precoUnit,
          data: formatarData(timestamp.split("T")[0].split(" ")[0]),
          exchange: "Coinbase (USD)",
        });
      }
    } catch (e) {
      console.error("Coinbase parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── KRAKEN ───────────────────────────────
 * Formato: txid,ordertxid,pair,time,type,ordertype,price,cost,fee,vol,margin,misc,ledgers
 * ⚠ Valores podem ser em USD/USDT
 */
export function parseKrakenCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 10) continue;

    try {
      // txid,ordertxid,pair,time,type,ordertype,price,cost,fee,vol
      const [, , pair, time, type, , price, cost, , vol] = cols;

      const tipo = type.toLowerCase() === "buy" ? "compra" : "venda";
      const cripto = extrairCripto(pair.replace("XBT", "BTC"));
      const qtd = parseFloat(vol.replace(",", ".")) || 0;
      const valorTotal = parseFloat(cost.replace(",", ".")) || 0;
      const precoUnit = parseFloat(price.replace(",", ".")) || 0;

      if (qtd > 0 && valorTotal > 0) {
        operacoes.push({
          id: gerarId("kraken"),
          tipo,
          cripto,
          quantidade: qtd,
          valorTotal,
          precoUnitario: precoUnit,
          data: formatarData(time.split(" ")[0]),
          exchange: "Kraken",
        });
      }
    } catch (e) {
      console.error("Kraken parse error:", lines[i], e);
    }
  }

  return operacoes;
}

/** ───── PARSER GENÉRICO ─────────────────────
 * Detecta automaticamente o formato e roteia
 */
export function parseCSV(csvContent: string, exchange?: string): Operacao[] {
  const content = csvContent.trim();
  const firstLine = content.split("\n")[0].toLowerCase();

  // 1. Exchange explícita
  if (exchange) {
    switch (exchange) {
      case "binance":        return parseBinanceCSV(content);
      case "mercadobitcoin": return parseMercadoBitcoinCSV(content);
      case "foxbit":         return parseFoxbitCSV(content);
      case "novadax":        return parseNovaDAXCSV(content);
      case "bybit":          return parseBybitCSV(content);
      case "bitget":         return parseBitgetCSV(content);
      case "okx":            return parseOKXCSV(content);
      case "coinbase":       return parseCoinbaseCSV(content);
      case "kraken":         return parseKrakenCSV(content);
    }
  }

  // 2. Detecção automática pelo header
  if (firstLine.includes("pair") && firstLine.includes("side"))    return parseBinanceCSV(content);
  if (firstLine.includes("utc_time") && firstLine.includes("operation")) return parseBinanceCSV(content);
  if (firstLine.includes("moeda") || (firstLine.includes("tipo") && firstLine.includes("quantidade"))) return parseMercadoBitcoinCSV(content);
  if (firstLine.includes("mercado") && firstLine.includes("número")) return parseFoxbitCSV(content);
  if (firstLine.includes("novadax") || (firstLine.includes("ativo") && firstLine.includes("criação"))) return parseNovaDAXCSV(content);
  if (firstLine.includes("fill size") || firstLine.includes("instrument id")) return parseOKXCSV(content);
  if (firstLine.includes("transaction type") && firstLine.includes("asset")) return parseCoinbaseCSV(content);
  if (firstLine.includes("exec qty") || firstLine.includes("exec value")) return parseBybitCSV(content);
  if (firstLine.includes("ordertxid") || firstLine.includes("txid")) return parseKrakenCSV(content);
  if (firstLine.includes("symbol") && firstLine.includes("side") && firstLine.includes("time")) return parseBitgetCSV(content);

  // 3. Fallback: tenta Binance
  return parseBinanceCSV(content);
}

// ─────────────────────────────────────────────
// Helpers compartilhados
// ─────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function extrairCripto(pair: string): string {
  const fiats = ["BRL", "USDT", "USD", "EUR", "BUSD", "USDC", "BTC", "ETH"];
  let cripto = pair.toUpperCase().trim();

  // Remover separadores comuns
  cripto = cripto.replace(/[-_/]/g, "");

  for (const fiat of fiats) {
    if (cripto.endsWith(fiat) && cripto.length > fiat.length) {
      cripto = cripto.slice(0, -fiat.length);
      break;
    }
  }

  return cripto || pair.toUpperCase();
}

function formatarData(dateStr: string): string {
  try {
    let date: Date;

    if (dateStr.includes("/")) {
      const parts = dateStr.split(/[/ ]/);
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        // DD/MM/YYYY
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else if (dateStr.includes("-")) {
      date = new Date(dateStr);
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      return new Date().toISOString().split("T")[0];
    }

    return date.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

function gerarId(prefixo: string): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
