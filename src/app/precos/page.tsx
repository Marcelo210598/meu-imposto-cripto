import Link from "next/link";
import { ArrowLeft, Check, Zap, Crown, Building2 } from "lucide-react";
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
      "Até 50 operações por ano",
      "Cálculo de preço médio",
      "Resumo mensal de IR",
      "Importação de CSV básica",
      "Dados salvos localmente",
    ],
    naoInclui: [
      "Exportação para PDF",
      "Suporte prioritário",
      "Múltiplas exchanges",
    ],
    cta: "Começar Grátis",
    ctaLink: "/calculadora",
  },
  {
    nome: "Pro",
    preco: "R$ 29",
    periodo: "/ano",
    descricao: "Para traders ativos",
    icon: Crown,
    destaque: true,
    features: [
      "Operações ilimitadas",
      "Cálculo de preço médio",
      "Resumo mensal de IR",
      "Importação de todas as exchanges",
      "Exportação para PDF e Excel",
      "Relatório para GCAP",
      "Histórico completo",
      "Suporte por email",
    ],
    naoInclui: [],
    cta: "Assinar Pro",
    ctaLink: "/calculadora",
  },
  {
    nome: "Contador",
    preco: "R$ 99",
    periodo: "/ano",
    descricao: "Para profissionais contábeis",
    icon: Building2,
    destaque: false,
    features: [
      "Tudo do plano Pro",
      "Múltiplos clientes",
      "Relatórios personalizados",
      "API de integração",
      "Suporte prioritário",
      "Treinamento incluso",
    ],
    naoInclui: [],
    cta: "Falar com Vendas",
    ctaLink: "/calculadora",
  },
];

export default function PrecosPage() {
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
          <h1 className="ml-4 text-lg font-semibold">Preços</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Planos simples e transparentes
            </h1>
            <p className="text-lg text-muted-foreground">
              Escolha o plano ideal para suas necessidades. Sem surpresas.
            </p>
          </div>

          {/* Planos */}
          <div className="grid md:grid-cols-3 gap-6">
            {planos.map((plano, idx) => (
              <Card
                key={idx}
                className={`relative overflow-hidden ${
                  plano.destaque
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
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
                    {plano.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plano.naoInclui.map((feature, featureIdx) => (
                      <li
                        key={`nao-${featureIdx}`}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                          —
                        </span>
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plano.destaque ? "default" : "outline"}
                  >
                    <Link href={plano.ctaLink}>{plano.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ de Preços */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Dúvidas sobre os planos
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Posso mudar de plano?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sim! Você pode fazer upgrade ou downgrade a qualquer momento.
                    O valor é ajustado proporcionalmente.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    O plano grátis tem limitações?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    O plano grátis permite até 50 operações por ano, suficiente
                    para a maioria dos investidores iniciantes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Como funciona o pagamento?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Aceitamos cartão de crédito e PIX. O pagamento é anual e você
                    pode cancelar a qualquer momento.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tem garantia?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sim! Oferecemos garantia de 7 dias. Se não gostar, devolvemos
                    100% do valor sem perguntas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center p-8 bg-primary/5 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Ainda não decidiu?</h3>
            <p className="text-muted-foreground mb-4">
              Comece grátis e faça upgrade quando precisar
            </p>
            <Button asChild size="lg">
              <Link href="/calculadora">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
