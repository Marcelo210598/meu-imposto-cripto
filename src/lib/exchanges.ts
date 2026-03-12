/**
 * Catálogo de exchanges e suas classificações tributárias.
 * Base legal: Lei 14.754/2023 + IN RFB 2.180/2024 + IN 1.888/2019
 */

export type ExchangeRegime = "nacional" | "estrangeira" | "binance-ambigua";

export interface ExchangeInfo {
  nome: string;
  regime: ExchangeRegime;
  cnpjBrasil: boolean;
}

/**
 * Registro completo de exchanges conhecidas.
 * - "nacional": exchange com CNPJ no Brasil → isenção R$35k, DARF mensal
 * - "estrangeira": exchange sem CNPJ no Brasil → 15% flat anual, sem isenção
 * - "binance-ambigua": Binance possui entidade BR e plataforma global —
 *   obrigatório perguntar ao usuário em qual operou.
 */
export const EXCHANGES: Record<string, ExchangeInfo> = {
  // ── Nacionais (CNPJ no Brasil) ──────────────────────────────────────────────
  "mercado-bitcoin": {
    nome: "Mercado Bitcoin",
    regime: "nacional",
    cnpjBrasil: true,
  },
  foxbit: {
    nome: "Foxbit",
    regime: "nacional",
    cnpjBrasil: true,
  },
  novadax: {
    nome: "NovaDAX",
    regime: "nacional",
    cnpjBrasil: true,
  },
  coinext: {
    nome: "Coinext",
    regime: "nacional",
    cnpjBrasil: true,
  },
  bitpreco: {
    nome: "BitPreço",
    regime: "nacional",
    cnpjBrasil: true,
  },
  flowbtc: {
    nome: "FlowBTC",
    regime: "nacional",
    cnpjBrasil: true,
  },
  ripio: {
    nome: "Ripio",
    regime: "nacional",
    cnpjBrasil: true,
  },
  bitybank: {
    nome: "BityBank / Biscoint",
    regime: "nacional",
    cnpjBrasil: true,
  },
  "mynt-btg": {
    nome: "Mynt by BTG Pactual",
    regime: "nacional",
    cnpjBrasil: true,
  },
  bitnuvem: {
    nome: "BitNuvem",
    regime: "nacional",
    cnpjBrasil: true,
  },
  "brasil-bitcoin": {
    nome: "Brasil Bitcoin",
    regime: "nacional",
    cnpjBrasil: true,
  },
  pagcripto: {
    nome: "Pagcripto",
    regime: "nacional",
    cnpjBrasil: true,
  },
  nox: {
    nome: "Nox",
    regime: "nacional",
    cnpjBrasil: true,
  },
  "bitcoin-trade": {
    nome: "Bitcoin Trade",
    regime: "nacional",
    cnpjBrasil: true,
  },
  digitra: {
    nome: "Digitra",
    regime: "nacional",
    cnpjBrasil: true,
  },
  liqi: {
    nome: "Liqi",
    regime: "nacional",
    cnpjBrasil: true,
  },

  // ── Binance — caso especial ────────────────────────────────────────────────
  binance: {
    nome: "Binance",
    regime: "binance-ambigua",
    cnpjBrasil: false, // Binance Pay Brasil tem CNPJ, mas plataforma global não
  },

  // ── Estrangeiras (sem CNPJ no Brasil) ─────────────────────────────────────
  bybit: {
    nome: "Bybit",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  coinbase: {
    nome: "Coinbase",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  kraken: {
    nome: "Kraken",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  okx: {
    nome: "OKX",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  kucoin: {
    nome: "KuCoin",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  "gate-io": {
    nome: "Gate.io",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  mexc: {
    nome: "MEXC Global",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  bitget: {
    nome: "Bitget",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  bingx: {
    nome: "BingX",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  gemini: {
    nome: "Gemini",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  "htx-huobi": {
    nome: "HTX Huobi",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  nexo: {
    nome: "Nexo",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  deribit: {
    nome: "Deribit",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  poloniex: {
    nome: "Poloniex",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
  "outra-estrangeira": {
    nome: "Outra (sem CNPJ Brasil)",
    regime: "estrangeira",
    cnpjBrasil: false,
  },
};

/**
 * Detecta se o texto digitado pelo usuário corresponde à Binance.
 * Usado para acionar o modal de esclarecimento Brasil vs. Global.
 */
export function isBinance(nomeExchange: string): boolean {
  return nomeExchange.toLowerCase().trim().includes("binance");
}

/**
 * Tenta encontrar a exchange no catálogo a partir do nome digitado.
 * Retorna `undefined` se não reconhecer.
 */
export function encontrarExchange(nomeDigitado: string): ExchangeInfo | undefined {
  const nome = nomeDigitado.toLowerCase().trim();
  return Object.values(EXCHANGES).find((ex) =>
    ex.nome.toLowerCase().includes(nome) || nome.includes(ex.nome.toLowerCase())
  );
}
