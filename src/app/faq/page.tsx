import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Perguntas Frequentes sobre IR de Criptomoedas",
  description:
    "Tire suas dúvidas sobre tributação de criptomoedas no Brasil. Regras de isenção, alíquotas, GCAP, prazos e muito mais.",
  openGraph: {
    title: "FAQ - Imposto de Renda Criptomoedas",
    description: "Tire suas dúvidas sobre tributação de criptomoedas no Brasil",
  },
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    categoria: "Regras de Tributação",
    perguntas: [
      {
        pergunta: "Quando devo pagar imposto sobre criptomoedas?",
        resposta:
          "Depende de onde você opera. Para exchanges com CNPJ no Brasil (regime nacional): você paga imposto quando vender com lucro E o total de vendas no mês ultrapassar R$ 35.000 — abaixo disso, está isento. Para exchanges sem CNPJ no Brasil como Binance global, Bybit, Coinbase e Kraken (regime exterior, Lei 14.754/2023): não existe faixa de isenção. Qualquer lucro é tributado à alíquota de 15% sobre o resultado líquido anual, pago na declaração anual — não via DARF mensal.",
      },
      {
        pergunta: "Qual é a alíquota do imposto sobre criptomoedas?",
        resposta:
          "Depende do regime. Para exchanges brasileiras (regime nacional): alíquotas progressivas de 15% para ganhos até R$ 5 milhões, 17,5% de R$ 5M a R$ 10M, 20% de R$ 10M a R$ 30M, e 22,5% acima de R$ 30M. Day trade de criptoativos usa essa mesma tabela progressiva — a alíquota de 20% fixo para day trade se aplica apenas à bolsa de valores, nunca a cripto. Para exchanges estrangeiras (regime exterior, Lei 14.754/2023): alíquota fixa de 15% sobre o lucro líquido anual, sem tabela progressiva e sem isenção.",
      },
      {
        pergunta: "O que é o limite de isenção de R$ 35.000?",
        resposta:
          "Se o total das suas vendas de criptomoedas em um mês for igual ou inferior a R$ 35.000, você está isento de pagar imposto sobre o ganho de capital, independentemente do lucro obtido. Atenção: essa isenção se aplica exclusivamente a operações em exchanges com CNPJ no Brasil (regime nacional), como Mercado Bitcoin, Foxbit e NovaDAX. Para exchanges estrangeiras como Coinbase, Kraken, Bybit e a Binance global, não existe faixa de isenção — qualquer lucro é tributado à alíquota de 15%.",
      },
      {
        pergunta: "Troca de uma cripto por outra é tributável?",
        resposta:
          "Em regra, a troca (swap) de uma criptomoeda por outra tende a ser tratada como uma venda seguida de uma compra para fins de IR. No regime nacional (exchanges com CNPJ no Brasil), se houver ganho e o total mensal de vendas ultrapassar R$ 35.000, há tributação. No regime da Lei 14.754/2023 (plataformas no exterior), a troca também pode gerar imposto, mas sem a faixa de isenção de R$ 35.000. Trocas realizadas diretamente em wallets próprias ou DEX sem intermediário têm enquadramento menos consolidado e devem ser analisadas conforme a situação específica.",
      },
      {
        pergunta: "Stablecoins como USDT são tributáveis?",
        resposta:
          "Em regra, stablecoins são tratadas como criptoativos e a conversão de um criptoativo para stablecoin tende a ser considerada uma venda para fins de IR. O regime aplicável (nacional ou exterior, Lei 14.754/2023) depende da plataforma onde a operação ocorre. Operações em exchanges nacionais seguem as regras do regime nacional com isenção de R$ 35.000/mês; em exchanges estrangeiras, seguem a apuração anual sem isenção. O enquadramento de cada operação deve ser avaliado conforme o contexto.",
      },
    ],
  },
  {
    categoria: "Cálculo do Imposto",
    perguntas: [
      {
        pergunta: "O que é preço médio de aquisição?",
        resposta:
          "É a média ponderada do custo de todas as suas compras de determinada criptomoeda. Exemplo: se você comprou 1 BTC por R$ 100.000 e depois 1 BTC por R$ 150.000, seu preço médio é R$ 125.000 por BTC.",
      },
      {
        pergunta: "Como calcular o ganho de capital?",
        resposta:
          "Ganho de capital = Valor da venda - (Quantidade vendida × Preço médio de aquisição). Se você vendeu 0,5 BTC por R$ 80.000 e seu preço médio era R$ 125.000/BTC, o ganho foi R$ 80.000 - (0,5 × R$ 125.000) = R$ 17.500.",
      },
      {
        pergunta: "Posso compensar prejuízos?",
        resposta:
          "Sim. Prejuízos com criptoativos no regime nacional (exchanges com CNPJ no Brasil) podem ser compensados com ganhos futuros de criptoativos do mesmo regime. O prejuízo acumulado é carregado para os meses seguintes e reduz a base de cálculo do IR. No regime exterior (Lei 14.754/2023), prejuízos dentro do mesmo ano-calendário também compensam ganhos, mas não podem ser transferidos para anos seguintes.",
      },
      {
        pergunta: "Como declarar operações em exchanges internacionais?",
        resposta:
          "As regras são DIFERENTES das exchanges brasileiras. Exchanges estrangeiras (sem CNPJ no Brasil, como Binance global, Bybit, Coinbase, Kraken) seguem a Lei 14.754/2023: (1) Alíquota fixa de 15% sobre o lucro líquido anual — não existe a isenção de R$ 35.000; (2) Apuração é anual, paga na Declaração de Ajuste Anual (não gera DARF mensal); (3) Movimentações acima de R$ 30.000/mês exigem reporte via e-CAC (IN 1.888/2019). A conversão para reais usa a cotação PTAX do Banco Central.",
      },
    ],
  },
  {
    categoria: "Declaração e Pagamento",
    perguntas: [
      {
        pergunta: "Qual o prazo para pagar o imposto?",
        resposta:
          "Depende do regime. Para exchanges brasileiras (regime nacional): o imposto via DARF deve ser pago até o último dia útil do mês seguinte à venda. Exemplo: vendeu em janeiro com lucro tributável, pague até o último dia útil de fevereiro. Para exchanges estrangeiras (regime exterior, Lei 14.754/2023): não há DARF mensal. O imposto é calculado sobre o lucro líquido anual e pago na Declaração de Ajuste Anual do IRPF, com vencimento no prazo normal da declaração (geralmente abril/maio do ano seguinte).",
      },
      {
        pergunta: "O que é DARF e como emitir?",
        resposta:
          "DARF é o Documento de Arrecadação de Receitas Federais, usado para pagar imposto sobre ganho de capital no regime nacional (exchanges com CNPJ no Brasil). Você emite pelo site da Receita Federal (Sicalc) ou pelo programa GCAP. O código é 4600 para ganho de capital de pessoa física. Atenção: operações em exchanges estrangeiras (Lei 14.754/2023) não geram DARF mensal — o imposto é pago na declaração anual.",
      },
      {
        pergunta: "O que é o GCAP?",
        resposta:
          "GCAP (Programa de Apuração de Ganhos de Capital) é o software da Receita Federal para calcular e declarar ganhos de capital. Você pode usá-lo para gerar o DARF e importar os dados na declaração anual.",
      },
      {
        pergunta: "Preciso declarar mesmo se não paguei imposto?",
        resposta:
          "Sim. Mesmo operações isentas devem ser informadas na declaração anual de IR, na ficha de Bens e Direitos. O código de declaração pode variar conforme o tipo de criptoativo — o código 89 (Demais bens e direitos) tende a ser utilizado para criptomoedas em geral, mas verifique as instruções do programa DIRPF do ano-calendário correspondente, pois as orientações da Receita Federal podem ser atualizadas. Em caso de dúvida, consulte um contador.",
      },
    ],
  },
  {
    categoria: "Exchanges Estrangeiras (Lei 14.754/2023)",
    perguntas: [
      {
        pergunta: "Por que exchanges estrangeiras têm regras diferentes?",
        resposta:
          "A Lei 14.754/2023 criou um regime tributário específico para investimentos em entidades no exterior. O critério central é o enquadramento jurídico da operação — localização da instituição custodiante, existência de intermediário estrangeiro e natureza do ativo — não apenas a existência ou ausência de CNPJ no Brasil. Na prática, exchanges reconhecidamente estrangeiras como Binance global, Bybit, Coinbase, Kraken e OKX tendem a se enquadrar neste regime. As regras quando aplicável: (1) 15% sobre o lucro líquido anual — sem alíquota progressiva; (2) sem isenção de R$ 35.000/mês; (3) apuração anual paga na Declaração de Ajuste Anual, não via DARF mensal. Para situações atípicas (ex.: DEX, autocustódia, operações mistas), o enquadramento deve ser avaliado com cautela.",
      },
      {
        pergunta: "A Binance é brasileira ou estrangeira?",
        resposta:
          "Depende da plataforma que você usou. A Binance Pay Brasil (operada pela Capitual/Latam) possui CNPJ no Brasil — segue o regime nacional com isenção de R$ 35k e DARF mensal. Já a plataforma global binance.com não tem CNPJ no Brasil e segue a Lei 14.754/2023 — 15% flat, sem isenção, apuração anual. Em caso de dúvida, verifique em qual entidade você criou sua conta.",
      },
      {
        pergunta: "Preciso pagar DARF mensalmente por operações na Bybit, Coinbase ou Kraken?",
        resposta:
          "Não. Exchanges estrangeiras (Lei 14.754/2023) não geram DARF mensal. O imposto é calculado sobre o lucro líquido anual e pago integralmente na Declaração de Ajuste Anual do IRPF, com prazo até abril/maio do ano seguinte.",
      },
      {
        pergunta: "O que é a obrigação do e-CAC para exchanges estrangeiras?",
        resposta:
          "A IN 1.888/2019 estabelece obrigação de reporte quando o volume mensal em criptoativos supera R$ 30.000. Essa obrigação não se limita apenas a exchanges estrangeiras — pode alcançar operações realizadas fora de exchange quando aplicável. O reporte é feito via e-CAC (portal da Receita Federal) até o último dia útil do mês seguinte. Trata-se de obrigação acessória, separada do pagamento do imposto. A ferramenta identifica automaticamente quando esse limite é atingido em exchanges informadas pelo usuário, mas não cobre operações em wallets próprias ou DEX.",
      },
      {
        pergunta: "Wallet própria, MetaMask ou DEX seguem as mesmas regras de exchanges estrangeiras?",
        resposta:
          "Não necessariamente. Autocustódia (wallet própria, hardware wallet, MetaMask) e operações em DEX sem intermediário não devem ser tratadas automaticamente como 'ativo no exterior' só porque envolvem tecnologia descentralizada ou acesso a protocolos estrangeiros. O enquadramento tributário depende da natureza da operação, da existência de intermediário e da forma de custódia. Esse é um tema com interpretações ainda em desenvolvimento na doutrina e na prática administrativa — recomendamos consultar um especialista para essas situações.",
      },
    ],
  },
  {
    categoria: "Sobre a Ferramenta",
    perguntas: [
      {
        pergunta: "Os dados são seguros?",
        resposta:
          "Sim. Quando você está logado, seus dados são salvos com segurança na nuvem (banco de dados criptografado). Usamos HTTPS em todas as comunicações e nunca compartilhamos suas informações com terceiros.",
      },
      {
        pergunta: "Quais exchanges são suportadas?",
        resposta:
          "Atualmente suportamos importação de CSV da Binance e Mercado Bitcoin. Estamos trabalhando para adicionar mais exchanges como Foxbit, NovaDAX e outras.",
      },
      {
        pergunta: "A ferramenta substitui um contador?",
        resposta:
          "Não. Nossa ferramenta é para fins educativos e de organização. Para situações complexas ou dúvidas específicas, sempre consulte um contador ou especialista tributário.",
      },
    ],
  },
];

export default function FAQPage() {
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
          <h1 className="ml-4 text-lg font-semibold">Perguntas Frequentes</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h1>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas sobre tributação de criptomoedas no Brasil
            </p>
          </div>

          {/* FAQ por categoria */}
          <div className="space-y-8">
            {faqs.map((categoria, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                    {idx + 1}
                  </span>
                  {categoria.categoria}
                </h2>
                <div className="space-y-3">
                  {categoria.perguntas.map((faq, faqIdx) => (
                    <Card key={faqIdx}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">
                          {faq.pergunta}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {faq.resposta}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center p-8 bg-primary/5 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">
              Ainda tem dúvidas?
            </h3>
            <p className="text-muted-foreground mb-4">
              Use nossa calculadora para simular suas operações
            </p>
            <Button asChild>
              <Link href="/calculadora">Acessar Calculadora</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
