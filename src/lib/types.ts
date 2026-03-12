export interface Operacao {
  id: string;
  tipo: "compra" | "venda";
  cripto: string;
  quantidade: number;
  valorTotal: number;
  precoUnitario: number;
  data: string;
  exchange?: string;
  tipoExchange?: "nacional" | "estrangeira"; // regime tributário
}

export interface PortfolioCripto {
  cripto: string;
  quantidade: number;
  precoMedio: number;
  custoTotal: number;
}

export interface ResumoMensal {
  mes: string; // formato: "2024-01"
  totalVendas: number;
  totalCompras: number;
  lucroTotal: number;
  lucroRegular: number;       // ganho de operações swing/hold
  lucroDayTrade: number;      // ganho de day trade — tabela progressiva (igual swing trade)
  temDayTrade: boolean;       // mês contém day trade → sem isenção R$35k
  prejuizoCompensado: number; // valor de perdas anteriores compensadas neste mês
  prejuizoAcumuladoRestante: number; // perdas restantes a carregar pro próximo mês
  impostoDevido: number;
  isento: boolean;
  operacoes: Operacao[];
}

/**
 * Resumo anual para operações em exchanges ESTRANGEIRAS.
 * Base legal: Lei 14.754/2023 + IN RFB 2.180/2024
 * - Sem isenção de R$ 35.000
 * - Alíquota fixa de 15% sobre lucro líquido anual
 * - Compensação de perdas: apenas dentro do mesmo ano, exterior com exterior
 * - Pagamento via Declaração de Ajuste Anual (não DARF mensal)
 */
export interface ResumoAnualExterior {
  ano: string; // "2024"
  totalVendas: number;
  lucroLiquidoAnual: number;       // após compensação de prejuízos do mesmo ano
  prejuizoAcumuladoRestante: number; // perdas não compensadas (não podem ir ao próximo ano)
  impostoEstimado: number;          // 15% sobre lucroLiquidoAnual (se positivo)
  operacoes: Operacao[];
}

export interface ResumoGeral {
  totalOperacoes: number;
  totalVendas: number;
  totalCompras: number;
  lucroAcumulado: number;
  impostoTotalDevido: number;     // soma dos impostos mensais (regime nacional)
  impostoTotalExterior: number;   // soma dos impostos anuais (regime exterior)
  portfolio: PortfolioCripto[];
  resumosAnuaisExterior: ResumoAnualExterior[];
}

export interface DadosGrafico {
  mes: string;
  vendas: number;
  compras: number;
  lucro: number;
  imposto: number;
}

/**
 * Alíquotas de IR sobre ganho de capital (Brasil).
 * Aplicáveis tanto ao swing trade quanto ao day trade de criptoativos.
 * Day trade de cripto NÃO é 20% fixo — usa a mesma tabela progressiva.
 * (A alíquota de 20% fixo é exclusiva de day trade na bolsa de valores.)
 */
export const ALIQUOTAS_IR = [
  { limite: 5_000_000,  aliquota: 0.15  }, // Até R$ 5 milhões: 15%
  { limite: 10_000_000, aliquota: 0.175 }, // R$ 5M a 10M: 17,5%
  { limite: 30_000_000, aliquota: 0.20  }, // R$ 10M a 30M: 20%
  { limite: Infinity,   aliquota: 0.225 }, // Acima de R$ 30M: 22,5%
];

/** Limite de isenção mensal — aplica-se APENAS ao regime nacional */
export const LIMITE_ISENCAO_MENSAL = 35_000; // R$ 35.000

/** Alíquota fixa do regime exterior (Lei 14.754/2023 + IN RFB 2.180/2024) */
export const ALIQUOTA_EXTERIOR = 0.15; // 15% sobre lucro líquido anual

/**
 * Limite mensal de movimentações em exchanges estrangeiras acima do qual
 * o usuário deve reportar via e-CAC no mês seguinte.
 */
export const LIMITE_REPORTE_EXTERIOR = 30_000; // R$ 30.000/mês

/** Exchanges com CNPJ registrado no Brasil — regime nacional */
export const EXCHANGES_NACIONAIS: string[] = [
  "Mercado Bitcoin",
  "Foxbit",
  "NovaDAX",
  "Novadax",
  "Coinext",
  "BitPreço",
  "Bitpreco",
  "FlowBTC",
  "Ripio",
  "BityBank",
  "Mynt BTG",
  "Mynt",
  "BitNuvem",
  "Brasil Bitcoin",
  "Pagcripto",
  "Nox",
  "Bitcoin Trade",
  "Digitra",
  "Liqi",
];

/**
 * Exchanges sem CNPJ no Brasil — regime exterior (Lei 14.754/2023).
 * Binance: possui entidade BR (Binance Pay Brasil) e plataforma global.
 * Sem o campo tipoExchange explícito, tratamos como estrangeira.
 */
export const EXCHANGES_ESTRANGEIRAS: string[] = [
  "Binance",
  "Bybit",
  "Coinbase",
  "Kraken",
  "OKX",
  "KuCoin",
  "Gate.io",
  "MEXC",
  "Bitget",
  "BingX",
  "Gemini",
  "HTX",
  "Huobi",
  "Nexo",
  "Deribit",
  "Poloniex",
];

/**
 * Infere o regime tributário a partir do campo tipoExchange (prioridade)
 * ou do nome da exchange. Default: "nacional" (conservador).
 *
 * Binance: sem campo explícito → assume "estrangeira" (plataforma global).
 * O usuário pode sobrescrever com tipoExchange = "nacional" se usou Binance Pay Brasil.
 */
export function inferirRegime(
  exchange?: string,
  tipoExchange?: "nacional" | "estrangeira"
): "nacional" | "estrangeira" {
  if (tipoExchange) return tipoExchange;
  if (!exchange) return "nacional";

  const nome = exchange.toLowerCase().trim();

  if (nome.includes("binance")) return "estrangeira";

  const ehEstrangeira = EXCHANGES_ESTRANGEIRAS.some((e) =>
    nome.includes(e.toLowerCase())
  );

  return ehEstrangeira ? "estrangeira" : "nacional";
}
