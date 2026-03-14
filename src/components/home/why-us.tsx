import { Check, X, Minus } from "lucide-react";

const features = [
  "Legislação 100% brasileira (DARF, GCAP, isenção R$ 35k)",
  "Distinção regime nacional × regime exterior",
  "Importação CSV, PDF e XLSX das exchanges BR",
  "Cálculo automático de preço médio",
  "Exportação no formato GCAP da Receita Federal",
  "Assistente de IA especializado em IR cripto BR",
  "Grátis para começar (até 50 operações)",
  "Interface em português com suporte em PT-BR",
];

type Status = "yes" | "no" | "partial";

const comparativo: { label: string; nos: Status; koinly: Status; planilha: Status }[] = [
  { label: "Legislação 100% brasileira (DARF, GCAP, isenção R$ 35k)", nos: "yes", koinly: "partial", planilha: "no" },
  { label: "Distinção regime nacional × regime exterior",              nos: "yes", koinly: "partial", planilha: "no" },
  { label: "Importação CSV, PDF e XLSX das exchanges BR",              nos: "yes", koinly: "partial", planilha: "no" },
  { label: "Cálculo automático de preço médio",                        nos: "yes", koinly: "yes",     planilha: "no" },
  { label: "Exportação no formato GCAP da Receita Federal",            nos: "yes", koinly: "no",      planilha: "no" },
  { label: "Assistente de IA especializado em IR cripto BR",           nos: "yes", koinly: "no",      planilha: "no" },
  { label: "Grátis para começar",                                      nos: "yes", koinly: "no",      planilha: "yes" },
  { label: "Interface e suporte em português",                         nos: "yes", koinly: "no",      planilha: "partial" },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "yes")
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
      </span>
    );
  if (status === "partial")
    return (
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/40">
        <Minus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-100 dark:bg-rose-900/40">
      <X className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" strokeWidth={2.5} />
    </span>
  );
}

export function WhyUs() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Por que escolher
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Feito para o Brasil, do zero
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ferramentas internacionais não entendem a legislação brasileira. Planilhas são trabalhosas e sem garantia. A gente resolveu isso.
          </p>
        </div>

        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            {/* Header */}
            <thead>
              <tr>
                <th className="text-left py-3 pr-4 font-medium text-muted-foreground w-1/2">Funcionalidade</th>
                <th className="text-center py-3 px-4 w-[16%]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary text-xs font-black">MI</span>
                    <span className="text-xs font-semibold text-primary">Meu Imposto<br/>Cripto</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 w-[17%]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold">K</span>
                    <span className="text-xs font-medium text-muted-foreground">Koinly /<br/>similares</span>
                  </div>
                </th>
                <th className="text-center py-3 px-4 w-[17%]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold">XLS</span>
                    <span className="text-xs font-medium text-muted-foreground">Planilha<br/>manual</span>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody className="divide-y divide-border/50">
              {comparativo.map((row, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 text-sm text-foreground/80">{row.label}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.nos} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.koinly} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={row.planilha} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legenda */}
          <div className="flex items-center gap-5 mt-6 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><StatusIcon status="yes" /> Sim</span>
            <span className="flex items-center gap-1.5"><StatusIcon status="partial" /> Parcial</span>
            <span className="flex items-center gap-1.5"><StatusIcon status="no" /> Não</span>
          </div>
        </div>
      </div>
    </section>
  );
}
