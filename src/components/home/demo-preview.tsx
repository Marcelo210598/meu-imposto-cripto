"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const operacoes = [
  { tipo: "Compra", moeda: "BTC", quantidade: "2,0000", preco: "R$ 140.000,00", total: "R$ 280.000,00", data: "15/01/2025", cor: "text-emerald-600 dark:text-emerald-400" },
  { tipo: "Compra", moeda: "BTC", quantidade: "1,0000", preco: "R$ 175.000,00", total: "R$ 175.000,00", data: "10/02/2025", cor: "text-emerald-600 dark:text-emerald-400" },
  { tipo: "Venda",  moeda: "BTC", quantidade: "1,5000", preco: "R$ 160.000,00", total: "R$ 240.000,00", data: "18/03/2025", cor: "text-rose-500 dark:text-rose-400" },
];

const resultado = {
  precoMedio: "R$ 151.667,00",
  totalVendido: "R$ 240.000,00",
  custo: "R$ 227.500,00",
  lucro: "R$ 12.500,00",
  aliquota: "15%",
  imposto: "R$ 1.875,00",
  prazo: "30/04/2025",
  status: "tributavel" as const,
};

export function DemoPreview() {
  const [activeTab, setActiveTab] = useState<"operacoes" | "resultado">("operacoes");

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Demo interativo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Veja como funciona na prática</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Carlos comprou BTC em dois momentos e depois vendeu parte. Veja como o sistema calcula o imposto automaticamente.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* App Shell */}
          <div className="rounded-2xl border bg-background shadow-2xl shadow-black/10 overflow-hidden">
            {/* Barra do "app" */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-xs text-muted-foreground bg-background px-3 py-1 rounded border">
                  meu-imposto-cripto.vercel.app/calculadora
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("operacoes")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "operacoes"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Operações importadas
              </button>
              <button
                onClick={() => setActiveTab("resultado")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "resultado"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Resultado calculado
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {activeTab === "operacoes" ? (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">
                    3 operações importadas via CSV · BTC · Jan–Mar 2025
                  </p>
                  <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Data</th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Tipo</th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Ativo</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Qtd</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Preço un.</th>
                          <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {operacoes.map((op, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground text-xs">{op.data}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${op.cor}`}>
                                {op.tipo === "Compra"
                                  ? <TrendingUp className="h-3 w-3" />
                                  : <TrendingDown className="h-3 w-3" />
                                }
                                {op.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-xs">{op.moeda}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs">{op.quantidade}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs">{op.preco}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs font-semibold">{op.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab("resultado")}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Ver resultado calculado <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Cálculo automático · Março 2025 · Regime de ganho de capital
                  </p>

                  {/* Grid de métricas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Preço médio BTC", value: resultado.precoMedio, sub: "ponderado" },
                      { label: "Total vendido", value: resultado.totalVendido, sub: "em março" },
                      { label: "Lucro apurado", value: resultado.lucro, sub: "venda − custo", highlight: true },
                      { label: "Alíquota", value: resultado.aliquota, sub: "progressiva" },
                    ].map((item, i) => (
                      <div key={i} className={`rounded-xl p-3 border ${item.highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30"}`}>
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className={`text-base font-bold ${item.highlight ? "text-primary" : ""}`}>{item.value}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Card principal do imposto */}
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex-shrink-0">
                      <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">IR devido em março/2025</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{resultado.imposto}</p>
                      <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                        Gerar DARF código 4600 · Vencimento: {resultado.prazo}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                        <CheckCircle2 className="h-3 w-3" /> Calculado
                      </span>
                    </div>
                  </div>

                  {/* Como calculou */}
                  <div className="rounded-xl bg-muted/30 p-4 text-xs space-y-1.5 font-mono">
                    <p className="text-muted-foreground font-sans font-medium text-[11px] mb-2">Como foi calculado:</p>
                    <p>Preço médio BTC = (2 × R$140k + 1 × R$175k) ÷ 3 = <span className="text-foreground font-semibold">R$151.667</span></p>
                    <p>Custo da venda = 1,5 BTC × R$151.667 = <span className="text-foreground font-semibold">R$227.500</span></p>
                    <p>Lucro = R$240.000 − R$227.500 = <span className="text-primary font-semibold">R$12.500</span></p>
                    <p>IR = R$12.500 × 15% = <span className="text-amber-600 dark:text-amber-400 font-semibold">R$1.875</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA abaixo */}
          <div className="text-center mt-8">
            <Button size="lg" asChild className="shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-200">
              <Link href="/calculadora">
                Calcular com meus dados
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Grátis até 50 operações · Sem cadastro obrigatório</p>
          </div>
        </div>
      </div>
    </section>
  );
}
