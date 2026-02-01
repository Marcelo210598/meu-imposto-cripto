import Link from "next/link";
import { ArrowRight, Shield, Zap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Shield className="h-4 w-4" />
            100% de acordo com a Receita Federal
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Calcule seu{" "}
            <span className="text-primary">Imposto de Renda</span> sobre Cripto
            em minutos
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Importe suas operações, calcule automaticamente ganhos e perdas, e
            saiba exatamente quanto você deve pagar de IR. Simples, rápido e
            preciso.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="xl" asChild>
              <Link href="/calculadora">
                Começar Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#how-it-works">Ver Como Funciona</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">R$ 35 mil</div>
              <div className="text-sm text-muted-foreground">
                Limite de isenção mensal
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">15-22.5%</div>
              <div className="text-sm text-muted-foreground">
                Alíquotas progressivas
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">
                Dados seguros e privados
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
