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
          "O pagamento de imposto depende do enquadramento tributário da operação. Em muitas situações sujeitas ao regime tradicional de ganho de capital, o imposto pode surgir quando há alienação com lucro e, conforme o caso, a regra de isenção mensal de R$ 35.000 pode ser relevante. Já em determinadas estruturas com instituição, intermediação ou custódia no exterior, a operação pode se enquadrar no regime de aplicações financeiras no exterior, cuja lógica de tributação é diferente e tende a ter apuração anual. O simples fato de usar uma plataforma estrangeira não resolve sozinho essa classificação.",
      },
      {
        pergunta: "Qual é a alíquota do imposto sobre criptomoedas?",
        resposta:
          "A alíquota depende do regime tributário aplicável. Nas hipóteses sujeitas ao regime tradicional de ganho de capital, aplicam-se, em regra, as alíquotas progressivas previstas para ganho de capital (15% a 22,5%). Day trade de criptoativos usa essa mesma tabela progressiva — a alíquota de 20% fixo para day trade se aplica apenas à bolsa de valores, nunca a cripto. Nas hipóteses enquadradas como aplicações financeiras no exterior, a legislação aplicável pode prever apuração anual com alíquota de 15%. Antes de concluir pela alíquota, é importante identificar corretamente o regime da operação.",
      },
      {
        pergunta: "O que é o limite de isenção de R$ 35.000?",
        resposta:
          "A isenção mensal de R$ 35.000 está relacionada, em regra, ao regime tradicional de ganho de capital nas alienações de bens e direitos, considerando o total alienado no mês — não apenas o lucro. Essa regra não deve ser aplicada automaticamente a toda operação com cripto, especialmente quando houver possível enquadramento em regime diverso, como o de aplicações financeiras no exterior.",
      },
      {
        pergunta: "Troca de uma cripto por outra é tributável?",
        resposta:
          "Pode ser. Em geral, a troca de um criptoativo por outro envolve a alienação de um ativo e a aquisição de outro, o que pode gerar tributação. Mas a forma de apuração depende do regime tributário aplicável. Por isso, a regra dos R$ 35.000 não deve ser usada automaticamente para todo swap. Trocas realizadas diretamente em wallets próprias ou DEX sem intermediário têm enquadramento menos consolidado e devem ser analisadas conforme a situação específica.",
      },
      {
        pergunta: "Stablecoins como USDT são tributáveis?",
        resposta:
          "Em regra, stablecoins são tratadas como criptoativos e a conversão de um criptoativo para stablecoin tende a ser considerada uma alienação para fins de IR. O regime aplicável depende da estrutura da operação — se há instituição ou custódia no exterior, o enquadramento pode seguir o regime de aplicações financeiras no exterior. O simples fato de a plataforma ser estrangeira não resolve automaticamente essa classificação.",
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
          "A compensação de prejuízos depende do regime tributário aplicável à operação. Nas situações sujeitas ao regime de ganho de capital, prejuízos com criptoativos podem ser compensados com ganhos futuros do mesmo regime. Nas hipóteses enquadradas como aplicações financeiras no exterior, perdas e ganhos seguem a disciplina específica desse regime. Não é recomendável misturar automaticamente prejuízos de regimes diferentes. O prejuízo deve ser registrado na declaração anual.",
      },
      {
        pergunta: "Como declarar operações com instituições ou plataformas no exterior?",
        resposta:
          "As regras podem ser diferentes das operações sujeitas ao regime tradicional de ganho de capital. Em determinadas hipóteses, ativos virtuais custodiados ou negociados por instituições localizadas no exterior podem se enquadrar no regime de aplicações financeiras no exterior, com apuração anual na Declaração de Ajuste Anual. Mas isso não deve ser decidido automaticamente apenas porque a plataforma é estrangeira. É importante separar situações de autocustódia, wallets próprias, operações sem intermediário e operações em ambiente descentralizado, porque o enquadramento pode ser diferente. Obrigações acessórias de reporte podem alcançar tanto operações em exchange domiciliada no exterior quanto operações fora de exchange, quando presentes os requisitos legais. A conversão para reais usa a cotação PTAX do Banco Central.",
      },
    ],
  },
  {
    categoria: "Declaração e Pagamento",
    perguntas: [
      {
        pergunta: "Qual o prazo para pagar o imposto?",
        resposta:
          "O prazo depende do regime tributário aplicável. Nas operações sujeitas ao regime de ganho de capital, o imposto via DARF deve ser pago até o último dia útil do mês seguinte à alienação. Nas hipóteses enquadradas como aplicações financeiras no exterior, a tributação ocorre de forma anual, na Declaração de Ajuste Anual do IRPF, com vencimento no prazo normal da declaração (geralmente abril/maio do ano seguinte).",
      },
      {
        pergunta: "O que é DARF e como emitir?",
        resposta:
          "DARF é o Documento de Arrecadação de Receitas Federais, usado para pagar imposto sobre ganho de capital. Você emite pelo site da Receita Federal (Sicalc) ou pelo programa GCAP. O código é 4600 para ganho de capital de pessoa física. Nas hipóteses enquadradas como aplicações financeiras no exterior, não há DARF mensal — o imposto é pago na Declaração de Ajuste Anual.",
      },
      {
        pergunta: "O que é o GCAP?",
        resposta:
          "GCAP (Programa de Apuração de Ganhos de Capital) é o software da Receita Federal para calcular e declarar ganhos de capital. Você pode usá-lo para gerar o DARF e importar os dados na declaração anual.",
      },
      {
        pergunta: "Preciso declarar mesmo se não paguei imposto?",
        resposta:
          "Sim. Mesmo operações isentas devem ser informadas na declaração anual de IR, na ficha de Bens e Direitos. O código de declaração pode variar conforme o tipo de criptoativo e as instruções do programa DIRPF do ano-calendário correspondente. Consulte sempre as orientações atualizadas da Receita Federal.",
      },
    ],
  },
  {
    categoria: "Exchanges Estrangeiras (Lei 14.754/2023)",
    perguntas: [
      {
        pergunta: "Por que exchanges estrangeiras têm regras diferentes?",
        resposta:
          "A Lei 14.754/2023 criou um regime tributário específico para investimentos em entidades no exterior. O critério central é o enquadramento jurídico da operação — localização da instituição custodiante, existência de intermediário estrangeiro e natureza do ativo — não apenas a existência ou ausência de CNPJ no Brasil. Quando aplicável, as regras são: (1) 15% sobre o lucro líquido anual — sem alíquota progressiva; (2) sem isenção de R$ 35.000/mês; (3) apuração anual paga na Declaração de Ajuste Anual, não via DARF mensal. Para situações de autocustódia, DEX ou operações sem intermediário, o enquadramento deve ser avaliado com cautela.",
      },
      {
        pergunta: "A Binance é brasileira ou estrangeira?",
        resposta:
          "Depende da plataforma utilizada. A Binance Pay Brasil (operada pela Capitual/Latam) possui CNPJ no Brasil e tende a se enquadrar no regime de ganho de capital. Já a plataforma global binance.com não possui CNPJ no Brasil e pode se enquadrar no regime de aplicações financeiras no exterior. Em caso de dúvida sobre o enquadramento, verifique em qual entidade você criou sua conta e consulte um especialista.",
      },
      {
        pergunta: "Preciso pagar DARF mensalmente por operações na Bybit, Coinbase ou Kraken?",
        resposta:
          "Em regra, operações enquadradas no regime de aplicações financeiras no exterior não geram DARF mensal. A tributação tende a ser calculada sobre o resultado anual e paga na Declaração de Ajuste Anual do IRPF.",
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

          {/* Aviso de segurança jurídica */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              Este conteúdo tem finalidade educacional e resume regras tributárias que podem exigir interpretação conforme a estrutura da operação. Em casos com autocustódia, DEX, NFTs ou estruturas no exterior, a revisão por contador ou advogado tributarista pode ser recomendável.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
