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
 * Complexidade: O(n log n) — portfolio incremental, sem recálculo por mês.
 */
export function calcularResumosMensais(operacoes: Operacao[]): ResumoMensal[] {
  if (operacoes.length === 0) return [];

  // Agrupar por mês mantendo ordem de inserção
  const mesesMap = new Map<string, Operacao[]>();
  for (const op of operacoes) {
    const mes = op.data.substring(0, 7);
    const lista = mesesMap.get(mes);
    if (lista) lista.push(op);
    else mesesMap.set(mes, [op]);
  }

  const mesesOrdenados = Array.from(mesesMap.keys()).sort();

  // Portfolio incremental — atualizado mês a mês sem reprocessar histórico
  const portfolioMap = new Map<string, PortfolioCripto>();

  const resumos: ResumoMensal[] = [];

  for (const mes of mesesOrdenados) {
    const opsMes = mesesMap.get(mes)!;
    const compras = opsMes.filter((op) => op.tipo === "compra");
    const vendas  = opsMes.filter((op) => op.tipo === "venda");

    // 1. Aplica compras do mês ao portfolio (afeta custo médio das vendas do mesmo mês)
    for (const op of compras) {
      const atual = portfolioMap.get(op.cripto) ?? {
        cripto: op.cripto, quantidade: 0, precoMedio: 0, custoTotal: 0,
      };
      const novaQtd   = atual.quantidade + op.quantidade;
      const novoCusto = atual.custoTotal + op.valorTotal;
      portfolioMap.set(op.cripto, {
        cripto:      op.cripto,
        quantidade:  novaQtd,
        precoMedio:  novaQtd > 0 ? novoCusto / novaQtd : 0,
        custoTotal:  novoCusto,
      });
    }

    // 2. Calcula lucro das vendas com o portfolio atual
    const totalVendas  = vendas.reduce((acc, op) => acc + op.valorTotal, 0);
    const totalCompras = compras.reduce((acc, op) => acc + op.valorTotal, 0);
    let lucroTotal = 0;
    for (const venda of vendas) {
      lucroTotal += calcularLucroVenda(venda, portfolioMap);
    }

    // 3. Aplica vendas ao portfolio (reduz quantidades para os próximos meses)
    for (const op of vendas) {
      const atual = portfolioMap.get(op.cripto);
      if (!atual) continue;
      const novaQtd   = Math.max(0, atual.quantidade - op.quantidade);
      const novoCusto = Math.max(0, atual.custoTotal - op.quantidade * atual.precoMedio);
      portfolioMap.set(op.cripto, { ...atual, quantidade: novaQtd, custoTotal: novoCusto });
    }

    const isento = totalVendas <= LIMITE_ISENCAO_MENSAL;
    resumos.push({
      mes,
      totalVendas,
      totalCompras,
      lucroTotal,
      impostoDevido: isento ? 0 : calcularImposto(Math.max(0, lucroTotal)),
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
