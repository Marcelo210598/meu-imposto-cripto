import { Upload, Cpu, FileCheck, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Importe suas operações",
    description:
      "Faça upload do CSV da sua exchange ou conecte via API. Suportamos Binance, Mercado Bitcoin, Foxbit e mais.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Processamento automático",
    description:
      "Nosso sistema calcula automaticamente o preço médio de aquisição, ganhos, perdas e o imposto devido.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Revise os resultados",
    description:
      "Confira o relatório detalhado com todas as operações, lucros e o valor do imposto a pagar por mês.",
  },
  {
    number: "04",
    icon: Send,
    title: "Exporte para o GCAP",
    description:
      "Baixe o relatório no formato aceito pelo programa GCAP da Receita Federal ou envie para seu contador.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples você calcula todo o imposto devido sobre
            suas operações com criptomoedas.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Linha conectora (desktop) */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-border" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6">
                  {/* Número e ícone */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary text-primary-foreground">
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary">
                        Passo {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
