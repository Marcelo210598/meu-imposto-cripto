import {
  Operacao,
  PortfolioCripto,
  ResumoMensal,
  ResumoAnualExterior,
  ResumoGeral,
  DadosGrafico,
  ALIQUOTAS_IR,
  ALIQUOTA_EXTERIOR,
  LIMITE_ISENCAO_MENSAL,
  inferirRegime,
} from "./types";

/**
 * Calcula o preço médio de aquisição para cada criptomoeda
 */
export function calcularPortfolio(operacoes: Operacao[]): PortfolioCripto[] {
  const portfolio: Map<string, PortfolioCripto> = new Map();

  const operacoesOrdenadas = [...operacoes].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  for (const op of operacoesOrdenadas) {
    const atual = portfolio.get(op.cripto) || {
      cripto: op.cripto,
      quantidade: 0,
      precoMedio: 0,
      custoTotal: 0,
    };

    if (op.tipo === "compra") {
      const novaQuantidade = atual.quantidade + op.quantidade;
      const novoCustoTotal = atual.custoTotal + op.valorTotal;
      portfolio.set(op.cripto, {
        cripto: op.cripto,
        quantidade: novaQuantidade,
        precoMedio: novaQuantidade > 0 ? novoCustoTotal / novaQuantidade : 0,
        custoTotal: novoCustoTotal,
      });
    } else {
      const novaQuantidade = Math.max(0, atual.quantidade - op.quantidade);
      const custoVendido = op.quantidade * atual.precoMedio;
      const novoCustoTotal = Math.max(0, atual.custoTotal - custoVendido);
      portfolio.set(op.cripto, {
        cripto: op.cripto,
        quantidade: novaQuantidade,
        precoMedio: atual.precoMedio,
        custoTotal: novoCustoTotal,
      });
    }
  }

  return Array.from(portfolio.values()).filter((p) => p.quantidade > 0);
}

/**
 * Calcula o lucro/prejuízo de uma venda baseado no preço médio
 */
export function calcularLucroVenda(
  venda: Operacao,
  portfolio: Map<string, PortfolioCripto>
): number {
  const cripto = portfolio.get(venda.cripto);
  if (!cripto) return venda.valorTotal;

  const custoAquisicao = venda.quantidade * cripto.precoMedio;
  return venda.valorTotal - custoAquisicao;
}

/**
 * Calcula o imposto progressivo sobre ganho de capital.
 * Aplica-se ao regime nacional (swing trade e day trade de cripto).
 */
export function calcularImposto(ganho: number): number {
  if (ganho <= 0) return 0;

  let impostoTotal = 0;
  let ganhoRestante = ganho;
  let limiteAnterior = 0;

  for (const faixa of ALIQUOTAS_IR) {
    const ganhoNaFaixa = Math.min(ganhoRestante, faixa.limite - limiteAnterior);
    if (ganhoNaFaixa <= 0) break;

    impostoTotal += ganhoNaFaixa * faixa.aliquota;
    ganhoRestante -= ganhoNaFaixa;
    limiteAnterior = faixa.limite;
  }

  return impostoTotal;
}

/**
 * Agrupa operações do REGIME NACIONAL por mês e calcula o resumo mensal.
 *
 * Regime nacional = exchanges com CNPJ no Brasil (Mercado Bitcoin, Foxbit, etc.)
 *
 * Regras aplicadas:
 * - Swing trade: isenção R$35k/mês, alíquotas progressivas 15-22,5%
 * - Day trade: SEM isenção, MESMA tabela progressiva (não é 20% fixo — ver nota)
 *   → A alíquota de 20% fixo aplica-se a day trade na BOLSA DE VALORES, não a cripto.
 * - Compensação de prejuízo: intra-anual, com reset em 31/12
 * - Prejuízos de day trade e swing trade são compensados separadamente
 */
export function calcularResumosMensais(operacoes: Operacao[]): ResumoMensal[] {
  // Apenas operações do regime nacional
  const nacionais = operacoes.filter(
    (op) => inferirRegime(op.exchange, op.tipoExchange) === "nacional"
  );

  if (nacionais.length === 0) return [];

  const mesesMap = new Map<string, Operacao[]>();
  for (const op of nacionais) {
    const mes = op.data.substring(0, 7);
    const lista = mesesMap.get(mes);
    if (lista) lista.push(op);
    else mesesMap.set(mes, [op]);
  }

  const mesesOrdenados = Array.from(mesesMap.keys()).sort();

  const portfolioMap = new Map<string, PortfolioCripto>();
  const resumos: ResumoMensal[] = [];

  let prejuizoRegularAcumulado = 0;
  let prejuizoDayTradeAcumulado = 0;
  let anoAnterior = "";

  for (const mes of mesesOrdenados) {
    const anoAtual = mes.substring(0, 4);
    if (anoAtual !== anoAnterior) {
      // Virada de ano: RFB não permite carregar prejuízo para o ano seguinte
      prejuizoRegularAcumulado = 0;
      prejuizoDayTradeAcumulado = 0;
      anoAnterior = anoAtual;
    }

    const opsMes = mesesMap.get(mes)!;
    const compras = opsMes.filter((op) => op.tipo === "compra");
    const vendas  = opsMes.filter((op) => op.tipo === "venda");

    // Detectar day trades: mesmo cripto com compra E venda na mesma data
    const dayTradeKeys = new Set<string>(); // "cripto|data"
    for (const compra of compras) {
      for (const venda of vendas) {
        if (compra.cripto === venda.cripto && compra.data === venda.data) {
          dayTradeKeys.add(`${venda.cripto}|${venda.data}`);
        }
      }
    }
    const temDayTrade = dayTradeKeys.size > 0;

    // Aplica compras ao portfolio
    for (const op of compras) {
      const atual = portfolioMap.get(op.cripto) ?? {
        cripto: op.cripto, quantidade: 0, precoMedio: 0, custoTotal: 0,
      };
      const novaQtd   = atual.quantidade + op.quantidade;
      const novoCusto = atual.custoTotal + op.valorTotal;
      portfolioMap.set(op.cripto, {
        cripto:     op.cripto,
        quantidade: novaQtd,
        precoMedio: novaQtd > 0 ? novoCusto / novaQtd : 0,
        custoTotal: novoCusto,
      });
    }

    // Separa vendas em day trade e regulares
    const vendasDayTrade  = vendas.filter((v) => dayTradeKeys.has(`${v.cripto}|${v.data}`));
    const vendasRegulares = vendas.filter((v) => !dayTradeKeys.has(`${v.cripto}|${v.data}`));

    let lucroRegular  = 0;
    let lucroDayTrade = 0;
    for (const v of vendasRegulares) lucroRegular  += calcularLucroVenda(v, portfolioMap);
    for (const v of vendasDayTrade)  lucroDayTrade += calcularLucroVenda(v, portfolioMap);

    // Aplica vendas ao portfolio
    for (const op of vendas) {
      const atual = portfolioMap.get(op.cripto);
      if (!atual) continue;
      const novaQtd   = Math.max(0, atual.quantidade - op.quantidade);
      const novoCusto = Math.max(0, atual.custoTotal - op.quantidade * atual.precoMedio);
      portfolioMap.set(op.cripto, { ...atual, quantidade: novaQtd, custoTotal: novoCusto });
    }

    const totalVendas          = vendas.reduce((acc, op) => acc + op.valorTotal, 0);
    const totalCompras         = compras.reduce((acc, op) => acc + op.valorTotal, 0);
    const totalVendasRegulares = vendasRegulares.reduce((acc, op) => acc + op.valorTotal, 0);

    // Imposto sobre operações regulares (swing trade)
    let impostoRegular     = 0;
    let prejuizoCompensado = 0;
    const isentoRegular    = totalVendasRegulares <= LIMITE_ISENCAO_MENSAL;

    if (!isentoRegular && lucroRegular > 0) {
      const compensacao = Math.min(lucroRegular, prejuizoRegularAcumulado);
      prejuizoCompensado = compensacao;
      prejuizoRegularAcumulado -= compensacao;
      impostoRegular = calcularImposto(lucroRegular - compensacao);
    } else if (lucroRegular < 0) {
      prejuizoRegularAcumulado += Math.abs(lucroRegular);
    }

    // Imposto sobre day trade de cripto: tabela progressiva (IGUAL ao swing trade)
    // Sem isenção de R$35k. NÃO é 20% fixo (que é regra da bolsa de valores, não cripto).
    let impostoDayTrade = 0;
    if (lucroDayTrade > 0) {
      const compensacaoDT = Math.min(lucroDayTrade, prejuizoDayTradeAcumulado);
      prejuizoDayTradeAcumulado -= compensacaoDT;
      impostoDayTrade = calcularImposto(lucroDayTrade - compensacaoDT);
    } else if (lucroDayTrade < 0) {
      prejuizoDayTradeAcumulado += Math.abs(lucroDayTrade);
    }

    const impostoDevido = impostoRegular + impostoDayTrade;
    const isento        = impostoDevido === 0;
    const lucroTotal    = lucroRegular + lucroDayTrade;

    resumos.push({
      mes,
      totalVendas,
      totalCompras,
      lucroTotal,
      lucroRegular,
      lucroDayTrade,
      temDayTrade,
      prejuizoCompensado,
      prejuizoAcumuladoRestante: prejuizoRegularAcumulado,
      impostoDevido,
      isento,
      operacoes: opsMes,
    });
  }

  return resumos;
}

/**
 * Calcula resumos anuais para operações em exchanges ESTRANGEIRAS.
 *
 * Base legal: Lei 14.754/2023 + IN RFB 2.180/2024
 *
 * Regras aplicadas:
 * - Sem isenção de R$ 35.000
 * - Alíquota FIXA de 15% sobre lucro líquido anual
 * - Compensação de perdas: dentro do mesmo ano, exterior com exterior
 * - Prejuízos NÃO podem ser carregados para o ano seguinte
 * - Pagamento via Declaração de Ajuste Anual (não DARF mensal)
 */
export function calcularResumosAnuaisExterior(operacoes: Operacao[]): ResumoAnualExterior[] {
  const estrangeiras = operacoes.filter(
    (op) => inferirRegime(op.exchange, op.tipoExchange) === "estrangeira"
  );

  if (estrangeiras.length === 0) return [];

  const anosMap = new Map<string, Operacao[]>();
  for (const op of estrangeiras) {
    const ano = op.data.substring(0, 4);
    const lista = anosMap.get(ano);
    if (lista) lista.push(op);
    else anosMap.set(ano, [op]);
  }

  const anosOrdenados = Array.from(anosMap.keys()).sort();

  // Portfolio persiste entre anos (custo médio acumulado)
  const portfolioMap = new Map<string, PortfolioCripto>();
  const resumos: ResumoAnualExterior[] = [];

  for (const ano of anosOrdenados) {
    const opsAno  = anosMap.get(ano)!;
    const compras = opsAno.filter((op) => op.tipo === "compra");
    const vendas  = opsAno.filter((op) => op.tipo === "venda");

    // Aplica compras ao portfolio
    for (const op of compras) {
      const atual = portfolioMap.get(op.cripto) ?? {
        cripto: op.cripto, quantidade: 0, precoMedio: 0, custoTotal: 0,
      };
      const novaQtd   = atual.quantidade + op.quantidade;
      const novoCusto = atual.custoTotal + op.valorTotal;
      portfolioMap.set(op.cripto, {
        cripto:     op.cripto,
        quantidade: novaQtd,
        precoMedio: novaQtd > 0 ? novoCusto / novaQtd : 0,
        custoTotal: novoCusto,
      });
    }

    // Calcula lucro/prejuízo das vendas do ano
    let lucroAnual = 0;
    for (const v of vendas) {
      lucroAnual += calcularLucroVenda(v, portfolioMap);
    }

    // Aplica vendas ao portfolio
    for (const op of vendas) {
      const atual = portfolioMap.get(op.cripto);
      if (!atual) continue;
      const novaQtd   = Math.max(0, atual.quantidade - op.quantidade);
      const novoCusto = Math.max(0, atual.custoTotal - op.quantidade * atual.precoMedio);
      portfolioMap.set(op.cripto, { ...atual, quantidade: novaQtd, custoTotal: novoCusto });
    }

    const totalVendas = vendas.reduce((acc, op) => acc + op.valorTotal, 0);

    // Prejuízos compensam ganhos no mesmo ano — mas NÃO são carregados para o próximo
    const lucroLiquidoAnual        = Math.max(0, lucroAnual);
    const prejuizoAcumuladoRestante = lucroAnual < 0 ? Math.abs(lucroAnual) : 0;
    const impostoEstimado          = lucroLiquidoAnual > 0
      ? lucroLiquidoAnual * ALIQUOTA_EXTERIOR
      : 0;

    resumos.push({
      ano,
      totalVendas,
      lucroLiquidoAnual,
      prejuizoAcumuladoRestante,
      impostoEstimado,
      operacoes: opsAno,
    });
  }

  return resumos;
}

/**
 * Calcula o resumo geral de todas as operações (ambos os regimes).
 */
export function calcularResumoGeral(operacoes: Operacao[]): ResumoGeral {
  const portfolio              = calcularPortfolio(operacoes);
  const resumosMensais         = calcularResumosMensais(operacoes);
  const resumosAnuaisExterior  = calcularResumosAnuaisExterior(operacoes);

  const totalVendas  = operacoes.filter((op) => op.tipo === "venda").reduce((acc, op) => acc + op.valorTotal, 0);
  const totalCompras = operacoes.filter((op) => op.tipo === "compra").reduce((acc, op) => acc + op.valorTotal, 0);

  const lucroNacional = resumosMensais.reduce((acc, r) => acc + r.lucroTotal, 0);
  const lucroExterior = resumosAnuaisExterior.reduce((acc, r) => acc + r.lucroLiquidoAnual, 0);

  const impostoTotalDevido   = resumosMensais.reduce((acc, r) => acc + r.impostoDevido, 0);
  const impostoTotalExterior = resumosAnuaisExterior.reduce((acc, r) => acc + r.impostoEstimado, 0);

  return {
    totalOperacoes: operacoes.length,
    totalVendas,
    totalCompras,
    lucroAcumulado: lucroNacional + lucroExterior,
    impostoTotalDevido,
    impostoTotalExterior,
    portfolio,
    resumosAnuaisExterior,
  };
}

/**
 * Gera dados para gráficos (apenas regime nacional — apuração mensal)
 */
export function gerarDadosGrafico(operacoes: Operacao[]): DadosGrafico[] {
  const resumos = calcularResumosMensais(operacoes);

  return resumos.map((r) => ({
    mes: formatarMes(r.mes),
    vendas: r.totalVendas,
    compras: r.totalCompras,
    lucro: r.lucroTotal,
    imposto: r.impostoDevido,
  }));
}

function formatarMes(mes: string): string {
  const [ano, mesNum] = mes.split("-");
  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`;
}
