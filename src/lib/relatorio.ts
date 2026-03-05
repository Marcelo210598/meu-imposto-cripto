import { Operacao, PortfolioCripto } from "./types";
import { calcularResumosMensais, calcularPortfolio } from "./calculadora";

export interface ItemBemDireito {
  cripto: string;
  codigoIRPF: string;  // "01" BTC, "02" ETH, "09" outros
  discriminacao: string;
  quantidade: number;
  custoAquisicao: number;
  custoAquisicaoAnoAnterior: number;
}

export interface GanhoCapitalMensal {
  mes: string;
  mesFormatado: string;
  totalVendas: number;
  custoAquisicao: number;
  ganhoCapital: number;
  impostoDevido: number;
  isento: boolean;
  operacoesVenda: Operacao[];
}

export interface RelatorioAnual {
  ano: number;
  bensDireitos: ItemBemDireito[];
  ganhosCapital: GanhoCapitalMensal[];
  totalVendas: number;
  totalGanhos: number;
  totalImposto: number;
  totalIsentos: number;
  mesesComImposto: number;
}

const CODIGOS_IRPF: Record<string, string> = {
  BTC: "01",
  ETH: "02",
  USDT: "03",
  USDC: "03",
  BNB: "09",
  SOL: "09",
  ADA: "09",
  DOT: "09",
  LINK: "09",
  AAVE: "09",
  UNI: "09",
  MATIC: "09",
  AVAX: "09",
  XRP: "09",
  DOGE: "09",
};

function getCodigo(cripto: string): string {
  return CODIGOS_IRPF[cripto.toUpperCase()] ?? "09";
}

function formatarMesLongo(mes: string): string {
  const [ano, mesNum] = mes.split("-");
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return `${meses[parseInt(mesNum) - 1]}/${ano}`;
}

/**
 * Calcula o portfolio até o dia 31/12 de um ano específico
 */
function calcularPortfolioAnoFim(operacoes: Operacao[], ano: number): PortfolioCripto[] {
  const limite = `${ano}-12-31`;
  const opsAteLimite = operacoes.filter((op) => op.data <= limite);
  return calcularPortfolio(opsAteLimite);
}

/**
 * Gera o relatório completo para um ano
 */
export function gerarRelatorioAnual(operacoes: Operacao[], ano: number): RelatorioAnual {
  const anoStr = ano.toString();
  const anoAnteriorStr = (ano - 1).toString();

  // Portfolio em 31/12 do ano declarado
  const portfolioAnoAtual = calcularPortfolioAnoFim(operacoes, ano);

  // Portfolio em 31/12 do ano anterior (situação anterior)
  const portfolioAnoAnterior = calcularPortfolioAnoFim(operacoes, ano - 1);
  const portfolioAnteriorMap = new Map(portfolioAnoAnterior.map((p) => [p.cripto, p]));

  // Bens e Direitos
  const bensDireitos: ItemBemDireito[] = portfolioAnoAtual.map((p) => {
    const anterior = portfolioAnteriorMap.get(p.cripto);
    return {
      cripto: p.cripto,
      codigoIRPF: getCodigo(p.cripto),
      discriminacao: `${p.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 8 })} unidades de ${p.cripto} (criptoativo)`,
      quantidade: p.quantidade,
      custoAquisicao: p.custoTotal,
      custoAquisicaoAnoAnterior: anterior?.custoTotal ?? 0,
    };
  });

  // Ganhos de capital — apenas operações do ano selecionado
  const resumosMensais = calcularResumosMensais(operacoes);
  const resumosAno = resumosMensais.filter((r) => r.mes.startsWith(anoStr));

  const ganhosCapital: GanhoCapitalMensal[] = resumosAno.map((r) => {
    const vendas = r.operacoes.filter((op) => op.tipo === "venda");
    return {
      mes: r.mes,
      mesFormatado: formatarMesLongo(r.mes),
      totalVendas: r.totalVendas,
      custoAquisicao: r.totalVendas - r.lucroTotal,
      ganhoCapital: Math.max(0, r.lucroTotal),
      impostoDevido: r.impostoDevido,
      isento: r.isento,
      operacoesVenda: vendas,
    };
  });

  const totalVendas = ganhosCapital.reduce((acc, g) => acc + g.totalVendas, 0);
  const totalGanhos = ganhosCapital.reduce((acc, g) => acc + g.ganhoCapital, 0);
  const totalImposto = ganhosCapital.reduce((acc, g) => acc + g.impostoDevido, 0);
  const totalIsentos = ganhosCapital
    .filter((g) => g.isento && g.totalVendas > 0)
    .reduce((acc, g) => acc + g.ganhoCapital, 0);
  const mesesComImposto = ganhosCapital.filter((g) => g.impostoDevido > 0).length;

  return {
    ano,
    bensDireitos,
    ganhosCapital,
    totalVendas,
    totalGanhos,
    totalImposto,
    totalIsentos,
    mesesComImposto,
  };
}

/**
 * Gera CSV de exportação das operações
 */
export function gerarCSVOperacoes(operacoes: Operacao[]): string {
  const header = "Data,Tipo,Criptomoeda,Quantidade,Valor Total (BRL),Preço Unitário (BRL),Exchange";
  const rows = [...operacoes]
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((op) =>
      [
        op.data,
        op.tipo === "compra" ? "Compra" : "Venda",
        op.cripto,
        op.quantidade.toString().replace(".", ","),
        op.valorTotal.toFixed(2).replace(".", ","),
        op.precoUnitario.toFixed(2).replace(".", ","),
        op.exchange ?? "",
      ].join(";")
    );

  return [header, ...rows].join("\n");
}

/**
 * Gera texto formatado para preenchimento do GCAP
 */
export function gerarTextoGCAP(relatorio: RelatorioAnual): string {
  const linhas: string[] = [
    `DADOS PARA PREENCHIMENTO NO GCAP ${relatorio.ano}`,
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
    `${"=".repeat(60)}`,
    "",
  ];

  const tributaveis = relatorio.ganhosCapital.filter((g) => !g.isento && g.totalVendas > 0);

  if (tributaveis.length === 0) {
    linhas.push("Nenhum ganho de capital tributável no ano.");
    return linhas.join("\n");
  }

  linhas.push("ALIENAÇÕES TRIBUTÁVEIS (preencher no GCAP)");
  linhas.push("-".repeat(60));

  for (const g of tributaveis) {
    const [ano, mes] = g.mes.split("-");
    const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();

    linhas.push(`\n${g.mesFormatado.toUpperCase()}`);
    linhas.push(`Data de alienação: ${ultimoDia}/${mes}/${ano}`);
    linhas.push(`Tipo de bem: Ativo virtual (Criptoativo) — Código 35`);
    linhas.push(`Valor de alienação: R$ ${g.totalVendas.toFixed(2).replace(".", ",")}`);
    linhas.push(`Custo de aquisição: R$ ${g.custoAquisicao.toFixed(2).replace(".", ",")}`);
    linhas.push(`Ganho de capital: R$ ${g.ganhoCapital.toFixed(2).replace(".", ",")}`);
    linhas.push(`Imposto (15%): R$ ${g.impostoDevido.toFixed(2).replace(".", ",")}`);
  }

  linhas.push(`\n${"=".repeat(60)}`);
  linhas.push(`TOTAIS ${relatorio.ano}`);
  linhas.push(`Total alienações: R$ ${relatorio.totalVendas.toFixed(2).replace(".", ",")}`);
  linhas.push(`Total ganho de capital: R$ ${relatorio.totalGanhos.toFixed(2).replace(".", ",")}`);
  linhas.push(`Total imposto devido: R$ ${relatorio.totalImposto.toFixed(2).replace(".", ",")}`);

  return linhas.join("\n");
}

/**
 * Retorna os anos que têm operações registradas
 */
export function extrairAnosComOperacoes(operacoes: Operacao[]): number[] {
  const anos = new Set(operacoes.map((op) => parseInt(op.data.substring(0, 4))));
  return Array.from(anos).sort((a, b) => b - a);
}
