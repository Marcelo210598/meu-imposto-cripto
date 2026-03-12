import {
  Operacao,
  PortfolioCripto,
  ResumoMensal,
  ResumoGeral,
  DadosGrafico,
  ALIQUOTAS_IR,
  LIMITE_ISENCAO_MENSAL,
} from "./types";

/**
 * Calcula o preço médio de aquisição para cada criptomoeda
 */
export function calcularPortfolio(operacoes: Operacao[]): PortfolioCripto[] {
  const portfolio: Map<string, PortfolioCripto> = new Map();

  // Ordenar operações por data
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
      // Compra: atualiza preço médio
      const novaQuantidade = atual.quantidade + op.quantidade;
      const novoCustoTotal = atual.custoTotal + op.valorTotal;
      const novoPrecoMedio = novaQuantidade > 0 ? novoCustoTotal / novaQuantidade : 0;

      portfolio.set(op.cripto, {
        cripto: op.cripto,
        quantidade: novaQuantidade,
        precoMedio: novoPrecoMedio,
        custoTotal: novoCustoTotal,
      });
    } else {
      // Venda: reduz quantidade e custo proporcional
      const novaQuantidade = Math.max(0, atual.quantidade - op.quantidade);
      const custoVendido = op.quantidade * atual.precoMedio;
      const novoCustoTotal = Math.max(0, atual.custoTotal - custoVendido);

      portfolio.set(op.cripto, {
        cripto: op.cripto,
        quantidade: novaQuantidade,
        precoMedio: atual.precoMedio, // Mantém o mesmo preço médio
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
  if (!cripto) return venda.valorTotal; // Se não tem custo, todo valor é lucro

  const custoAquisicao = venda.quantidade * cripto.precoMedio;
  return venda.valorTotal - custoAquisicao;
}

/**
 * Calcula o imposto devido baseado no ganho de capital
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
 * Agrupa operações por mês e calcula resumo mensal.
 * Implementa:
 * - Compensação de prejuízo entre meses (carryforward anual)
 * - Detecção de day trade (compra e venda do mesmo ativo no mesmo dia)
 * - Day trade: alíquota 20% flat, sem isenção de R$35k
 * - Operações regulares: isenção R$35k, alíquotas progressivas 15-22,5%
 */
export function calcularResumosMensais(operacoes: Operacao[]): ResumoMensal[] {
  if (operacoes.length === 0) return [];

  // Agrupar por mês
  const mesesMap = new Map<string, Operacao[]>();
  for (const op of operacoes) {
    const mes = op.data.substring(0, 7);
    const lista = mesesMap.get(mes);
    if (lista) lista.push(op);
    else mesesMap.set(mes, [op]);
  }

  const mesesOrdenados = Array.from(mesesMap.keys()).sort();

  // Portfolio incremental
  const portfolioMap = new Map<string, PortfolioCripto>();
  const resumos: ResumoMensal[] = [];

  // Carryforward de prejuízo (separado por tipo: regular e day trade)
  let prejuizoRegularAcumulado = 0;
  let prejuizoDayTradeAcumulado = 0;

  // Reset anual do carryforward (RFB permite compensar só dentro do mesmo ano)
  let anoAnterior = "";

  for (const mes of mesesOrdenados) {
    const anoAtual = mes.substring(0, 4);
    if (anoAtual !== anoAnterior) {
      // Virada de ano: zera carryforward (não pode levar pra próximo ano)
      prejuizoRegularAcumulado = 0;
      prejuizoDayTradeAcumulado = 0;
      anoAnterior = anoAtual;
    }

    const opsMes = mesesMap.get(mes)!;
    const compras = opsMes.filter((op) => op.tipo === "compra");
    const vendas  = opsMes.filter((op) => op.tipo === "venda");

    // 1. Detectar day trades: mesmo cripto com compra E venda na mesma data
    const dayTradeKeys = new Set<string>(); // "cripto|data"
    for (const compra of compras) {
      for (const venda of vendas) {
        if (compra.cripto === venda.cripto && compra.data === venda.data) {
          dayTradeKeys.add(`${venda.cripto}|${venda.data}`);
        }
      }
    }
    const temDayTrade = dayTradeKeys.size > 0;

    // 2. Aplica compras ao portfolio
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

    // 3. Separa vendas em day trade e regulares, calcula lucros
    const vendasDayTrade  = vendas.filter((v) => dayTradeKeys.has(`${v.cripto}|${v.data}`));
    const vendasRegulares = vendas.filter((v) => !dayTradeKeys.has(`${v.cripto}|${v.data}`));

    let lucroRegular   = 0;
    let lucroDayTrade  = 0;
    for (const v of vendasRegulares) lucroRegular  += calcularLucroVenda(v, portfolioMap);
    for (const v of vendasDayTrade)  lucroDayTrade += calcularLucroVenda(v, portfolioMap);

    // 4. Aplica vendas ao portfolio
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

    // 5. Imposto sobre operações regulares (com isenção R$35k e carryforward)
    let impostoRegular     = 0;
    let prejuizoCompensado = 0;
    const isentoRegular    = totalVendasRegulares <= LIMITE_ISENCAO_MENSAL;

    if (!isentoRegular && lucroRegular > 0) {
      const compensacao = Math.min(lucroRegular, prejuizoRegularAcumulado);
      prejuizoCompensado = compensacao;
      prejuizoRegularAcumulado -= compensacao;
      impostoRegular = calcularImposto(lucroRegular - compensacao);
    } else if (lucroRegular < 0) {
      // Acumula prejuízo para compensar em meses futuros do mesmo ano
      prejuizoRegularAcumulado += Math.abs(lucroRegular);
    }

    // 6. Imposto sobre day trade: 20% flat, sem isenção, sem carryforward de regular
    let impostoDayTrade = 0;
    if (lucroDayTrade > 0) {
      const compensacaoDT = Math.min(lucroDayTrade, prejuizoDayTradeAcumulado);
      prejuizoDayTradeAcumulado -= compensacaoDT;
      impostoDayTrade = (lucroDayTrade - compensacaoDT) * 0.20;
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
 * Calcula o resumo geral de todas as operações
 */
export function calcularResumoGeral(operacoes: Operacao[]): ResumoGeral {
  const portfolio = calcularPortfolio(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);

  const totalVendas = resumosMensais.reduce((acc, r) => acc + r.totalVendas, 0);
  const totalCompras = resumosMensais.reduce((acc, r) => acc + r.totalCompras, 0);
  const lucroAcumulado = resumosMensais.reduce((acc, r) => acc + r.lucroTotal, 0);
  const impostoTotalDevido = resumosMensais.reduce(
    (acc, r) => acc + r.impostoDevido,
    0
  );

  return {
    totalOperacoes: operacoes.length,
    totalVendas,
    totalCompras,
    lucroAcumulado,
    impostoTotalDevido,
    portfolio,
  };
}

/**
 * Gera dados para gráficos
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
