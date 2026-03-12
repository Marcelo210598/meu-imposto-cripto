/**
 * Utilitários de cálculo para o Regime Nacional de criptoativos.
 *
 * Aplica-se a operações em exchanges com CNPJ no Brasil:
 * Mercado Bitcoin, Foxbit, NovaDAX, Coinext, BitPreço, FlowBTC, etc.
 *
 * Base legal: Lei 13.259/2016 + IN RFB 1.888/2019
 */

/** Limite de isenção mensal — vendas até este valor são isentas de IR */
export const ISENCAO_MENSAL = 35_000; // R$ 35.000

/** Faixas da tabela progressiva de ganho de capital */
export const FAIXAS_NACIONAIS = [
  { limite: 5_000_000,  aliquota: 0.15  },
  { limite: 10_000_000, aliquota: 0.175 },
  { limite: 30_000_000, aliquota: 0.20  },
  { limite: Infinity,   aliquota: 0.225 },
] as const;

export interface ResultadoImpostoNacional {
  aliquota: number;      // alíquota efetiva (0 se isento)
  imposto: number;       // valor a recolher via DARF 4600
  isento: boolean;       // true se vendas ≤ R$35k (swing) ou lucro ≤ 0
  codigoDARF: "4600";
}

/**
 * Calcula o imposto do regime nacional para um mês.
 *
 * Regras:
 * - Swing trade com vendas ≤ R$35k → isento
 * - Day trade de cripto: SEM isenção, mesma tabela progressiva do swing
 *   (≠ 20% fixo, que é regra da bolsa de valores)
 * - Lucro ≤ 0 → sem imposto
 * - Tabela progressiva aplicada sobre o ganho líquido
 *
 * @param totalVendasMes  Total bruto vendido no mês (para verificar isenção swing)
 * @param lucroMes        Lucro líquido do mês (após custo médio)
 * @param tipoOperacao    "swing" ou "daytrade"
 */
export function calcularImpostoNacional(params: {
  totalVendasMes: number;
  lucroMes: number;
  tipoOperacao: "swing" | "daytrade";
}): ResultadoImpostoNacional {
  const { totalVendasMes, lucroMes, tipoOperacao } = params;

  // Swing trade: isenção quando vendas ≤ R$35k no mês
  if (tipoOperacao === "swing" && totalVendasMes <= ISENCAO_MENSAL) {
    return { aliquota: 0, imposto: 0, isento: true, codigoDARF: "4600" };
  }

  if (lucroMes <= 0) {
    return { aliquota: 0, imposto: 0, isento: false, codigoDARF: "4600" };
  }

  // Cálculo progressivo correto (não flat rate)
  let impostoTotal = 0;
  let ganhoRestante = lucroMes;
  let limiteAnterior = 0;
  let aliquotaEfetiva = 0.15;

  for (const faixa of FAIXAS_NACIONAIS) {
    const ganhoNaFaixa = Math.min(ganhoRestante, faixa.limite - limiteAnterior);
    if (ganhoNaFaixa <= 0) break;
    impostoTotal += ganhoNaFaixa * faixa.aliquota;
    aliquotaEfetiva = faixa.aliquota;
    ganhoRestante -= ganhoNaFaixa;
    limiteAnterior = faixa.limite;
  }

  return {
    aliquota: aliquotaEfetiva,
    imposto: impostoTotal,
    isento: false,
    codigoDARF: "4600",
  };
}
