import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, TrendingUp, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Exemplos de Cálculo de IR para Criptomoedas",
  description:
    "Aprenda a calcular imposto de renda sobre criptomoedas com exemplos práticos. Veja casos de isenção, tributação e prejuízo.",
  openGraph: {
    title: "Exemplos de Cálculo - IR Criptomoedas",
    description: "Exemplos práticos de cálculo de imposto sobre criptomoedas",
  },
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Calculo {
  label: string;
  valor: string;
  destaque?: boolean;
  negativo?: boolean;
}

interface Exemplo {
  titulo: string;
  descricao: string;
  cenario: Record<string, unknown>;
  calculos: Calculo[];
  resultado: {
    isento: boolean;
    motivo: string;
    imposto: number;
    calculo?: string;
  };
}

const exemplos: Exemplo[] = [
  {
    titulo: "Exemplo 1: Venda com lucro ISENTA",
    descricao: "Vendas abaixo de R$ 35.000 no mês",
    cenario: {
      compra: { data: "01/01/2024", qtd: 0.1, valor: 20000 },
      venda: { data: "15/03/2024", qtd: 0.1, valor: 30000 },
    },
    calculos: [
      { label: "Preço médio de aquisição", valor: "R$ 200.000/BTC" },
      { label: "Custo de aquisição (0.1 BTC)", valor: "R$ 20.000" },
      { label: "Valor da venda", valor: "R$ 30.000" },
      { label: "Ganho de capital", valor: "R$ 10.000", destaque: true },
      { label: "Total de vendas no mês", valor: "R$ 30.000" },
    ],
    resultado: {
      isento: true,
      motivo: "Vendas no mês (R$ 30.000) < Limite de isenção (R$ 35.000)",
      imposto: 0,
    },
  },
  {
    titulo: "Exemplo 2: Venda com lucro TRIBUTÁVEL",
    descricao: "Vendas acima de R$ 35.000 no mês",
    cenario: {
      compras: [
        { data: "01/01/2024", qtd: 0.5, valor: 50000 },
        { data: "01/02/2024", qtd: 0.5, valor: 75000 },
      ],
      venda: { data: "15/03/2024", qtd: 1.0, valor: 180000 },
    },
    calculos: [
      { label: "Preço médio de aquisição", valor: "(50.000 + 75.000) / 1.0 = R$ 125.000/BTC" },
      { label: "Custo de aquisição (1.0 BTC)", valor: "R$ 125.000" },
      { label: "Valor da venda", valor: "R$ 180.000" },
      { label: "Ganho de capital", valor: "R$ 55.000", destaque: true },
      { label: "Total de vendas no mês", valor: "R$ 180.000" },
    ],
    resultado: {
      isento: false,
      motivo: "Vendas no mês (R$ 180.000) > Limite de isenção (R$ 35.000)",
      imposto: 8250,
      calculo: "R$ 55.000 × 15% = R$ 8.250",
    },
  },
  {
    titulo: "Exemplo 3: Venda com PREJUÍZO",
    descricao: "Prejuízo não gera imposto, mesmo com vendas altas",
    cenario: {
      compra: { data: "01/01/2024", qtd: 1.0, valor: 200000 },
      venda: { data: "15/03/2024", qtd: 1.0, valor: 150000 },
    },
    calculos: [
      { label: "Preço médio de aquisição", valor: "R$ 200.000/BTC" },
      { label: "Custo de aquisição (1.0 BTC)", valor: "R$ 200.000" },
      { label: "Valor da venda", valor: "R$ 150.000" },
      { label: "Ganho de capital", valor: "- R$ 50.000 (prejuízo)", destaque: true, negativo: true },
      { label: "Total de vendas no mês", valor: "R$ 150.000" },
    ],
    resultado: {
      isento: true,
      motivo: "Não há ganho de capital (houve prejuízo)",
      imposto: 0,
    },
  },
  {
    titulo: "Exemplo 4: Múltiplas vendas no mês",
    descricao: "Soma das vendas ultrapassa o limite",
    cenario: {
      compra: { data: "01/01/2024", qtd: 1.0, valor: 100000 },
      vendas: [
        { data: "10/03/2024", qtd: 0.3, valor: 20000 },
        { data: "20/03/2024", qtd: 0.3, valor: 25000 },
      ],
    },
    calculos: [
      { label: "Preço médio de aquisição", valor: "R$ 100.000/BTC" },
      { label: "Venda 1: 0.3 BTC", valor: "Custo: R$ 30.000 → Venda: R$ 20.000 = - R$ 10.000" },
      { label: "Venda 2: 0.3 BTC", valor: "Custo: R$ 30.000 → Venda: R$ 25.000 = - R$ 5.000" },
      { label: "Ganho total do mês", valor: "- R$ 15.000 (prejuízo)", destaque: true, negativo: true },
      { label: "Total de vendas no mês", valor: "R$ 45.000" },
    ],
    resultado: {
      isento: true,
      motivo: "Apesar das vendas > R$ 35.000, houve prejuízo no mês",
      imposto: 0,
    },
  },
];

export default function ExemplosPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Exemplos de Cálculo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Exemplos de Cálculo
            </h1>
            <p className="text-lg text-muted-foreground">
              Entenda como funciona a tributação com exemplos práticos
            </p>
          </div>

          {/* Exemplos */}
          <div className="space-y-8">
            {exemplos.map((exemplo, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{exemplo.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {exemplo.descricao}
                      </CardDescription>
                    </div>
                    {exemplo.resultado.isento ? (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-medium">
                        <Check className="h-4 w-4" />
                        Isento
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Tributável
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Cálculos */}
                  <div className="space-y-3 mb-6">
                    {exemplo.calculos.map((calc, calcIdx) => (
                      <div
                        key={calcIdx}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          calc.destaque
                            ? calc.negativo
                              ? "bg-red-50 dark:bg-red-950"
                              : "bg-primary/5"
                            : "bg-muted/50"
                        }`}
                      >
                        <span
                          className={
                            calc.destaque ? "font-medium" : "text-muted-foreground"
                          }
                        >
                          {calc.label}
                        </span>
                        <span
                          className={`font-mono ${
                            calc.destaque
                              ? calc.negativo
                                ? "text-red-600 font-bold"
                                : "text-primary font-bold"
                              : ""
                          }`}
                        >
                          {calc.valor}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Resultado */}
                  <div
                    className={`p-4 rounded-lg ${
                      exemplo.resultado.isento
                        ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                        : "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {exemplo.resultado.isento ? (
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            exemplo.resultado.isento
                              ? "text-green-800 dark:text-green-200"
                              : "text-amber-800 dark:text-amber-200"
                          }`}
                        >
                          {exemplo.resultado.isento
                            ? "Resultado: ISENTO"
                            : `Imposto devido: R$ ${exemplo.resultado.imposto?.toLocaleString("pt-BR")}`}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            exemplo.resultado.isento
                              ? "text-green-700 dark:text-green-300"
                              : "text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {exemplo.resultado.motivo}
                        </p>
                        {exemplo.resultado.calculo && (
                          <p className="text-sm mt-1 font-mono text-amber-600 dark:text-amber-400">
                            {exemplo.resultado.calculo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo das Regras */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Resumo das Regras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Você NÃO paga imposto quando:
                  </h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Vendas no mês ≤ R$ 35.000</li>
                    <li>• Houve prejuízo na operação</li>
                    <li>• Apenas comprou (não vendeu)</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Você PAGA imposto quando:
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Vendas no mês &gt; R$ 35.000</li>
                    <li>• E houve lucro na operação</li>
                    <li>• Alíquota: 15% a 22,5%</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center p-8 bg-primary/5 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">
              Calcule seu imposto agora
            </h3>
            <p className="text-muted-foreground mb-4">
              Use nossa calculadora para simular suas operações reais
            </p>
            <Button asChild>
              <Link href="/calculadora">Acessar Calculadora</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
