"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  BarChart3,
  TrendingUp,
  DollarSign,
  LogOut,
  ArrowLeft,
  Calendar,
  Loader2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { calcularResumoGeral, calcularResumosMensais } from "@/lib/calculadora";
import { Operacao } from "@/lib/types";

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/perfil");
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

  const planoAtual = (session?.user as { plano?: string })?.plano ?? "gratis";
  const isPago = planoAtual === "pro" || planoAtual === "contador";

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      /* silencioso */
    } finally {
      setPortalLoading(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resumo = calcularResumoGeral(operacoes);
  const resumosMensais = calcularResumosMensais(operacoes);
  const mesesComImposto = resumosMensais.filter((r) => r.impostoDevido > 0);
  const totalImpostoPendente = mesesComImposto.reduce((acc, r) => acc + r.impostoDevido, 0);

  const anoAtual = new Date().getFullYear().toString();
  const resumosAnoAtual = resumosMensais.filter((r) => r.mes.startsWith(anoAtual));
  const impostoAnoAtual = resumosAnoAtual.reduce((acc, r) => acc + r.impostoDevido, 0);
  const vendasAnoAtual = resumosAnoAtual.reduce((acc, r) => acc + r.totalVendas, 0);

  const exchanges = [...new Set(operacoes.map((op) => op.exchange).filter(Boolean))];
  const primeiraOp = operacoes.length > 0
    ? [...operacoes].sort((a, b) => a.data.localeCompare(b.data))[0]
    : null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/calculadora">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Calculadora
              </Link>
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Minha Conta</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Dados do usuário */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold">{session?.user?.name || "Usuário"}</p>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-sm">{session?.user?.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Plano {planoAtual.charAt(0).toUpperCase() + planoAtual.slice(1)}</span>
              </div>
              <Badge variant={isPago ? "default" : "secondary"}>
                {planoAtual.charAt(0).toUpperCase() + planoAtual.slice(1)}
              </Badge>
            </div>

            {isPago ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Gerenciar Assinatura
              </Button>
            ) : (
              <Button variant="default" size="sm" className="w-full" asChild>
                <Link href="/precos">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Link>
              </Button>
            )}

            {primeiraOp && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Primeira operação:{" "}
                  {new Date(primeiraOp.data + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}

            {exchanges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exchanges.map((ex) => (
                  <Badge key={ex} variant="outline" className="text-xs">
                    {ex}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats gerais */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando dados...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Total de Operações</p>
                  <p className="text-2xl font-bold">{resumo.totalOperacoes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Total em Vendas</p>
                  <p className="text-xl font-bold">{formatCurrency(resumo.totalVendas)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Lucro Acumulado</p>
                  <p className={`text-xl font-bold ${resumo.lucroAcumulado >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {formatCurrency(resumo.lucroAcumulado)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1">Imposto Total</p>
                  <p className="text-xl font-bold text-amber-600">
                    {formatCurrency(resumo.impostoTotalDevido)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do ano atual */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5" />
                  Resumo {anoAtual}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Vendas no ano</span>
                  <span className="font-semibold">{formatCurrency(vendasAnoAtual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Imposto devido no ano</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(impostoAnoAtual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Meses com imposto a pagar</span>
                  <span className="font-semibold">
                    {resumosAnoAtual.filter((r) => r.impostoDevido > 0).length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Meses registrados</span>
                  <span className="font-semibold">{resumosAnoAtual.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Pendências */}
            {mesesComImposto.length > 0 && (
              <Card className="mb-6 border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-amber-600">
                    <DollarSign className="h-5 w-5" />
                    DARFs Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mesesComImposto.map((r) => (
                    <div key={r.mes} className="flex justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                      <span className="text-sm font-medium">
                        {r.mes.split("-")[1]}/{r.mes.split("-")[0]}
                      </span>
                      <span className="font-bold text-amber-600">
                        {formatCurrency(r.impostoDevido)}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-medium text-sm">Total pendente</span>
                    <span className="font-bold text-amber-600 text-lg">
                      {formatCurrency(totalImpostoPendente)}
                    </span>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" asChild>
                    <Link href="/calculadora">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Gerar DARFs na Calculadora
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Portfolio */}
            {resumo.portfolio.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Portfolio Atual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {resumo.portfolio.map((p) => (
                    <div key={p.cripto} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-semibold">{p.cripto}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 8 })} unid
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(p.custoTotal)}</p>
                        <p className="text-xs text-muted-foreground">
                          PM: {formatCurrency(p.precoMedio)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {operacoes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Nenhuma operação registrada ainda</p>
                <Button className="mt-4" asChild>
                  <Link href="/calculadora">Ir para Calculadora</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
