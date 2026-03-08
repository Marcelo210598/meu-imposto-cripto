"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Link2, Link2Off, RefreshCw, Trash2, Plus,
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Shield,
  Clock, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── tipos ────────────────────────────────────────────────────────────────────

interface ExchangeConnection {
  id: string;
  exchange: string;
  label: string | null;
  apiKey: string;
  lastSyncAt: string | null;
  lastSyncOps: number | null;
  createdAt: string;
}

interface SyncResult {
  importadas: number;
  jaExistiam: number;
  paresComTrades: string[];
  limitadoPorPlano?: boolean;
  mensagem: string;
}

// ─── exchanges suportadas ─────────────────────────────────────────────────────

const EXCHANGES_SUPORTADAS = [
  {
    id: "binance",
    nome: "Binance",
    descricao: "Maior exchange do mundo — BRL e USDT",
    cor: "bg-yellow-500/10 border-yellow-500/30",
    iconBg: "bg-yellow-500",
    instrucoes: "https://www.binance.com/pt-BR/support/faq/como-criar-api-360002502072",
    passos: [
      "Acesse Binance → Perfil → Gerenciamento de API",
      "Clique em \"Criar API\" → escolha \"Chave de sistema\"",
      "Habilite apenas \"Habilitar Leitura\" (nunca habilite saque!)",
      "Copie a API Key e o Secret Key",
    ],
  },
];

// ─── componente principal ─────────────────────────────────────────────────────

export default function ExchangesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session?.user?.id;

  const [conexoes, setConexoes] = useState<ExchangeConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Modal de conexão
  const [modalAberto, setModalAberto] = useState(false);
  const [exchangeSelecionada, setExchangeSelecionada] = useState("binance");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [label, setLabel] = useState("");
  const [conectando, setConectando] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/exchanges");
  }, [status, router]);

  const carregarConexoes = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/exchanges");
      if (res.ok) setConexoes(await res.json());
    } catch {
      toast.error("Erro ao carregar conexões");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (status !== "loading") carregarConexoes();
  }, [status, carregarConexoes]);

  // ─── conectar exchange ──────────────────────────────────────────────────────

  const handleConectar = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Preencha a API Key e o Secret Key");
      return;
    }
    setConectando(true);
    try {
      const res = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange: exchangeSelecionada,
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          label: label.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao conectar exchange");
        return;
      }

      toast.success("Exchange conectada com sucesso!");
      setModalAberto(false);
      setApiKey("");
      setApiSecret("");
      setLabel("");
      await carregarConexoes();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setConectando(false);
    }
  };

  // ─── sincronizar ────────────────────────────────────────────────────────────

  const handleSync = async (conexao: ExchangeConnection) => {
    setSyncing(conexao.id);
    setSyncResult(null);
    try {
      const res = await fetch(`/api/exchanges/${conexao.id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.status === 403 && data.upgrade) {
        toast.error(data.error, {
          action: { label: "Ver planos", onClick: () => router.push("/precos") },
          duration: 8000,
        });
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao sincronizar");
        return;
      }

      setSyncResult(data);
      await carregarConexoes();

      if (data.importadas > 0) {
        toast.success(`${data.importadas} operações importadas!`);
      } else {
        toast.info("Nenhuma operação nova encontrada.");
      }
    } catch {
      toast.error("Erro de conexão ao sincronizar.");
    } finally {
      setSyncing(null);
    }
  };

  // ─── remover conexão ────────────────────────────────────────────────────────

  const handleRemover = async (id: string) => {
    setRemovendo(id);
    try {
      const res = await fetch(`/api/exchanges?id=${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Erro ao remover conexão"); return; }
      toast.success("Conexão removida");
      setConexoes((prev) => prev.filter((c) => c.id !== id));
      if (syncResult) setSyncResult(null);
    } catch {
      toast.error("Erro ao remover conexão");
    } finally {
      setRemovendo(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const exchangeAtual = EXCHANGES_SUPORTADAS.find((e) => e.id === exchangeSelecionada)!;
  const conexaoBinance = conexoes.find((c) => c.exchange === "binance");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calculadora">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Calculadora
              </Link>
            </Button>
            <div className="flex items-center gap-2 border-l pl-3">
              <Link2 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Exchanges Conectadas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

        {/* Aviso de segurança */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 animate-fade-in">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Suas chaves estão seguras</p>
            <p className="text-xs leading-relaxed">
              Os API Secrets são criptografados com AES-256-GCM antes de serem salvos. Nunca habilitamos
              permissões de saque — use apenas <strong>leitura</strong> ao criar a API Key na exchange.
            </p>
          </div>
        </div>

        {/* Lista de exchanges suportadas */}
        <div className="space-y-4">
          {EXCHANGES_SUPORTADAS.map((ex) => {
            const conexao = conexoes.find((c) => c.exchange === ex.id);
            const isSyncing = syncing === conexao?.id;
            const isRemoving = removendo === conexao?.id;

            return (
              <Card key={ex.id} className={`border ${conexao ? "border-green-500/30 bg-green-500/5" : ""} animate-fade-in-up`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${ex.iconBg} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">
                          {ex.nome.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          {ex.nome}
                          {conexao ? (
                            <span className="flex items-center gap-1 text-xs font-normal text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Conectada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                              <Link2Off className="h-3.5 w-3.5" />
                              Não conectada
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs">{ex.descricao}</CardDescription>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      {conexao ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSync(conexao)}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sincronizando...</>
                            ) : (
                              <><RefreshCw className="h-4 w-4 mr-2" />Sincronizar</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemover(conexao.id)}
                            disabled={isRemoving}
                            className="text-destructive hover:text-destructive"
                          >
                            {isRemoving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { setExchangeSelecionada(ex.id); setModalAberto(true); }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Info da conexão ativa */}
                {conexao && (
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="text-xs text-muted-foreground mb-1">API Key</p>
                        <p className="font-mono text-xs truncate">{conexao.apiKey.slice(0, 8)}••••••••</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Último sync
                        </p>
                        <p className="text-xs font-medium">
                          {conexao.lastSyncAt
                            ? new Date(conexao.lastSyncAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Nunca sincronizado"}
                        </p>
                      </div>
                    </div>
                    {conexao.lastSyncOps !== null && conexao.lastSyncOps >= 0 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <BarChart2 className="h-3.5 w-3.5" />
                        Último sync importou <strong>{conexao.lastSyncOps}</strong> operações novas
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Resultado do último sync */}
        {syncResult && (
          <Card className="animate-fade-in border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                {syncResult.importadas > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <p className="font-semibold text-sm">{syncResult.mensagem}</p>
              </div>

              {syncResult.paresComTrades.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Pares com trades encontrados:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {syncResult.paresComTrades.map((par) => (
                      <span key={par} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
                        {par}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {syncResult.limitadoPorPlano && (
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Limite do plano Grátis atingido. Algumas operações não foram importadas.{" "}
                    <Link href="/precos" className="underline font-medium">Fazer upgrade →</Link>
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button size="sm" asChild>
                  <Link href="/calculadora">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Ver na Calculadora
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSyncResult(null)}>
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exchanges em breve */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Em breve</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {["Mercado Bitcoin", "Bybit", "OKX", "Foxbit", "Coinbase", "Kraken"].map((nome) => (
              <div key={nome} className="p-3 rounded-xl border border-dashed border-muted-foreground/25 flex items-center gap-2 text-muted-foreground">
                <Link2Off className="h-4 w-4" />
                <span className="text-sm">{nome}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal — conectar exchange */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar {exchangeAtual.nome}</DialogTitle>
            <DialogDescription>
              Cole sua API Key e Secret Key abaixo. Usamos apenas permissão de leitura.
            </DialogDescription>
          </DialogHeader>

          {/* Instruções */}
          <div className="p-3 rounded-lg bg-muted text-xs space-y-1.5">
            <p className="font-semibold text-foreground mb-2">Como criar a API Key:</p>
            {exchangeAtual.passos.map((passo, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex-shrink-0 font-bold text-primary">{i + 1}.</span>
                <span className="text-muted-foreground">{passo}</span>
              </div>
            ))}
            <a
              href={exchangeAtual.instrucoes}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline pt-1"
            >
              <ExternalLink className="h-3 w-3" />
              Tutorial oficial da {exchangeAtual.nome}
            </a>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Cole sua API Key aqui"
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="apiSecret">Secret Key</Label>
              <Input
                id="apiSecret"
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Cole seu Secret Key aqui"
                className="font-mono text-sm mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Criptografado com AES-256 antes de salvar.
              </p>
            </div>
            <div>
              <Label htmlFor="label">Apelido (opcional)</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Conta principal"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={conectando}>
              Cancelar
            </Button>
            <Button onClick={handleConectar} disabled={conectando}>
              {conectando ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verificando...</>
              ) : (
                <><Link2 className="h-4 w-4 mr-2" />Conectar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
