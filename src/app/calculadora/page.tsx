"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
  CloudUpload,
  Lock,
  FileText,
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
import { DarfModal } from "@/components/calculadora/darf-modal";
import { exportarPDF } from "@/lib/export-pdf";

const CRIPTOS_DISPONIVEIS = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "BNB", label: "BNB" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "ADA", label: "Cardano (ADA)" },
  { value: "DOGE", label: "Dogecoin (DOGE)" },
  { value: "LINK", label: "Chainlink (LINK)" },
  { value: "AAVE", label: "Aave (AAVE)" },
  { value: "UNI", label: "Uniswap (UNI)" },
  { value: "MATIC", label: "Polygon (MATIC)" },
  { value: "DOT", label: "Polkadot (DOT)" },
  { value: "AVAX", label: "Avalanche (AVAX)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "USD Coin (USDC)" },
];

const LIMITE_FREE = 50;

export default function CalculadoraPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [novaOperacao, setNovaOperacao] = useState({
    tipo: "compra" as "compra" | "venda",
    cripto: "BTC",
    criptoCustom: "",
    quantidade: "",
    valorTotal: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // --- Carregar operações ---
  const carregarDados = useCallback(async () => {
    if (isLoggedIn) {
      setLoadingData(true);
      try {
        const res = await fetch("/api/operacoes");
        if (res.ok) {
          const data = await res.json();
          setOperacoes(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    } else {
      setOperacoes(carregarOperacoes());
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (status !== "loading") {
      carregarDados();
    }
  }, [status, carregarDados]);

  // Salvar no localStorage quando não logado
  useEffect(() => {
    if (!isLoggedIn && operacoes.length > 0) {
      salvarOperacoes(operacoes);
    }
  }, [operacoes, isLoggedIn]);

  // --- Adicionar operação ---
  const adicionarOperacao = async () => {
    if (!novaOperacao.quantidade || !novaOperacao.valorTotal) return;

    const quantidade = parseFloat(novaOperacao.quantidade);
    const valorTotal = parseFloat(novaOperacao.valorTotal);
    const cripto =
      novaOperacao.cripto === "OUTRO"
        ? novaOperacao.criptoCustom.toUpperCase()
        : novaOperacao.cripto;

    if (!cripto) return;

    const operacao: Operacao = {
      id: Date.now().toString(),
      tipo: novaOperacao.tipo,
      cripto,
      quantidade,
      valorTotal,
      precoUnitario: valorTotal / quantidade,
      data: novaOperacao.data,
    };

    if (isLoggedIn) {
      setSalvando(true);
      try {
        const res = await fetch("/api/operacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operacao),
        });
        if (res.ok) {
          const [saved] = await res.json();
          setOperacoes((prev) => [saved, ...prev]);
        }
      } finally {
        setSalvando(false);
      }
    } else {
      setOperacoes((prev) => [...prev, operacao]);
    }

    setNovaOperacao({
      tipo: "compra",
      cripto: "BTC",
      criptoCustom: "",
      quantidade: "",
      valorTotal: "",
      data: new Date().toISOString().split("T")[0],
    });
    setMostrarFormulario(false);
  };

  // --- Remover operação ---
  const removerOperacao = async (id: string) => {
    if (isLoggedIn) {
      await fetch(`/api/operacoes?id=${id}`, { method: "DELETE" });
    }
    const novasOps = operacoes.filter((op) => op.id !== id);
    setOperacoes(novasOps);
    if (!isLoggedIn && novasOps.length === 0) limparOperacoes();
  };

  // --- Importar CSV ---
  const handleImportCSV = async (novasOperacoes: Operacao[]) => {
    if (isLoggedIn) {
      setSalvando(true);
      try {
        const res = await fetch("/api/operacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novasOperacoes),
        });
        if (res.ok) {
          const saved = await res.json();
          setOperacoes((prev) => [...saved, ...prev]);
        }
      } finally {
        setSalvando(false);
      }
    } else {
      setOperacoes((prev) => [...prev, ...novasOperacoes]);
    }
  };

  const handleLimparTudo = async () => {
    if (!confirm("Tem certeza que deseja remover todas as operações?")) return;

    if (isLoggedIn) {
      await Promise.all(
        operacoes.map((op) =>
          fetch(`/api/operacoes?id=${op.id}`, { method: "DELETE" })
        )
      );
    } else {
      limparOperacoes();
    }
    setOperacoes([]);
  };

  const resumoGeral = calcularResumoGeral(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);
  const dadosGrafico = gerarDadosGrafico(operacoes);
  const mesAtual = new Date().toISOString().substring(0, 7);
  const resumoMesAtual = resumosMensais.find((r) => r.mes === mesAtual) || {
    totalVendas: 0,
    lucroTotal: 0,
    impostoDevido: 0,
    isento: true,
  };

  const atingiuLimite = !isLoggedIn && operacoes.length >= LIMITE_FREE;

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
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                <CloudUpload className="h-3 w-3" />
                Salvo na nuvem
              </span>
            )}
            {isLoggedIn && operacoes.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/relatorio">
                  <FileText className="h-4 w-4 mr-2" />
                  IRPF
                </Link>
              </Button>
            )}
            {operacoes.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportarPDF({ operacoes, resumoGeral, resumosMensais })}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleLimparTudo}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner: não logado */}
        {!isLoggedIn && status !== "loading" && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CloudUpload className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  Crie uma conta para salvar suas operações na nuvem
                </p>
                <p className="text-xs text-muted-foreground">
                  {operacoes.length}/{LIMITE_FREE} operações locais — dados perdidos se limpar o navegador
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Criar conta grátis</Link>
              </Button>
            </div>
          </div>
        )}

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
            <UploadCSV onImport={handleImportCSV} disabled={atingiuLimite} />

            {/* Botão Adicionar Manual */}
            {!mostrarFormulario && (
              <Button
                onClick={() => setMostrarFormulario(true)}
                variant="outline"
                className="w-full"
                disabled={atingiuLimite}
              >
                {atingiuLimite ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Limite atingido — crie uma conta para continuar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Operação Manual
                  </>
                )}
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
                          setNovaOperacao({ ...novaOperacao, cripto: e.target.value })
                        }
                      >
                        {CRIPTOS_DISPONIVEIS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                        <option value="OUTRO">Outra (digitar)</option>
                      </select>
                      {novaOperacao.cripto === "OUTRO" && (
                        <Input
                          className="mt-2"
                          placeholder="Ex: KMNO, WIF, JUP..."
                          value={novaOperacao.criptoCustom}
                          onChange={(e) =>
                            setNovaOperacao({
                              ...novaOperacao,
                              criptoCustom: e.target.value,
                            })
                          }
                        />
                      )}
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
                          setNovaOperacao({ ...novaOperacao, quantidade: e.target.value })
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
                          setNovaOperacao({ ...novaOperacao, valorTotal: e.target.value })
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
                          setNovaOperacao({ ...novaOperacao, data: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button
                        onClick={adicionarOperacao}
                        className="flex-1"
                        disabled={salvando}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {salvando ? "Salvando..." : "Adicionar"}
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
            {loadingData ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    Carregando operações...
                  </div>
                </CardContent>
              </Card>
            ) : operacoes.length > 0 ? (
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
                                {new Date(op.data + "T12:00:00").toLocaleDateString("pt-BR")}
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
            ) : null}
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
                        <p className="text-sm">Vendas abaixo de R$ 35.000 no mês</p>
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

            {/* DARF */}
            {resumosMensais.some((r) => r.impostoDevido > 0) && (
              <DarfModal resumosMensais={resumosMensais} />
            )}

            {/* Portfolio */}
            <PortfolioCard portfolio={resumoGeral.portfolio} />

            {/* Regras do IR */}
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
                <Link
                  href="/legislacao"
                  className="text-primary text-sm hover:underline block text-center"
                >
                  Ver legislação completa →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
