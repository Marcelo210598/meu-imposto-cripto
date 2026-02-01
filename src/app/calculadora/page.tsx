"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface Operacao {
  id: string;
  tipo: "compra" | "venda";
  cripto: string;
  quantidade: number;
  valorTotal: number;
  data: string;
}

interface Resumo {
  totalVendas: number;
  lucroTotal: number;
  impostoDevido: number;
  isento: boolean;
}

export default function CalculadoraPage() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [novaOperacao, setNovaOperacao] = useState({
    tipo: "compra" as "compra" | "venda",
    cripto: "BTC",
    quantidade: "",
    valorTotal: "",
    data: new Date().toISOString().split("T")[0],
  });

  const calcularResumo = (): Resumo => {
    const vendas = operacoes.filter((op) => op.tipo === "venda");
    const compras = operacoes.filter((op) => op.tipo === "compra");

    const totalVendas = vendas.reduce((acc, op) => acc + op.valorTotal, 0);
    const totalCompras = compras.reduce((acc, op) => acc + op.valorTotal, 0);

    // Cálculo simplificado - na prática precisa do preço médio por cripto
    const lucroTotal = totalVendas - totalCompras;
    const isento = totalVendas <= 35000;

    let impostoDevido = 0;
    if (!isento && lucroTotal > 0) {
      // Alíquota de 15% para ganhos até 5 milhões
      impostoDevido = lucroTotal * 0.15;
    }

    return {
      totalVendas,
      lucroTotal,
      impostoDevido,
      isento,
    };
  };

  const adicionarOperacao = () => {
    if (!novaOperacao.quantidade || !novaOperacao.valorTotal) return;

    const operacao: Operacao = {
      id: Date.now().toString(),
      tipo: novaOperacao.tipo,
      cripto: novaOperacao.cripto,
      quantidade: parseFloat(novaOperacao.quantidade),
      valorTotal: parseFloat(novaOperacao.valorTotal),
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
  };

  const removerOperacao = (id: string) => {
    setOperacoes(operacoes.filter((op) => op.id !== id));
  };

  const resumo = calcularResumo();

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
          <h1 className="ml-4 text-lg font-semibold">Calculadora de IR</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload CSV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Operações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste um arquivo CSV ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suportamos: Binance, Mercado Bitcoin, Foxbit
                  </p>
                  <Button variant="outline" className="mt-4" disabled>
                    Em breve
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Manual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Operação Manual
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
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="BNB">BNB</option>
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

                  <div className="flex items-end">
                    <Button onClick={adicionarOperacao} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Operações */}
            {operacoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Operações Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {operacoes.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {op.tipo === "compra" ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              {op.tipo === "compra" ? "Compra" : "Venda"} de{" "}
                              {op.quantidade} {op.cripto}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(op.data).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {formatCurrency(op.valorTotal)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerOperacao(op.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Vendas</span>
                  <span className="font-semibold">
                    {formatCurrency(resumo.totalVendas)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lucro/Prejuízo</span>
                  <span
                    className={`font-semibold ${
                      resumo.lucroTotal >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(resumo.lucroTotal)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  {resumo.isento ? (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-800">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Isento de IR</p>
                        <p className="text-sm">
                          Vendas abaixo de R$ 35.000 no mês
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Imposto Devido
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(resumo.impostoDevido)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regras do IR</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Isenção:</strong> Vendas até R$ 35.000/mês
                </p>
                <p>
                  <strong>Alíquota:</strong> 15% sobre ganho de capital
                </p>
                <p>
                  <strong>Vencimento:</strong> Último dia útil do mês seguinte
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
