"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign,
  AlertCircle, Trash2, AlertTriangle, CheckCircle, FileDown,
  CloudUpload, Lock, FileText, Search, X, BarChart2, Activity,
  Link2, Globe, Building2, Info,
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
import { Operacao, LIMITE_ISENCAO_MENSAL, LIMITE_REPORTE_EXTERIOR } from "@/lib/types";
import { salvarOperacoes, carregarOperacoes, limparOperacoes } from "@/lib/storage";
import {
  calcularResumoGeral,
  calcularResumosMensais,
  calcularResumosAnuaisExterior,
} from "@/lib/calculadora";
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
  tipoExchange?: string;
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
    exchange: "",
    tipoExchange: "" as "" | "nacional" | "estrangeira",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [confirmLimparOpen, setConfirmLimparOpen] = useState(false);
  const [limpando, setLimpando] = useState(false);
  const [bannerMPFechado, setBannerMPFechado] = useState(false);
  const [showBinanceModal, setShowBinanceModal] = useState(false);

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

    if (!novaOperacao.tipoExchange)
      errors.tipoExchange = "Selecione o tipo de corretora";

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
      exchange: novaOperacao.exchange.trim() || undefined,
      tipoExchange: novaOperacao.tipoExchange as "nacional" | "estrangeira",
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
      exchange: "", tipoExchange: "",
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

  const resumoGeral            = calcularResumoGeral(operacoes);
  const resumosMensais         = calcularResumosMensais(operacoes);
  const resumosAnuaisExterior  = calcularResumosAnuaisExterior(operacoes);
  const temOperacoesExterior   = resumosAnuaisExterior.length > 0;

  const mesAtual = new Date().toISOString().substring(0, 7);
  const resumoMesAtual = resumosMensais.find((r) => r.mes === mesAtual) || {
    totalVendas: 0, lucroTotal: 0, impostoDevido: 0, isento: true,
    temDayTrade: false, prejuizoCompensado: 0,
  };

  // Alerta R$30k: calcula total de vendas em exchanges estrangeiras por mês
  const alertaExteriorMes = (() => {
    const mesesExterior = new Map<string, number>();
    for (const op of operacoes) {
      if (op.tipo !== "venda") continue;
      const regime = op.tipoExchange ?? (
        op.exchange?.toLowerCase().includes("binance") ||
        ["bybit","coinbase","kraken","okx","kucoin","gate.io","mexc","bitget","bingx","gemini","htx","huobi","nexo","deribit","poloniex"].some(
          e => op.exchange?.toLowerCase().includes(e)
        ) ? "estrangeira" : "nacional"
      );
      if (regime !== "estrangeira") continue;
      const mes = op.data.substring(0, 7);
      mesesExterior.set(mes, (mesesExterior.get(mes) ?? 0) + op.valorTotal);
    }
    // Retorna o mês mais recente que ultrapassou R$30k
    const mesesAcima = Array.from(mesesExterior.entries())
      .filter(([, total]) => total > LIMITE_REPORTE_EXTERIOR)
      .sort((a, b) => b[0].localeCompare(a[0]));
    return mesesAcima[0] ?? null;
  })();

  const atingiuLimite = !isLoggedIn && operacoes.length >= LIMITE_FREE;

  const operacoesFiltradas = busca.trim()
    ? operacoes.filter(
        (op) =>
          op.cripto.toLowerCase().includes(busca.toLowerCase()) ||
          op.tipo.includes(busca.toLowerCase()) ||
          op.exchange?.toLowerCase().includes(busca.toLowerCase())
      )
    : operacoes;

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
      label: temOperacoesExterior ? "Imposto BR (mensal)" : "Imposto Total Devido",
      value: formatCurrency(resumoGeral.impostoTotalDevido),
      icon: DollarSign,
      bg: "bg-primary/10",
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dialog — Binance ambígua */}
      <Dialog open={showBinanceModal} onOpenChange={setShowBinanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Qual Binance você utilizou?
            </DialogTitle>
            <DialogDescription className="pt-2 text-left space-y-2">
              <span className="block">
                A Binance possui <strong>duas operações distintas no Brasil</strong>, com regimes tributários diferentes:
              </span>
              <span className="block pl-2 border-l-2 border-green-400 text-xs">
                <strong>Binance Brasil (Capitual/Latam)</strong> — possui CNPJ no Brasil.
                Aplica-se isenção de R$35k/mês e DARF mensal.
              </span>
              <span className="block pl-2 border-l-2 border-purple-400 text-xs">
                <strong>Binance Global (binance.com)</strong> — não possui CNPJ no Brasil — pode se enquadrar no regime de aplicações no exterior (15% sobre resultado anual, conforme Lei 14.754/2023).
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={() => {
                setNovaOperacao((prev) => ({ ...prev, tipoExchange: "nacional" }));
                setFormErrors((prev) => ({ ...prev, tipoExchange: undefined }));
                setShowBinanceModal(false);
              }}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Binance Brasil
            </Button>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              onClick={() => {
                setNovaOperacao((prev) => ({ ...prev, tipoExchange: "estrangeira" }));
                setFormErrors((prev) => ({ ...prev, tipoExchange: undefined }));
                setShowBinanceModal(false);
              }}
            >
              <Globe className="h-4 w-4 mr-2" />
              Binance Global
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {isLoggedIn && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/exchanges">
                  <Link2 className="h-4 w-4 mr-2" />
                  Exchanges
                </Link>
              </Button>
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

        {/* Banner MP 1.303/2025 */}
        {!bannerMPFechado && (
          <div className="mb-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-blue-800 dark:text-blue-300">
                  MP 1.303/2025 — verifique a situação legislativa
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                  A Medida Provisória propôs fim da isenção de R$ 35.000 e alíquota única de 17,5%.
                  A situação legislativa da MP 1.303/2025 deve ser verificada conforme o desfecho normativo efetivamente ocorrido.
                </p>
              </div>
            </div>
            <button
              onClick={() => setBannerMPFechado(true)}
              className="text-blue-400 hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Banner: usuário free logado */}
        {isLoggedIn && (session?.user as { plano?: string })?.plano === "gratis" && status !== "loading" && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-4 flex-wrap animate-fade-in">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  Você está usando <span className="text-amber-600 font-bold">{operacoes.length}/{LIMITE_FREE}</span> operações
                </p>
                <div className="mt-1.5 w-full bg-amber-500/10 rounded-full h-1.5 max-w-xs">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((operacoes.length / LIMITE_FREE) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-white flex-shrink-0">
              <Link href="/precos">Ver plano Pro</Link>
            </Button>
          </div>
        )}

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

        {/* Alerta R$30k exchanges estrangeiras */}
        {alertaExteriorMes && (
          <div className="mb-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-orange-800 dark:text-orange-300">
                Obrigação acessória — operações com criptoativos
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                Você movimentou{" "}
                <strong>{formatCurrency(alertaExteriorMes[1])}</strong> em operações com criptoativos em{" "}
                <strong>
                  {new Date(alertaExteriorMes[0] + "-15").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </strong>.
                {" "}Por superar R$ 30.000, pode haver obrigação de reporte via{" "}
                <a
                  href="https://cav.receita.fazenda.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-orange-900 dark:hover:text-orange-200"
                >
                  e-CAC
                </a>{" "}
                até o último dia do mês seguinte (IN 1.888/2019). Essa obrigação pode alcançar também operações fora de exchange, quando aplicável.
              </p>
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

        {/* Card extra: imposto exterior, se houver */}
        {temOperacoesExterior && resumoGeral.impostoTotalExterior > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-4 animate-fade-in">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Imposto Estimado — Operações com instituição/custódia no exterior</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(resumoGeral.impostoTotalExterior)}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground hidden sm:block">
              <p>15% (Lei 14.754/2023) · apuração anual</p>
              <p>Lei 14.754/2023</p>
            </div>
          </div>
        )}

        {/* Alerta DeCripto — IN 2.291/2025 */}
        {temOperacoesExterior && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3 animate-fade-in">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-blue-800 dark:text-blue-300">
                Nova obrigação — DeCripto a partir de 01/07/2026
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                A partir de julho de 2026, exchanges estrangeiras e outras instituições podem ser obrigadas a reportar
                operações pela <strong>DeCripto</strong> (Declaração de Criptoativos no Exterior), conforme{" "}
                <strong>IN RFB 2.291/2025</strong>. Até lá, continuam válidas as regras atuais de reporte via e-CAC (IN 1.888/2019).
              </p>
            </div>
          </div>
        )}

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

                    {/* Tipo de exchange — campo obrigatório para definir regime tributário */}
                    <div className="sm:col-span-2">
                      <Label htmlFor="tipoExchange" className="flex items-center gap-1.5">
                        Corretora / Exchange
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNovaOperacao({ ...novaOperacao, tipoExchange: "nacional" });
                            setFormErrors((prev) => ({ ...prev, tipoExchange: undefined }));
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                            novaOperacao.tipoExchange === "nacional"
                              ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300"
                              : "border-input hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                          }`}
                        >
                          <Building2 className={`h-5 w-5 flex-shrink-0 ${novaOperacao.tipoExchange === "nacional" ? "text-green-600" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium text-sm">Brasileira</p>
                            <p className="text-xs opacity-70">CNPJ no Brasil — Mercado Bitcoin, Foxbit, Novadax...</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNovaOperacao({ ...novaOperacao, tipoExchange: "estrangeira" });
                            setFormErrors((prev) => ({ ...prev, tipoExchange: undefined }));
                          }}
                          className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                            novaOperacao.tipoExchange === "estrangeira"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300"
                              : "border-input hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20"
                          }`}
                        >
                          <Globe className={`h-5 w-5 flex-shrink-0 ${novaOperacao.tipoExchange === "estrangeira" ? "text-purple-600" : "text-muted-foreground"}`} />
                          <div>
                            <p className="font-medium text-sm">Estrangeira</p>
                            <p className="text-xs opacity-70">Plataformas no exterior — Binance global, Bybit, Coinbase...</p>
                          </div>
                        </button>
                      </div>
                      {novaOperacao.tipoExchange === "estrangeira" && (
                        <div className="mt-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-700 dark:text-purple-400">
                          <strong>Binance:</strong> selecione Estrangeira se usou a plataforma global (binance.com).
                          Selecione Brasileira apenas se usou Binance Pay Brasil com CNPJ nacional.
                        </div>
                      )}
                      {formErrors.tipoExchange && (
                        <p className="text-xs text-destructive mt-1">{formErrors.tipoExchange}</p>
                      )}
                    </div>

                    {/* Nome da exchange (opcional) */}
                    <div>
                      <Label htmlFor="exchange">Nome da Exchange <span className="text-muted-foreground">(opcional)</span></Label>
                      <Input
                        id="exchange"
                        placeholder="Ex: Binance, Bybit, Mercado Bitcoin..."
                        value={novaOperacao.exchange}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNovaOperacao((prev) => ({ ...prev, exchange: val }));
                          if (val.toLowerCase().includes("binance")) {
                            setShowBinanceModal(true);
                          }
                        }}
                      />
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
                          const v = e.target.value;
                          setNovaOperacao({ ...novaOperacao, quantidade: v });
                          const n = parseFloat(v);
                          if (v && !isNaN(n) && n > 0)
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
                          const v = e.target.value;
                          setNovaOperacao({ ...novaOperacao, valorTotal: v });
                          const n = parseFloat(v);
                          if (v && !isNaN(n) && n > 0)
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
                                  {op.tipoExchange === "estrangeira" && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                      exterior
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

            {/* Resumo Mensal — Regime Nacional */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Regime Nacional — Mês Atual
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
                <div className="border-t pt-4 space-y-2">
                  {/* Alerta Day Trade */}
                  {"temDayTrade" in resumoMesAtual && resumoMesAtual.temDayTrade && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs">Day Trade detectado</p>
                        <p className="text-[11px] mt-0.5">Sem isenção R$35k no regime de ganho de capital · Tabela progressiva (15–22,5%)</p>
                      </div>
                    </div>
                  )}
                  {/* Compensação de prejuízo */}
                  {"prejuizoCompensado" in resumoMesAtual && (resumoMesAtual.prejuizoCompensado ?? 0) > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs">Prejuízo compensado</p>
                        <p className="text-[11px] mt-0.5">
                          {formatCurrency(resumoMesAtual.prejuizoCompensado ?? 0)} deduzidos de meses anteriores
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Status do imposto */}
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
                        <p className="text-xs mt-1">DARF 4600 · último dia útil do mês seguinte</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo Anual — Regime de aplicações no exterior */}
            {temOperacoesExterior && resumosAnuaisExterior.map((r) => (
              <Card key={r.ano} className="border border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    Regime de aplicações no exterior — {r.ano}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Vendido</span>
                    <span className="font-semibold text-sm">{formatCurrency(r.totalVendas)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lucro Líquido Anual</span>
                    <span className={`font-semibold text-sm ${r.lucroLiquidoAnual > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                      {formatCurrency(r.lucroLiquidoAnual)}
                    </span>
                  </div>
                  {r.prejuizoAcumuladoRestante > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Prejuízo do ano</span>
                      <span className="font-semibold text-sm text-destructive">
                        -{formatCurrency(r.prejuizoAcumuladoRestante)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    {r.impostoEstimado > 0 ? (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                        <DollarSign className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Imposto Estimado</p>
                          <p className="text-xl font-bold mt-1">{formatCurrency(r.impostoEstimado)}</p>
                          <p className="text-xs mt-1">15% (Lei 14.754/2023) · pago na declaração anual (não DARF)</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Sem imposto no exterior</p>
                          <p className="text-xs mt-0.5">Sem lucro líquido positivo em {r.ano}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center pt-1">
                    Lei 14.754/2023 · isenção de R$ 35.000 não se aplica neste regime · apuração anual
                  </p>
                </CardContent>
              </Card>
            ))}

            {resumosMensais.some((r) => r.impostoDevido > 0) && (
              <DarfModal resumosMensais={resumosMensais} />
            )}

            <PortfolioCard portfolio={resumoGeral.portfolio} />

            {/* Regras do IR */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regras do IR</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    Corretoras Brasileiras (regime de ganho de capital)
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    <li>Isenção: vendas até R$ 35.000/mês</li>
                    <li>Apuração mensal · DARF código 4600</li>
                    <li>Vencimento: último dia útil do mês seguinte</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="font-medium text-orange-800 dark:text-orange-300 text-sm">Day Trade (cripto — regime de ganho de capital)</p>
                  <p className="text-xs mt-0.5 text-orange-700 dark:text-orange-400">
                    Isenção de R$ 35.000 não se aplica neste regime · Tabela progressiva 15–22,5%
                    <br />
                    <span className="opacity-80">⚠️ Alíquota de 20% fixo é da bolsa — não se aplica a cripto</span>
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground text-sm">Alíquotas progressivas (BR)</p>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    <li className="flex justify-between"><span>Até R$ 5M</span><span className="font-medium">15%</span></li>
                    <li className="flex justify-between"><span>R$ 5M a 10M</span><span className="font-medium">17,5%</span></li>
                    <li className="flex justify-between"><span>R$ 10M a 30M</span><span className="font-medium">20%</span></li>
                    <li className="flex justify-between"><span>Acima R$ 30M</span><span className="font-medium">22,5%</span></li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="font-medium text-purple-800 dark:text-purple-300 text-sm flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    Operações com instituição/custódia no exterior
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-purple-700 dark:text-purple-400">
                    <li>Isenção de R$ 35.000 não se aplica neste regime</li>
                    <li>15% sobre lucro líquido anual (conforme Lei 14.754/2023, quando aplicável)</li>
                    <li>Apuração anual (declaração de IR)</li>
                    <li>Em regra, pode se enquadrar na Lei 14.754/2023 + IN RFB 2.180/2024</li>
                  </ul>
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
