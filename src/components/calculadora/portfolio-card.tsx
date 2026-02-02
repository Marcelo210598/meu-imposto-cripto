"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioCripto } from "@/lib/types";
import { formatCurrency, formatCrypto } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface PortfolioCardProps {
  portfolio: PortfolioCripto[];
}

const CRIPTO_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  BNB: "🔶",
  USDT: "$",
  USDC: "$",
};

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  if (portfolio.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5" />
            Seu Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Adicione operações de compra para ver seu portfolio
          </p>
        </CardContent>
      </Card>
    );
  }

  const valorTotal = portfolio.reduce(
    (acc, p) => acc + p.quantidade * p.precoMedio,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5" />
          Seu Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {portfolio.map((p) => (
          <div
            key={p.cripto}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-lg">
                {CRIPTO_ICONS[p.cripto] || p.cripto.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{p.cripto}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCrypto(p.quantidade)} unidades
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(p.custoTotal)}</p>
              <p className="text-sm text-muted-foreground">
                PM: {formatCurrency(p.precoMedio)}
              </p>
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Custo Total de Aquisição</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(valorTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
