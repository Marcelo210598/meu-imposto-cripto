"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatCrypto } from "@/lib/utils";
import { Operacao, LIMITE_ISENCAO_MENSAL } from "@/lib/types";
import { salvarOperacoes, carregarOperacoes, limparOperacoes } from "@/lib/storage";
import {
  calcularResumoGeral,
  calcularResumosMensais,
  gerarDadosGrafico,
} from "@/lib/calculadora";
import { UploadCSV } from "@/components/calculadora/upload-csv";
import { GraficoResumo } from "@/components/calculadora/grafico-resumo";
import { PortfolioCard } from "@/components/calculadora/portfolio-card";
import { exportarPDF } from "@/lib/export-pdf";

const CRIPTOS_DISPONIVEIS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "USD Coin (USDC)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "BNB", label: "BNB" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "ADA", label: "Cardano (ADA)" },
  { value: "DOGE", label: "Dogecoin (DOGE)" },
  { value: "DOT", label: "Polkadot (DOT)" },
];

export default function CalculadoraPage() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [novaOperacao, setNovaOperacao] = useState({
    tipo: "compra" as "compra" | "venda",
    cripto: "BTC",
    quantidade: "",
    valorTotal: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  // Carregar operações do localStorage
  useEffect(() => {
    const ops = carregarOperacoes();
    setOperacoes(ops);
  }, []);

  // Salvar operações no localStorage sempre que mudar
  useEffect(() => {
    if (operacoes.length > 0) {
      salvarOperacoes(operacoes);
    }
  }, [operacoes]);

  const adicionarOperacao = () => {
    if (!novaOperacao.quantidade || !novaOperacao.valorTotal) return;

    const quantidade = parseFloat(novaOperacao.quantidade);
    const valorTotal = parseFloat(novaOperacao.valorTotal);

    const operacao: Operacao = {
      id: Date.now().toString(),
      tipo: novaOperacao.tipo,
      cripto: novaOperacao.cripto,
      quantidade,
      valorTotal,
      precoUnitario: valorTotal / quantidade,
      data: novaOperacao.data,
    };

    setOperacoes([...operacoes, operacao]);
    setNovaOperacao({
      tipo: "compra",
      cripto: "BTC",
      quantidade: "",
      valorTotal: "",
      data: new Date().toISOString().split("T")[0],
    });
    setMostrarFormulario(false);
  };

  const removerOperacao = (id: string) => {
    const novasOps = operacoes.filter((op) => op.id !== id);
    setOperacoes(novasOps);
    if (novasOps.length === 0) {
      limparOperacoes();
    }
  };

  const handleImportCSV = (novasOperacoes: Operacao[]) => {
    setOperacoes([...operacoes, ...novasOperacoes]);
  };

  const handleLimparTudo = () => {
    if (confirm("Tem certeza que deseja remover todas as operações?")) {
      setOperacoes([]);
      limparOperacoes();
    }
  };

  const resumoGeral = calcularResumoGeral(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);
  const dadosGrafico = gerarDadosGrafico(operacoes);

  // Mês atual para exibição
  const mesAtual = new Date().toISOString().substring(0, 7);
  const resumoMesAtual = resumosMensais.find((r) => r.mes === mesAtual) || {
    totalVendas: 0,
    lucroTotal: 0,
    impostoDevido: 0,
    isento: true,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Calculadora de IR</h1>
          </div>
          {operacoes.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportarPDF({
                    operacoes,
                    resumoGeral,
                    resumosMensais,
                  })
                }
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleLimparTudo}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Operações</p>
                  <p className="text-2xl font-bold">{resumoGeral.totalOperacoes}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendas (Mês Atual)</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(resumoMesAtual.totalVendas)}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL
                      ? "bg-destructive/10"
                      : "bg-green-100"
                  }`}
                >
                  {resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Acumulado</p>
                  <p
                    className={`text-2xl font-bold ${
                      resumoGeral.lucroAcumulado >= 0
                        ? "text-green-600"
                        : "text-destructive"
                    }`}
                  >
                    {formatCurrency(resumoGeral.lucroAcumulado)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {resumoGeral.lucroAcumulado >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Imposto Total Devido</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(resumoGeral.impostoTotalDevido)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload CSV */}
            <UploadCSV onImport={handleImportCSV} />

            {/* Botão Adicionar Manual */}
            {!mostrarFormulario && (
              <Button
                onClick={() => setMostrarFormulario(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Operação Manual
              </Button>
            )}

            {/* Formulário Manual */}
            {mostrarFormulario && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Nova Operação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <select
                        id="tipo"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={novaOperacao.tipo}
                        onChange={(e) =>
                          setNovaOperacao({
                            ...novaOperacao,
                            tipo: e.target.value as "compra" | "venda",
                          })
                        }
                      >
                        <option value="compra">Compra</option>
                        <option value="venda">Venda</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="cripto">Criptomoeda</Label>
                      <select
                        id="cripto"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={novaOperacao.cripto}
                        onChange={(e) =>
                          setNovaOperacao({
                            ...novaOperacao,
                            cripto: e.target.value,
                          })
                        }
                      >
                        {CRIPTOS_DISPONIVEIS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="quantidade">Quantidade</Label>
                      <Input
                        id="quantidade"
                        type="number"
                        step="0.00000001"
                        placeholder="0.00000000"
                        value={novaOperacao.quantidade}
                        onChange={(e) =>
                          setNovaOperacao({
                            ...novaOperacao,
                            quantidade: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="valorTotal">Valor Total (BRL)</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={novaOperacao.valorTotal}
                        onChange={(e) =>
                          setNovaOperacao({
                            ...novaOperacao,
                            valorTotal: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={novaOperacao.data}
                        onChange={(e) =>
                          setNovaOperacao({
                            ...novaOperacao,
                            data: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button onClick={adicionarOperacao} className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMostrarFormulario(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gráficos */}
            {operacoes.length > 0 && <GraficoResumo dados={dadosGrafico} />}

            {/* Lista de Operações */}
            {operacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Operações Registradas</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {operacoes.length} operações
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[...operacoes]
                      .sort(
                        (a, b) =>
                          new Date(b.data).getTime() - new Date(a.data).getTime()
                      )
                      .map((op) => (
                        <div
                          key={op.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {op.tipo === "compra" ? (
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {op.tipo === "compra" ? "Compra" : "Venda"} de{" "}
                                {formatCrypto(op.quantidade)} {op.cripto}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(op.data).toLocaleDateString("pt-BR")}
                                {op.exchange && ` • ${op.exchange}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(op.valorTotal)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(op.precoUnitario)}/unid
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerOperacao(op.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo do Mês */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo do Mês Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Vendas</span>
                  <span className="font-semibold">
                    {formatCurrency(resumoMesAtual.totalVendas)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Limite de Isenção</span>
                  <span className="font-semibold">
                    {formatCurrency(LIMITE_ISENCAO_MENSAL)}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL
                        ? "bg-destructive"
                        : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (resumoMesAtual.totalVendas / LIMITE_ISENCAO_MENSAL) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lucro/Prejuízo</span>
                  <span
                    className={`font-semibold ${
                      resumoMesAtual.lucroTotal >= 0
                        ? "text-green-600"
                        : "text-destructive"
                    }`}
                  >
                    {formatCurrency(resumoMesAtual.lucroTotal)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  {resumoMesAtual.isento ? (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Isento de IR</p>
                        <p className="text-sm">
                          Vendas abaixo de R$ 35.000 no mês
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Imposto Devido</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(resumoMesAtual.impostoDevido)}
                        </p>
                        <p className="text-sm">
                          Vencimento: último dia útil do mês seguinte
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <PortfolioCard portfolio={resumoGeral.portfolio} />

            {/* Regras */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regras do IR</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">Isenção</p>
                  <p>Vendas até R$ 35.000/mês são isentas</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">Alíquotas</p>
                  <ul className="mt-1 space-y-1">
                    <li>Até R$ 5M: 15%</li>
                    <li>R$ 5M a 10M: 17,5%</li>
                    <li>R$ 10M a 30M: 20%</li>
                    <li>Acima R$ 30M: 22,5%</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">Vencimento</p>
                  <p>Último dia útil do mês seguinte à venda</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
