import { Operacao } from "./types";

/**
 * Parser de CSV da Binance
 * Formato esperado: Date(UTC),Pair,Side,Price,Executed,Amount,Fee
 */
export function parseBinanceCSV(csvContent: string): Operacao[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const operacoes: Operacao[] = [];
  const header = lines[0].toLowerCase();

  // Detectar tipo de CSV da Binance
  if (header.includes("date") && header.includes("pair")) {
    // Formato de Trade History
    return parseBinanceTradeHistory(lines.slice(1));
  } else if (header.includes("utc_time") && header.includes("operation")) {
    // Formato de Transaction History
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

      // Extrair cripto do par (ex: BTCBRL -> BTC)
      const cripto = extrairCripto(pair);
      const tipo = side.toLowerCase() === "buy" ? "compra" : "venda";
      const quantidade = parseFloat(executed.replace(",", ".")) || 0;
      const valorTotal = parseFloat(amount.replace(",", ".")) || 0;
      const precoUnitario = parseFloat(price.replace(",", ".")) || 0;

      if (quantidade > 0 && valorTotal > 0) {
        operacoes.push({
          id: `binance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      console.error("Erro ao parsear linha:", line, e);
    }
  }

  return operacoes;
}

function parseBinanceTransactionHistory(lines: string[]): Operacao[] {
  const operacoes: Operacao[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 5) continue;

    try {
      const [utcTime, , operation, coin, change] = cols;

      // Filtrar apenas operações de Buy e Sell
      const operationLower = operation.toLowerCase();
      if (!operationLower.includes("buy") && !operationLower.includes("sell")) {
        continue;
      }

      const tipo = operationLower.includes("buy") ? "compra" : "venda";
      const quantidade = Math.abs(parseFloat(change.replace(",", ".")) || 0);

      // Nota: Neste formato não temos o valor em BRL, seria necessário buscar cotação
      // Por agora, vamos pular registros sem valor
      if (quantidade > 0) {
        operacoes.push({
          id: `binance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tipo,
          cripto: coin.toUpperCase(),
          quantidade,
          valorTotal: 0, // Precisa ser preenchido manualmente ou via API
          precoUnitario: 0,
          data: formatarData(utcTime),
          exchange: "Binance",
        });
      }
    } catch (e) {
      console.error("Erro ao parsear linha:", line, e);
    }
  }

  return operacoes;
}

/**
 * Parser de CSV do Mercado Bitcoin
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
      // Formato MB: Data,Tipo,Moeda,Quantidade,Preço,Total
      const [data, tipo, moeda, quantidade, preco, total] = cols;

      const tipoOp = tipo.toLowerCase().includes("compra") ? "compra" : "venda";
      const qtd = parseFloat(quantidade.replace(",", ".")) || 0;
      const valorTotal = parseFloat(total.replace(",", ".")) || 0;
      const precoUnitario = parseFloat(preco.replace(",", ".")) || 0;

      if (qtd > 0 && valorTotal > 0) {
        operacoes.push({
          id: `mb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      console.error("Erro ao parsear linha:", line, e);
    }
  }

  return operacoes;
}

/**
 * Parser genérico - tenta detectar o formato automaticamente
 */
export function parseCSV(csvContent: string, exchange?: string): Operacao[] {
  const content = csvContent.trim();

  if (exchange === "binance" || content.toLowerCase().includes("binance")) {
    return parseBinanceCSV(content);
  }

  if (exchange === "mercadobitcoin" || content.toLowerCase().includes("mercado")) {
    return parseMercadoBitcoinCSV(content);
  }

  // Tentar detectar automaticamente
  const firstLine = content.split("\n")[0].toLowerCase();

  if (firstLine.includes("pair") || firstLine.includes("side")) {
    return parseBinanceCSV(content);
  }

  if (firstLine.includes("moeda") || firstLine.includes("tipo")) {
    return parseMercadoBitcoinCSV(content);
  }

  // Fallback: tentar Binance
  return parseBinanceCSV(content);
}

// Helpers
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
  // Remove moedas fiat comuns do final
  const fiats = ["BRL", "USDT", "USD", "EUR", "BUSD", "USDC"];
  let cripto = pair.toUpperCase();

  for (const fiat of fiats) {
    if (cripto.endsWith(fiat)) {
      cripto = cripto.slice(0, -fiat.length);
      break;
    }
  }

  return cripto || pair;
}

function formatarData(dateStr: string): string {
  try {
    // Tentar vários formatos
    let date: Date;

    if (dateStr.includes("/")) {
      // Formato BR: DD/MM/YYYY
      const [dia, mes, ano] = dateStr.split(/[/ ]/);
      date = new Date(`${ano}-${mes}-${dia}`);
    } else if (dateStr.includes("-")) {
      // Formato ISO: YYYY-MM-DD
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
