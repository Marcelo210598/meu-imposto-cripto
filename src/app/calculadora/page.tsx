"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign,
  AlertCircle, Trash2, AlertTriangle, CheckCircle, FileDown,
  CloudUpload, Lock, FileText, Search, X, BarChart2, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatCrypto } from "@/lib/utils";
import { Operacao, LIMITE_ISENCAO_MENSAL } from "@/lib/types";
import { salvarOperacoes, carregarOperacoes, limparOperacoes } from "@/lib/storage";
import { calcularResumoGeral, calcularResumosMensais } from "@/lib/calculadora";
import { UploadCSV } from "@/components/calculadora/upload-csv";
import { PortfolioCard } from "@/components/calculadora/portfolio-card";
import { DarfModal } from "@/components/calculadora/darf-modal";
import { exportarPDF } from "@/lib/export-pdf";

const CRIPTOS_DISPONIVEIS = [
  { value: "BTC",  label: "Bitcoin (BTC)"      },
  { value: "ETH",  label: "Ethereum (ETH)"     },
  { value: "SOL",  label: "Solana (SOL)"        },
  { value: "BNB",  label: "BNB"                 },
  { value: "XRP",  label: "Ripple (XRP)"        },
  { value: "ADA",  label: "Cardano (ADA)"       },
  { value: "DOGE", label: "Dogecoin (DOGE)"     },
  { value: "LINK", label: "Chainlink (LINK)"    },
  { value: "AAVE", label: "Aave (AAVE)"         },
  { value: "UNI",  label: "Uniswap (UNI)"       },
  { value: "MATIC",label: "Polygon (MATIC)"     },
  { value: "DOT",  label: "Polkadot (DOT)"      },
  { value: "AVAX", label: "Avalanche (AVAX)"    },
  { value: "USDT", label: "Tether (USDT)"       },
  { value: "USDC", label: "USD Coin (USDC)"     },
];

const LIMITE_FREE = 50;

interface FormErrors {
  cripto?: string;
  quantidade?: string;
  valorTotal?: string;
  data?: string;
}

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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [confirmLimparOpen, setConfirmLimparOpen] = useState(false);
  const [limpando, setLimpando] = useState(false);

  // --- Carregar operações ---
  const carregarDados = useCallback(async () => {
    if (isLoggedIn) {
      setLoadingData(true);
      try {
        const res = await fetch("/api/operacoes");
        if (res.ok) {
          const data = await res.json();
          setOperacoes(data);
        } else {
          toast.error("Erro ao carregar operações");
        }
      } catch {
        toast.error("Erro de conexão ao carregar operações");
      } finally {
        setLoadingData(false);
      }
    } else {
      setOperacoes(carregarOperacoes());
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (status !== "loading") carregarDados();
  }, [status, carregarDados]);

  useEffect(() => {
    if (!isLoggedIn && operacoes.length > 0) salvarOperacoes(operacoes);
  }, [operacoes, isLoggedIn]);

  // --- Validação ---
  const validarFormulario = (): boolean => {
    const errors: FormErrors = {};
    const quantidade = parseFloat(novaOperacao.quantidade);
    const valorTotal = parseFloat(novaOperacao.valorTotal);
    const cripto =
      novaOperacao.cripto === "OUTRO"
        ? novaOperacao.criptoCustom.trim().toUpperCase()
        : novaOperacao.cripto;

    if (!cripto) errors.cripto = "Informe o símbolo da criptomoeda";
    else if (!/^[A-Z0-9]+$/.test(cripto))
      errors.cripto = "Use apenas letras maiúsculas e números (ex: BTC)";

    if (!novaOperacao.quantidade) errors.quantidade = "Informe a quantidade";
    else if (isNaN(quantidade) || quantidade <= 0)
      errors.quantidade = "Quantidade deve ser maior que zero";

    if (!novaOperacao.valorTotal) errors.valorTotal = "Informe o valor total";
    else if (isNaN(valorTotal) || valorTotal <= 0)
      errors.valorTotal = "Valor deve ser maior que zero";

    if (!novaOperacao.data) errors.data = "Informe a data";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Adicionar operação ---
  const adicionarOperacao = async () => {
    if (!validarFormulario()) return;

    const quantidade = parseFloat(novaOperacao.quantidade);
    const valorTotal = parseFloat(novaOperacao.valorTotal);
    const cripto =
      novaOperacao.cripto === "OUTRO"
        ? novaOperacao.criptoCustom.trim().toUpperCase()
        : novaOperacao.cripto;

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
          toast.success(`${cripto} adicionado com sucesso`);
        } else {
          const err = await res.json();
          if (res.status === 403 && err.upgrade) {
            toast.error(err.error, {
              action: { label: "Ver planos", onClick: () => window.location.href = "/precos" },
              duration: 8000,
            });
          } else {
            toast.error(err.error ?? "Erro ao salvar operação");
          }
          return;
        }
      } catch {
        toast.error("Erro de conexão. Tente novamente.");
        return;
      } finally {
        setSalvando(false);
      }
    } else {
      setOperacoes((prev) => [...prev, operacao]);
      toast.success(`${cripto} adicionado`);
    }

    setNovaOperacao({
      tipo: "compra", cripto: "BTC", criptoCustom: "",
      quantidade: "", valorTotal: "",
      data: new Date().toISOString().split("T")[0],
    });
    setFormErrors({});
    setMostrarFormulario(false);
  };

  // --- Remover operação ---
  const removerOperacao = async (id: string) => {
    if (isLoggedIn) {
      const res = await fetch(`/api/operacoes?id=${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Erro ao remover operação"); return; }
    }
    setOperacoes((prev) => {
      const novas = prev.filter((op) => op.id !== id);
      if (!isLoggedIn && novas.length === 0) limparOperacoes();
      return novas;
    });
    toast.success("Operação removida");
  };

  // --- Importar CSV/PDF/XLSX ---
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
          toast.success(`${saved.length} operações importadas com sucesso`);
        } else {
          const err = await res.json();
          if (res.status === 403 && err.upgrade) {
            toast.error(err.error, {
              action: { label: "Ver planos", onClick: () => window.location.href = "/precos" },
              duration: 8000,
            });
          } else {
            toast.error(err.error ?? "Erro ao importar operações");
          }
        }
      } catch {
        toast.error("Erro de conexão ao importar");
      } finally {
        setSalvando(false);
      }
    } else {
      setOperacoes((prev) => [...prev, ...novasOperacoes]);
    }
  };

  // --- Limpar tudo ---
  const handleLimparTudo = async () => {
    setLimpando(true);
    try {
      if (isLoggedIn) {
        const res = await fetch("/api/operacoes?all=true", { method: "DELETE" });
        if (!res.ok) { toast.error("Erro ao limpar operações"); return; }
      } else {
        limparOperacoes();
      }
      setOperacoes([]);
      toast.success("Todas as operações foram removidas");
    } catch {
      toast.error("Erro ao limpar operações");
    } finally {
      setLimpando(false);
      setConfirmLimparOpen(false);
    }
  };

  const resumoGeral = calcularResumoGeral(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);
  const mesAtual = new Date().toISOString().substring(0, 7);
  const resumoMesAtual = resumosMensais.find((r) => r.mes === mesAtual) || {
    totalVendas: 0, lucroTotal: 0, impostoDevido: 0, isento: true,
  };

  const atingiuLimite = !isLoggedIn && operacoes.length >= LIMITE_FREE;

  const operacoesFiltradas = busca.trim()
    ? operacoes.filter(
        (op) =>
          op.cripto.toLowerCase().includes(busca.toLowerCase()) ||
          op.tipo.includes(busca.toLowerCase()) ||
          op.exchange?.toLowerCase().includes(busca.toLowerCase())
      )
    : operacoes;

  // Summary cards data
  const summaryCards = [
    {
      label: "Total Operações",
      value: resumoGeral.totalOperacoes.toString(),
      icon: Activity,
      bg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-foreground",
    },
    {
      label: "Vendas (Mês Atual)",
      value: formatCurrency(resumoMesAtual.totalVendas),
      icon: resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL ? AlertTriangle : CheckCircle,
      bg: resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL ? "bg-destructive/10" : "bg-green-500/10",
      iconColor: resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL ? "text-destructive" : "text-green-600",
      valueColor: "text-foreground",
    },
    {
      label: "Lucro Acumulado",
      value: formatCurrency(resumoGeral.lucroAcumulado),
      icon: resumoGeral.lucroAcumulado >= 0 ? TrendingUp : TrendingDown,
      bg: resumoGeral.lucroAcumulado >= 0 ? "bg-green-500/10" : "bg-destructive/10",
      iconColor: resumoGeral.lucroAcumulado >= 0 ? "text-green-600" : "text-destructive",
      valueColor: resumoGeral.lucroAcumulado >= 0 ? "text-green-600" : "text-destructive",
    },
    {
      label: "Imposto Total Devido",
      value: formatCurrency(resumoGeral.impostoTotalDevido),
      icon: DollarSign,
      bg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dialog — limpar tudo */}
      <Dialog open={confirmLimparOpen} onOpenChange={setConfirmLimparOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover todas as operações?</DialogTitle>
            <DialogDescription>
              Essa ação é irreversível. Todas as {operacoes.length} operações serão
              permanentemente deletadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLimparOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLimparTudo} disabled={limpando}>
              {limpando ? "Removendo..." : "Sim, remover tudo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>
            <h1 className="ml-1 text-lg font-semibold border-l pl-3">Calculadora de IR</h1>
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
                <Link href="/historico">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Histórico
                </Link>
              </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmLimparOpen(true)}
                >
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
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 flex-wrap animate-fade-in">
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
          {summaryCards.map((card, i) => (
            <Card
              key={i}
              className="card-hover animate-fade-in-up border"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <UploadCSV onImport={handleImportCSV} disabled={atingiuLimite} />

            {!mostrarFormulario && (
              <Button
                onClick={() => setMostrarFormulario(true)}
                variant="outline"
                className="w-full border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                disabled={atingiuLimite}
              >
                {atingiuLimite ? (
                  <><Lock className="h-4 w-4 mr-2" />Limite atingido — crie uma conta para continuar</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Adicionar Operação Manual</>
                )}
              </Button>
            )}

            {/* Formulário Manual */}
            {mostrarFormulario && (
              <Card className="animate-fade-in-up border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
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
                          setNovaOperacao({ ...novaOperacao, tipo: e.target.value as "compra" | "venda" })
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
                        className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                          formErrors.cripto ? "border-destructive" : "border-input"
                        }`}
                        value={novaOperacao.cripto}
                        onChange={(e) => {
                          setNovaOperacao({ ...novaOperacao, cripto: e.target.value });
                          setFormErrors((prev) => ({ ...prev, cripto: undefined }));
                        }}
                      >
                        {CRIPTOS_DISPONIVEIS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                        <option value="OUTRO">Outra (digitar)</option>
                      </select>
                      {novaOperacao.cripto === "OUTRO" && (
                        <Input
                          className={`mt-2 uppercase ${formErrors.cripto ? "border-destructive" : ""}`}
                          placeholder="Ex: KMNO, WIF, JUP..."
                          value={novaOperacao.criptoCustom}
                          onChange={(e) => {
                            setNovaOperacao({ ...novaOperacao, criptoCustom: e.target.value.toUpperCase() });
                            setFormErrors((prev) => ({ ...prev, cripto: undefined }));
                          }}
                        />
                      )}
                      {formErrors.cripto && (
                        <p className="text-xs text-destructive mt-1">{formErrors.cripto}</p>
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
                        className={formErrors.quantidade ? "border-destructive" : ""}
                        onChange={(e) => {
                          setNovaOperacao({ ...novaOperacao, quantidade: e.target.value });
                          setFormErrors((prev) => ({ ...prev, quantidade: undefined }));
                        }}
                      />
                      {formErrors.quantidade && (
                        <p className="text-xs text-destructive mt-1">{formErrors.quantidade}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="valorTotal">Valor Total (BRL)</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={novaOperacao.valorTotal}
                        className={formErrors.valorTotal ? "border-destructive" : ""}
                        onChange={(e) => {
                          setNovaOperacao({ ...novaOperacao, valorTotal: e.target.value });
                          setFormErrors((prev) => ({ ...prev, valorTotal: undefined }));
                        }}
                      />
                      {formErrors.valorTotal && (
                        <p className="text-xs text-destructive mt-1">{formErrors.valorTotal}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={novaOperacao.data}
                        className={formErrors.data ? "border-destructive" : ""}
                        onChange={(e) => {
                          setNovaOperacao({ ...novaOperacao, data: e.target.value });
                          setFormErrors((prev) => ({ ...prev, data: undefined }));
                        }}
                      />
                      {formErrors.data && (
                        <p className="text-xs text-destructive mt-1">{formErrors.data}</p>
                      )}
                    </div>

                    <div className="flex items-end gap-2">
                      <Button onClick={adicionarOperacao} className="flex-1" disabled={salvando}>
                        <Plus className="h-4 w-4 mr-2" />
                        {salvando ? "Salvando..." : "Adicionar"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setMostrarFormulario(false); setFormErrors({}); }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Operações */}
            {loadingData ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Carregando operações...
                  </div>
                </CardContent>
              </Card>
            ) : operacoes.length > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                      <span>Operações Registradas</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        ({operacoesFiltradas.length}{busca ? ` de ${operacoes.length}` : ""})
                      </span>
                    </CardTitle>
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filtrar por cripto, tipo..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                      {busca && (
                        <button
                          onClick={() => setBusca("")}
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {operacoesFiltradas.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma operação encontrada para &quot;{busca}&quot;
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {[...operacoesFiltradas]
                        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                        .map((op) => (
                          <div
                            key={op.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  op.tipo === "compra"
                                    ? "bg-green-500/10"
                                    : "bg-red-500/10"
                                }`}
                              >
                                {op.tipo === "compra" ? (
                                  <TrendingUp className="h-5 w-5 text-green-600" />
                                ) : (
                                  <TrendingDown className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">
                                    {op.tipo === "compra" ? "Compra" : "Venda"}{" "}
                                    <span className="font-bold">{op.cripto}</span>
                                  </p>
                                  {op.exchange && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                      {op.exchange}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatCrypto(op.quantidade)} {op.cripto} ·{" "}
                                  {new Date(op.data + "T12:00:00").toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatCurrency(op.valorTotal)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(op.precoUnitario)}/un
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removerOperacao(op.id)}
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* CTA Histórico */}
            {isLoggedIn && operacoes.length > 0 && (
              <Button
                variant="outline"
                className="w-full border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                asChild
              >
                <Link href="/historico">
                  <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                  Ver Histórico & Gráficos completos
                </Link>
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Resumo do Mês Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Vendas</span>
                  <span className="font-semibold text-sm">{formatCurrency(resumoMesAtual.totalVendas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limite de Isenção</span>
                  <span className="font-semibold text-sm">{formatCurrency(LIMITE_ISENCAO_MENSAL)}</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        resumoMesAtual.totalVendas > LIMITE_ISENCAO_MENSAL ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(100, (resumoMesAtual.totalVendas / LIMITE_ISENCAO_MENSAL) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.min(100, Math.round((resumoMesAtual.totalVendas / LIMITE_ISENCAO_MENSAL) * 100))}% do limite
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lucro/Prejuízo</span>
                  <span
                    className={`font-semibold text-sm ${
                      resumoMesAtual.lucroTotal >= 0 ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(resumoMesAtual.lucroTotal)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  {resumoMesAtual.isento ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Isento de IR</p>
                        <p className="text-xs mt-0.5">Vendas abaixo de R$ 35.000 no mês</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Imposto Devido</p>
                        <p className="text-xl font-bold mt-1">
                          {formatCurrency(resumoMesAtual.impostoDevido)}
                        </p>
                        <p className="text-xs mt-1">Vencimento: último dia útil do mês seguinte</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {resumosMensais.some((r) => r.impostoDevido > 0) && (
              <DarfModal resumosMensais={resumosMensais} />
            )}

            <PortfolioCard portfolio={resumoGeral.portfolio} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regras do IR</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <p className="font-medium text-foreground text-sm">Isenção</p>
                  <p className="text-xs mt-0.5">Vendas até R$ 35.000/mês são isentas</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <p className="font-medium text-foreground text-sm">Alíquotas</p>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    <li className="flex justify-between"><span>Até R$ 5M</span><span className="font-medium">15%</span></li>
                    <li className="flex justify-between"><span>R$ 5M a 10M</span><span className="font-medium">17,5%</span></li>
                    <li className="flex justify-between"><span>R$ 10M a 30M</span><span className="font-medium">20%</span></li>
                    <li className="flex justify-between"><span>Acima R$ 30M</span><span className="font-medium">22,5%</span></li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <p className="font-medium text-foreground text-sm">Vencimento</p>
                  <p className="text-xs mt-0.5">Último dia útil do mês seguinte à venda</p>
                </div>
                <Link
                  href="/legislacao"
                  className="text-primary text-sm hover:underline block text-center pt-1"
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
