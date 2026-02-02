import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de IR para Criptomoedas",
  description:
    "Calcule seu Imposto de Renda sobre criptomoedas. Importe CSV, calcule preço médio, veja resumo mensal e exporte relatório para PDF.",
  openGraph: {
    title: "Calculadora de IR - Meu Imposto Cripto",
    description: "Calcule seu imposto sobre criptomoedas de forma simples",
  },
};

export default function CalculadoraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
