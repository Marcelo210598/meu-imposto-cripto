import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Meu Imposto Cripto | Calculadora de IR para Criptomoedas",
  description:
    "Calculadora simples e automática de Imposto de Renda para operações com criptomoedas no Brasil. Calcule seus impostos de forma fácil e precisa.",
  keywords: [
    "imposto de renda",
    "criptomoedas",
    "bitcoin",
    "IR cripto",
    "calculadora imposto",
    "receita federal",
    "GCAP",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
