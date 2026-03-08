import { Upload, Calculator, FileText, TrendingUp, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Importação Fácil",
    description:
      "Importe históricos de transações via CSV, PDF ou Excel (.xlsx) das principais exchanges brasileiras e internacionais.",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconCls: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-500/10 group-hover:bg-green-500/20",
  },
  {
    icon: Calculator,
    title: "Cálculo Automático",
    description:
      "Cálculo automático de preço médio, ganho/perda por operação e imposto devido seguindo as regras da Receita Federal.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconCls: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Múltiplas Criptos",
    description:
      "Suporte para Bitcoin, Ethereum, stablecoins e centenas de outras criptomoedas e tokens com detecção automática.",
    gradient: "from-purple-500/10 to-violet-500/10",
    iconCls: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
  },
  {
    icon: Clock,
    title: "Histórico Completo",
    description:
      "Mantenha todo seu histórico de operações organizado por mês e ano fiscal com gráficos de evolução.",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconCls: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
  },
  {
    icon: FileText,
    title: "Relatórios Prontos",
    description:
      "Gere relatórios detalhados prontos para importar no GCAP ou enviar para seu contador em segundos.",
    gradient: "from-teal-500/10 to-green-500/10",
    iconCls: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10 group-hover:bg-teal-500/20",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description:
      "Seus dados ficam armazenados de forma segura e criptografada com backups automáticos. Você tem controle total.",
    gradient: "from-red-500/10 to-rose-500/10",
    iconCls: "text-red-500 dark:text-red-400",
    iconBg: "bg-red-500/10 group-hover:bg-red-500/20",
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
              className="bg-background border hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden relative"
            >
              {/* gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
              <CardHeader className="relative">
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-xl ${feature.iconBg} mb-4 transition-all duration-300 group-hover:scale-110`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconCls} transition-colors duration-300`} />
                </div>
                <CardTitle className="text-xl group-hover:text-foreground transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
