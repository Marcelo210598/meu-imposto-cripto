import {
  calcularPortfolio,
  calcularImposto,
  calcularResumosMensais,
  calcularResumoGeral,
} from "@/lib/calculadora";
import { Operacao } from "@/lib/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function op(
  tipo: "compra" | "venda",
  cripto: string,
  quantidade: number,
  valorTotal: number,
  data: string
): Operacao {
  return {
    id: `test-${Math.random()}`,
    tipo,
    cripto,
    quantidade,
    valorTotal,
    precoUnitario: valorTotal / quantidade,
    data,
  };
}

// ─── calcularPortfolio ────────────────────────────────────────────────────────

describe("calcularPortfolio", () => {
  it("retorna vazio para lista vazia", () => {
    expect(calcularPortfolio([])).toEqual([]);
  });

  it("calcula preço médio de compras simples", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("compra", "BTC", 1, 200_000, "2024-02-01"),
    ];
    const portfolio = calcularPortfolio(ops);
    expect(portfolio).toHaveLength(1);
    expect(portfolio[0].cripto).toBe("BTC");
    expect(portfolio[0].quantidade).toBe(2);
    expect(portfolio[0].precoMedio).toBeCloseTo(150_000);
  });

  it("atualiza preço médio de forma ponderada", () => {
    // 2 BTC a R$100k + 1 BTC a R$130k → médio = (200k + 130k) / 3 ≈ 110k
    const ops = [
      op("compra", "BTC", 2, 200_000, "2024-01-01"),
      op("compra", "BTC", 1, 130_000, "2024-02-01"),
    ];
    const portfolio = calcularPortfolio(ops);
    expect(portfolio[0].precoMedio).toBeCloseTo(110_000);
  });

  it("mantém preço médio após venda parcial", () => {
    const ops = [
      op("compra", "BTC", 2, 200_000, "2024-01-01"), // médio = R$100k
      op("venda", "BTC", 1, 130_000, "2024-02-01"),  // vende 1 BTC
    ];
    const portfolio = calcularPortfolio(ops);
    expect(portfolio[0].quantidade).toBe(1);
    expect(portfolio[0].precoMedio).toBeCloseTo(100_000); // mantido
  });

  it("remove ativo quando quantidade chega a zero", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("venda", "BTC", 1, 120_000, "2024-02-01"),
    ];
    // calcularPortfolio filtra quantidade > 0
    const portfolio = calcularPortfolio(ops);
    expect(portfolio).toHaveLength(0);
  });

  it("lida com múltiplas criptos independentemente", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("compra", "ETH", 10, 20_000, "2024-01-01"),
    ];
    const portfolio = calcularPortfolio(ops);
    expect(portfolio).toHaveLength(2);
    const btc = portfolio.find((p) => p.cripto === "BTC")!;
    const eth = portfolio.find((p) => p.cripto === "ETH")!;
    expect(btc.precoMedio).toBeCloseTo(100_000);
    expect(eth.precoMedio).toBeCloseTo(2_000);
  });
});

// ─── calcularImposto ──────────────────────────────────────────────────────────

describe("calcularImposto", () => {
  it("retorna 0 para ganho negativo", () => {
    expect(calcularImposto(-1000)).toBe(0);
  });

  it("retorna 0 para ganho zero", () => {
    expect(calcularImposto(0)).toBe(0);
  });

  it("aplica 15% para ganho até R$5 milhões", () => {
    expect(calcularImposto(100_000)).toBeCloseTo(15_000);
    expect(calcularImposto(1_000_000)).toBeCloseTo(150_000);
  });

  it("aplica alíquota progressiva entre faixas", () => {
    // R$6 milhões: 5M × 15% + 1M × 17.5% = 750k + 175k = 925k
    expect(calcularImposto(6_000_000)).toBeCloseTo(925_000);
  });

  it("aplica 22.5% acima de R$30 milhões", () => {
    // R$31M: 5M×15% + 5M×17.5% + 20M×20% + 1M×22.5%
    // = 750k + 875k + 4000k + 225k = 5850k
    expect(calcularImposto(31_000_000)).toBeCloseTo(5_850_000);
  });
});

// ─── calcularResumosMensais ───────────────────────────────────────────────────

describe("calcularResumosMensais", () => {
  it("retorna vazio para lista vazia", () => {
    expect(calcularResumosMensais([])).toEqual([]);
  });

  it("marca isento quando vendas <= R$35.000/mês", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("venda", "BTC", 0.3, 30_000, "2024-01-15"), // R$30k < R$35k → isento
    ];
    const resumos = calcularResumosMensais(ops);
    expect(resumos[0].isento).toBe(true);
    expect(resumos[0].impostoDevido).toBe(0);
  });

  it("cobra imposto quando vendas > R$35.000/mês", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("venda", "BTC", 0.5, 60_000, "2024-02-01"), // R$60k > R$35k → tributado
    ];
    const resumos = calcularResumosMensais(ops);
    const fev = resumos.find((r) => r.mes === "2024-02")!;
    expect(fev.isento).toBe(false);
    // lucro = 60k - (0.5 × 100k) = 10k → imposto = 10k × 15% = 1500
    expect(fev.impostoDevido).toBeCloseTo(1_500);
  });

  it("não cobra imposto com prejuízo (lucroTotal negativo)", () => {
    const ops = [
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      op("venda", "BTC", 1, 50_000, "2024-02-01"), // vende abaixo do custo
    ];
    const resumos = calcularResumosMensais(ops);
    const fev = resumos.find((r) => r.mes === "2024-02")!;
    expect(fev.impostoDevido).toBe(0);
  });

  it("mantém portfolio incremental entre meses", () => {
    // Jan: compra 2 BTC a R$100k total → médio = R$50k/BTC
    // Fev: compra mais 1 BTC a R$60k → médio = (100k + 60k) / 3 ≈ R$53.333
    // Mar: vende 1 BTC a R$70k → lucro ≈ 70k - 53.333k ≈ R$16.667
    const ops = [
      op("compra", "BTC", 2, 100_000, "2024-01-15"),
      op("compra", "BTC", 1, 60_000,  "2024-02-01"),
      op("venda", "BTC", 1, 70_000,   "2024-03-01"),
    ];
    const resumos = calcularResumosMensais(ops);
    const mar = resumos.find((r) => r.mes === "2024-03")!;
    // médio = 160k / 3 ≈ 53.333 → lucro = 70k - 53.333k ≈ 16.667
    expect(mar.lucroTotal).toBeCloseTo(16_666.67, 0);
  });

  it("gera um resumo por mês distinto", () => {
    const ops = [
      op("compra", "BTC", 1, 50_000, "2024-01-01"),
      op("compra", "ETH", 5, 10_000, "2024-03-01"),
    ];
    const resumos = calcularResumosMensais(ops);
    expect(resumos.map((r) => r.mes)).toEqual(["2024-01", "2024-03"]);
  });
});

// ─── calcularResumoGeral ──────────────────────────────────────────────────────

describe("calcularResumoGeral", () => {
  it("retorna zeros para lista vazia", () => {
    const resumo = calcularResumoGeral([]);
    expect(resumo.totalOperacoes).toBe(0);
    expect(resumo.totalVendas).toBe(0);
    expect(resumo.impostoTotalDevido).toBe(0);
    expect(resumo.portfolio).toEqual([]);
  });

  it("soma imposto de todos os meses tributáveis", () => {
    const ops = [
      // Mês 1: compra
      op("compra", "BTC", 1, 100_000, "2024-01-01"),
      // Mês 2: venda R$60k → lucro R$10k → imposto R$1.500
      op("venda", "BTC", 0.5, 60_000, "2024-02-01"),
      // compra mais
      op("compra", "BTC", 0.5, 50_000, "2024-03-01"),
      // Mês 4: venda R$60k
      op("venda", "BTC", 0.5, 60_000, "2024-04-01"),
    ];
    const resumo = calcularResumoGeral(ops);
    expect(resumo.totalOperacoes).toBe(4);
    expect(resumo.impostoTotalDevido).toBeGreaterThan(0);
  });
});
