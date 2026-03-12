/**
 * Utilitários de cálculo para o Regime Exterior de criptoativos.
 *
 * Aplica-se a operações em exchanges SEM CNPJ no Brasil:
 * Binance (global), Bybit, Coinbase, Kraken, OKX, KuCoin, etc.
 *
 * Base legal: Lei 14.754/2023 + IN RFB 2.180/2024
 */

/** Alíquota fixa sobre lucro líquido anual — regime exterior */
export const ALIQUOTA_EXTERIOR = 0.15; // 15%

/** Não há isenção no regime exterior (diferente do nacional com R$35k) */
export const ISENCAO_EXTERIOR = 0;

/**
 * Limite mensal de movimentações em exchanges estrangeiras acima do qual
 * o contribuinte deve reportar via e-CAC no mês seguinte.
 * (IN 1.888/2019)
 */
export const THRESHOLD_REPORTE_ECAC = 30_000; // R$ 30.000/mês

/** URL do portal e-CAC da Receita Federal para reporte */
export const URL_ECAC = "https://cav.receita.fazenda.gov.br";

export interface ResultadoImpostoExterior {
  aliquota: number;   // 0.15 (fixo)
  imposto: number;    // 0 se lucro ≤ 0
  observacao: string; // texto informativo sobre pagamento
}

/**
 * Calcula o imposto estimado do regime exterior para um ano.
 *
 * Regras:
 * - Sem isenção (R$35k não se aplica)
 * - 15% fixo sobre o lucro líquido anual
 * - Pagamento via Declaração de Ajuste Anual (não DARF mensal)
 * - Prejuízos do mesmo ano compensam ganhos (exterior com exterior)
 * - Prejuízos NÃO podem ser carregados para o ano seguinte
 *
 * @param lucroLiquidoAnual Lucro líquido do ano (após compensação de prejuízos do mesmo ano)
 */
export function calcularImpostoExterior(params: {
  lucroLiquidoAnual: number;
}): ResultadoImpostoExterior {
  const { lucroLiquidoAnual } = params;

  if (lucroLiquidoAnual <= 0) {
    return {
      aliquota: ALIQUOTA_EXTERIOR,
      imposto: 0,
      observacao: "Sem lucro tributável no período.",
    };
  }

  return {
    aliquota: ALIQUOTA_EXTERIOR,
    imposto: lucroLiquidoAnual * ALIQUOTA_EXTERIOR,
    observacao:
      "Pago na Declaração de Ajuste Anual (IRPF). Não gera DARF mensal.",
  };
}

/**
 * Verifica se o total movimentado no mês em exchanges estrangeiras
 * supera o limite que obriga o reporte via e-CAC (IN 1.888/2019).
 *
 * @param totalMovimentadoMes Soma de compras + vendas no mês em exchanges estrangeiras
 */
export function precisaReportarECAC(totalMovimentadoMes: number): boolean {
  return totalMovimentadoMes > THRESHOLD_REPORTE_ECAC;
}

/**
 * Formata o texto de alerta para reporte e-CAC.
 * @param totalVendido Valor vendido no mês em exchanges estrangeiras
 * @param mes Mês no formato "YYYY-MM"
 */
export function textoAlertaECAC(totalVendido: number, mes: string): string {
  const [ano, mesNum] = mes.split("-");
  const nomesMes = [
    "janeiro","fevereiro","março","abril","maio","junho",
    "julho","agosto","setembro","outubro","novembro","dezembro",
  ];
  const nomeMes = nomesMes[parseInt(mesNum) - 1];
  const r = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalVendido);
  return `Você movimentou ${r} em exchanges estrangeiras em ${nomeMes}/${ano}. Como esse valor supera R$ 30.000, você é obrigado a reportar essas operações via e-CAC até o último dia útil do próximo mês (IN 1.888/2019).`;
}
