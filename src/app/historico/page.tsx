"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, BarChart2, Lock, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Operacao } from "@/lib/types";
import { carregarOperacoes } from "@/lib/storage";
import { calcularResumoGeral, calcularResumosMensais, gerarDadosGrafico } from "@/lib/calculadora";
import { GraficoResumo } from "@/components/calculadora/grafico-resumo";
import { PortfolioCard } from "@/components/calculadora/portfolio-card";

const summaryCards = (resumo: ReturnType<typeof calcularResumoGeral>) => [
  {
    label: "Total de Operações",
    value: resumo.totalOperacoes.toString(),
    icon: Activity,
    color: "text-foreground",
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    label: "Total Compras",
    value: formatCurrency(resumo.totalCompras),
    icon: TrendingUp,
    color: "text-green-600",
    bg: "bg-green-500/10",
    iconColor: "text-green-600",
  },
  {
    label: "Total Vendas",
    value: formatCurrency(resumo.totalVendas),
    icon: TrendingDown,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    label: "Imposto Total Devido",
    value: formatCurrency(resumo.impostoTotalDevido),
    icon: DollarSign,
    color: "text-primary",
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export default function HistoricoPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (status === "loading") return;
    if (!isLoggedIn) {
      setOperacoes(carregarOperacoes());
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/operacoes");
      if (res.ok) {
        const data = await res.json();
        setOperacoes(data);
      } else {
        toast.error("Erro ao carregar operações");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, status]);

  useEffect(() => { carregar(); }, [carregar]);

  const resumoGeral = calcularResumoGeral(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);
  const dadosGrafico = gerarDadosGrafico(operacoes);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calculadora">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Calculadora
              </Link>
            </Button>
            <div className="flex items-center gap-2 border-l pl-3">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Histórico & Gráficos</h1>
            </div>
          </div>
          {isLoggedIn && operacoes.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/relatorio">Relatório IRPF</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Guest CTA */}
        {!isLoggedIn && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-4 flex-wrap justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Crie uma conta para histórico completo e sincronizado</p>
                <p className="text-xs text-muted-foreground">Dados locais podem ser perdidos ao limpar o navegador</p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href="/register">Criar conta grátis</Link>
            </Button>
          </div>
        )}

        {operacoes.length === 0 ? (
          <Card className="animate-fade-in-up">
            <CardContent className="py-20 text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-lg mb-2">Nenhuma operação registrada</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Vá para a calculadora, importe ou adicione operações para ver o histórico aqui.
              </p>
              <Button asChild>
                <Link href="/calculadora">Ir para a Calculadora</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryCards(resumoGeral).map((item, i) => (
                <Card key={i} className="card-hover animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                    </div>
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Gráficos */}
            <div className="animate-fade-in-up delay-200">
              <GraficoResumo dados={dadosGrafico} />
            </div>

            {/* Breakdown mensal */}
            <Card className="animate-fade-in-up delay-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Resumo por Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="text-left pb-3 font-medium">Mês</th>
                        <th className="text-right pb-3 font-medium">Compras</th>
                        <th className="text-right pb-3 font-medium">Vendas</th>
                        <th className="text-right pb-3 font-medium">Lucro/Perda</th>
                        <th className="text-right pb-3 font-medium">Imposto</th>
                        <th className="text-right pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[...resumosMensais].reverse().map((r) => (
                        <tr key={r.mes} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 font-medium">
                            {new Date(r.mes + "-01").toLocaleDateString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 text-right text-green-600 font-medium">
                            {formatCurrency(r.totalCompras)}
                          </td>
                          <td className="py-3 text-right">{formatCurrency(r.totalVendas)}</td>
                          <td
                            className={`py-3 text-right font-semibold ${
                              r.lucroTotal >= 0 ? "text-green-600" : "text-destructive"
                            }`}
                          >
                            {r.lucroTotal >= 0 ? "+" : ""}{formatCurrency(r.lucroTotal)}
                          </td>
                          <td className="py-3 text-right">
                            {r.impostoDevido > 0 ? (
                              <span className="text-destructive font-medium">
                                {formatCurrency(r.impostoDevido)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            {r.isento ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Isento
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                DARF
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <div className="animate-fade-in-up delay-400">
              <PortfolioCard portfolio={resumoGeral.portfolio} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
