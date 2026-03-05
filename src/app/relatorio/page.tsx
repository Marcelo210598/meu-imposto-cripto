"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  Loader2,
  BarChart3,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Operacao } from "@/lib/types";
import {
  gerarRelatorioAnual,
  gerarCSVOperacoes,
  gerarTextoGCAP,
  extrairAnosComOperacoes,
  RelatorioAnual,
} from "@/lib/relatorio";

export default function RelatorioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [copiado, setCopiado] = useState(false);
  const [mostrarBens, setMostrarBens] = useState(true);
  const [mostrarGCAP, setMostrarGCAP] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/relatorio");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/operacoes")
        .then((r) => r.json())
        .then((data) => setOperacoes(Array.isArray(data) ? data : []))
        .catch(() => setOperacoes([]))
        .finally(() => setLoading(false));
    }
  }, [status]);

  const anos = extrairAnosComOperacoes(operacoes);
  const relatorio: RelatorioAnual = gerarRelatorioAnual(operacoes, anoSelecionado);

  const exportarCSV = useCallback(() => {
    const csv = gerarCSVOperacoes(operacoes);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `operacoes-cripto-${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [operacoes]);

  const copiarGCAP = useCallback(() => {
    const texto = gerarTextoGCAP(relatorio);
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }, [relatorio]);

  const imprimir = () => window.print();

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur print:hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calculadora">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Calculadora
              </Link>
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Relatório IRPF</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportarCSV} disabled={operacoes.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={imprimir}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Título para impressão */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold">Relatório IRPF — Criptoativos {anoSelecionado}</h1>
          <p className="text-sm text-gray-500">
            {session?.user?.name} • {session?.user?.email} • Gerado em {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Seletor de ano */}
        {!loading && (
          <div className="flex items-center gap-3 mb-6 print:hidden">
            <span className="text-sm text-muted-foreground">Ano calendário:</span>
            <div className="flex gap-2">
              {(anos.length > 0 ? anos : [new Date().getFullYear()]).map((ano) => (
                <button
                  key={ano}
                  onClick={() => setAnoSelecionado(ano)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    anoSelecionado === ano
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {ano}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando operações...
          </div>
        ) : operacoes.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-muted-foreground">Nenhuma operação registrada</p>
              <Button className="mt-4" asChild>
                <Link href="/calculadora">Ir para Calculadora</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cards resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Vendas</p>
                  <p className="text-lg font-bold">{formatCurrency(relatorio.totalVendas)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Ganho de Capital</p>
                  <p className={`text-lg font-bold ${relatorio.totalGanhos > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                    {formatCurrency(relatorio.totalGanhos)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Imposto Devido</p>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(relatorio.totalImposto)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Meses Tributáveis</p>
                  <p className="text-lg font-bold">{relatorio.mesesComImposto}</p>
                </CardContent>
              </Card>
            </div>

            {/* SEÇÃO 1: Bens e Direitos */}
            <Card className="mb-6">
              <CardHeader>
                <button
                  className="flex items-center justify-between w-full text-left print:hidden"
                  onClick={() => setMostrarBens(!mostrarBens)}
                >
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Bens e Direitos — Grupo 08 (Criptoativos)
                  </CardTitle>
                  {mostrarBens ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                <div className="hidden print:flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">Bens e Direitos — Grupo 08</span>
                </div>
              </CardHeader>

              {(mostrarBens || true) && (
                <CardContent>
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-sm">
                    <p className="font-medium mb-1">Como preencher na declaração IRPF:</p>
                    <p>Ficha "Bens e Direitos" → Grupo <strong>08 - Ativos Virtuais</strong> → informe o custo de aquisição em 31/12/{anoSelecionado - 1} e 31/12/{anoSelecionado}</p>
                  </div>

                  {relatorio.bensDireitos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum criptoativo em carteira em 31/12/{anoSelecionado}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {relatorio.bensDireitos.map((bem) => (
                        <div key={bem.cripto} className="p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-lg">{bem.cripto}</span>
                                <Badge variant="outline" className="text-xs">
                                  Código {bem.codigoIRPF}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{bem.discriminacao}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-md bg-background">
                              <p className="text-xs text-muted-foreground mb-1">
                                Situação em 31/12/{anoSelecionado - 1}
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(bem.custoAquisicaoAnoAnterior)}
                              </p>
                            </div>
                            <div className="p-3 rounded-md bg-primary/5">
                              <p className="text-xs text-muted-foreground mb-1">
                                Situação em 31/12/{anoSelecionado}
                              </p>
                              <p className="font-semibold text-primary">
                                {formatCurrency(bem.custoAquisicao)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* SEÇÃO 2: Ganho de Capital */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ganho de Capital — Mês a Mês ({anoSelecionado})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatorio.ganhosCapital.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma operação de venda em {anoSelecionado}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-5 gap-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <span>Mês</span>
                      <span className="text-right">Total Vendas</span>
                      <span className="text-right">Ganho</span>
                      <span className="text-right">Imposto</span>
                      <span className="text-right">Status</span>
                    </div>

                    {relatorio.ganhosCapital.map((g) => (
                      <div
                        key={g.mes}
                        className={`grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-lg items-center ${
                          g.impostoDevido > 0
                            ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                            : "bg-muted/40"
                        }`}
                      >
                        <span className="font-medium text-sm">{g.mesFormatado}</span>
                        <span className="text-right text-sm">{formatCurrency(g.totalVendas)}</span>
                        <span className={`text-right text-sm font-medium ${g.ganhoCapital > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                          {formatCurrency(g.ganhoCapital)}
                        </span>
                        <span className={`text-right text-sm font-bold ${g.impostoDevido > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {g.impostoDevido > 0 ? formatCurrency(g.impostoDevido) : "—"}
                        </span>
                        <div className="flex justify-end">
                          {g.impostoDevido > 0 ? (
                            <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              DARF
                            </Badge>
                          ) : g.isento && g.totalVendas > 0 ? (
                            <Badge variant="outline" className="text-xs border-green-400 text-green-700 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Isento
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem vendas</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Totais */}
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 font-semibold">
                      <span>Total {anoSelecionado}</span>
                      <span className="text-right">{formatCurrency(relatorio.totalVendas)}</span>
                      <span className={`text-right ${relatorio.totalGanhos > 0 ? "text-green-600" : ""}`}>
                        {formatCurrency(relatorio.totalGanhos)}
                      </span>
                      <span className="text-right text-amber-600">{formatCurrency(relatorio.totalImposto)}</span>
                      <span />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEÇÃO 3: Rendimentos Isentos */}
            {relatorio.totalIsentos > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Rendimentos Isentos e Não Tributáveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 text-sm mb-4">
                    <p className="font-medium">Como preencher no IRPF:</p>
                    <p>Ficha "Rendimentos Isentos e Não Tributáveis" → Código <strong>05</strong> (Ganho de capital na alienação de bem/direito até R$ 35.000)</p>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <span className="text-sm font-medium">Total de ganhos isentos em {anoSelecionado}</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(relatorio.totalIsentos)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEÇÃO 4: Dados para GCAP */}
            <Card className="mb-6 print:hidden">
              <CardHeader>
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setMostrarGCAP(!mostrarGCAP)}
                >
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dados para o GCAP (Receita Federal)
                  </CardTitle>
                  {mostrarGCAP ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
              </CardHeader>

              {mostrarGCAP && (
                <CardContent>
                  <div className="p-3 rounded-lg bg-muted text-sm mb-4">
                    <p className="font-medium mb-1">O que é o GCAP?</p>
                    <p className="text-muted-foreground">
                      O GCAP é o programa da Receita Federal para apuração de Ganho de Capital.
                      Copie os dados abaixo e use como referência para preencher o programa.
                    </p>
                  </div>

                  <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-auto max-h-64 font-mono whitespace-pre-wrap">
                    {gerarTextoGCAP(relatorio)}
                  </pre>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={copiarGCAP} className="w-full">
                      {copiado ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar dados GCAP
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportarCSV} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV completo
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Aviso legal */}
            <div className="p-4 rounded-lg bg-muted text-xs text-muted-foreground">
              <p className="font-medium mb-1">⚠ Aviso</p>
              <p>
                Este relatório é gerado com base nas operações cadastradas e serve como auxílio no preenchimento
                da declaração. Sempre confira as informações com um contador ou com o próprio programa da Receita
                Federal. As alíquotas e regras podem ter alterações — consulte a IN 1.888/2019 e atualizações.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
