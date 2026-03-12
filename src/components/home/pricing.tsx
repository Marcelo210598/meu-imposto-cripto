"use client";

import Link from "next/link";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const planos = [
  {
    nome: "Grátis",
    preco: "R$ 0",
    periodo: "para sempre",
    descricao: "Para quem está começando",
    icon: Zap,
    destaque: false,
    features: [
      "Até 50 operações",
      "Cálculo de preço médio",
      "Resumo mensal de IR",
      "Importação de CSV básica",
      "Dados salvos na nuvem",
    ],
    cta: "Começar Grátis",
    href: "/calculadora",
  },
  {
    nome: "Pro",
    preco: "R$ 29",
    periodo: "/mês",
    descricao: "Para traders ativos",
    icon: Crown,
    destaque: true,
    features: [
      "Operações ilimitadas",
      "Cálculo de preço médio",
      "Resumo mensal de IR",
      "Importação de todas as exchanges",
      "Exportação para PDF",
      "Relatório para GCAP",
      "Histórico completo",
      "Suporte por email",
    ],
    cta: "Assinar Pro",
    href: "/precos",
  },
  {
    nome: "Contador",
    preco: "R$ 99",
    periodo: "/mês",
    descricao: "Para contadores e assessores",
    icon: Building2,
    destaque: false,
    features: [
      "Tudo do plano Pro",
      "Suporte prioritário via WhatsApp",
      "Configuração assistida inicial",
      "Acesso antecipado a novas funcionalidades",
      "Relatórios personalizados para clientes",
    ],
    cta: "Assinar Contador",
    href: "/precos",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Planos e Preços
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transparente do começo ao fim
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Comece grátis, sem cartão. Faça upgrade só quando precisar de mais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {planos.map((plano) => (
            <Card
              key={plano.nome}
              className={`relative overflow-hidden transition-all duration-200 ${
                plano.destaque
                  ? "border-primary shadow-lg scale-105"
                  : "border-border hover:border-primary/40 hover:shadow-md"
              }`}
            >
              {plano.destaque && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                      plano.destaque ? "bg-primary" : "bg-primary/10"
                    }`}
                  >
                    <plano.icon
                      className={`h-5 w-5 ${
                        plano.destaque ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <CardTitle>{plano.nome}</CardTitle>
                </div>
                <CardDescription>{plano.descricao}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plano.preco}</span>
                  <span className="text-muted-foreground">{plano.periodo}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plano.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full"
                  variant={plano.destaque ? "default" : "outline"}
                >
                  <Link href={plano.href}>{plano.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Garantia de 7 dias. Cancele quando quiser. Sem perguntas.
        </p>
      </div>
    </section>
  );
}
