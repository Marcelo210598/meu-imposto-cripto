import {
  Upload,
  Calculator,
  FileText,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Importação Fácil",
    description:
      "Importe seus históricos de transações das principais exchanges brasileiras e internacionais via CSV ou API.",
  },
  {
    icon: Calculator,
    title: "Cálculo Automático",
    description:
      "Cálculo automático de preço médio, ganho/perda por operação e imposto devido seguindo as regras da RF.",
  },
  {
    icon: TrendingUp,
    title: "Múltiplas Criptos",
    description:
      "Suporte para Bitcoin, Ethereum, stablecoins e centenas de outras criptomoedas e tokens.",
  },
  {
    icon: Clock,
    title: "Histórico Completo",
    description:
      "Mantenha todo seu histórico de operações organizado por ano fiscal para fácil consulta.",
  },
  {
    icon: FileText,
    title: "Relatórios Prontos",
    description:
      "Gere relatórios detalhados prontos para importar no GCAP ou enviar para seu contador.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description:
      "Seus dados ficam armazenados de forma segura e criptografada. Você tem controle total.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para declarar suas criptos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas completas para calcular e organizar seus impostos sobre
            criptomoedas de forma simples e precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-background hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
