import { Upload, Cpu, FileCheck, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Importe suas operações",
    description:
      "Faça upload do CSV, PDF ou Excel (.xlsx) da sua exchange. Suportamos Binance, Mercado Bitcoin, Foxbit e mais.",
    gradient: "from-green-500 to-emerald-600",
    shadow: "shadow-green-500/30",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Processamento automático",
    description:
      "Nosso sistema calcula automaticamente o preço médio de aquisição, ganhos, perdas e o imposto devido.",
    gradient: "from-blue-500 to-cyan-600",
    shadow: "shadow-blue-500/30",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Revise os resultados",
    description:
      "Confira o relatório detalhado com todas as operações, lucros e o valor do imposto a pagar por mês.",
    gradient: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/30",
  },
  {
    number: "04",
    icon: Send,
    title: "Exporte o relatório",
    description:
      "No regime de ganho de capital: exporte no formato GCAP da Receita Federal e gere o DARF mensal. Para operações com possível enquadramento no regime de aplicações no exterior: gere o relatório anual para preenchimento da Declaração de Ajuste Anual do IRPF.",
    gradient: "from-orange-500 to-amber-600",
    shadow: "shadow-orange-500/30",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em apenas 4 passos simples você calcula todo o imposto devido sobre
            suas operações com criptomoedas.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Linha conectora com gradiente */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 via-purple-500 to-orange-500 opacity-30" />

            <div className="space-y-10">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 group">
                  {/* Ícone */}
                  <div className="flex-shrink-0 relative z-10">
                    <div
                      className={`flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg ${step.shadow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                    >
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground tracking-wider">
                        PASSO {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-200">
                      {step.title}
                    </h3>
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
