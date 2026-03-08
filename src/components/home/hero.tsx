import Link from "next/link";
import { ArrowRight, Shield, Zap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Calculator, value: "R$ 35 mil", label: "Limite de isenção mensal" },
  { icon: Zap,        value: "15–22,5%",  label: "Alíquotas progressivas"  },
  { icon: Shield,     value: "100%",       label: "Dados seguros e privados" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-400/8 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-cyan-400/5 rounded-full blur-3xl animate-float delay-500" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            100% de acordo com a Receita Federal
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up delay-100">
            Calcule seu{" "}
            <span className="gradient-text">Imposto de Renda</span>
            {" "}sobre Cripto em minutos
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Importe suas operações, calcule automaticamente ganhos e perdas, e
            saiba exatamente quanto você deve pagar de IR. Simples, rápido e preciso.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up delay-300">
            <Button
              size="xl"
              asChild
              className="shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
            >
              <Link href="/calculadora">
                Começar Grátis
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="hover:bg-primary/5 transition-colors">
              <Link href="#how-it-works">Ver Como Funciona</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up delay-400">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center group cursor-default">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/20">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
