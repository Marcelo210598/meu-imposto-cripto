import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    categoria: "Regras de Tributação",
    perguntas: [
      {
        pergunta: "Quando devo pagar imposto sobre criptomoedas?",
        resposta:
          "Você deve pagar imposto quando vender criptomoedas com lucro E o total de vendas no mês ultrapassar R$ 35.000. Se suas vendas ficarem abaixo desse limite, você está isento, mesmo tendo lucro.",
      },
      {
        pergunta: "Qual é a alíquota do imposto sobre criptomoedas?",
        resposta:
          "A alíquota varia de acordo com o valor do ganho de capital: 15% para ganhos até R$ 5 milhões, 17,5% de R$ 5 a 10 milhões, 20% de R$ 10 a 30 milhões, e 22,5% acima de R$ 30 milhões.",
      },
      {
        pergunta: "O que é o limite de isenção de R$ 35.000?",
        resposta:
          "Se o total das suas vendas de criptomoedas em um mês for igual ou inferior a R$ 35.000, você está isento de pagar imposto sobre o ganho de capital, independentemente do lucro obtido.",
      },
      {
        pergunta: "Troca de uma cripto por outra é tributável?",
        resposta:
          "Sim. A troca (swap) de uma criptomoeda por outra é considerada uma venda seguida de uma compra. Portanto, se houver ganho na 'venda' da primeira cripto, e o total mensal ultrapassar R$ 35.000, há tributação.",
      },
      {
        pergunta: "Stablecoins como USDT são tributáveis?",
        resposta:
          "Sim. Stablecoins são criptoativos e seguem as mesmas regras. Converter Bitcoin para USDT, por exemplo, é considerado uma venda de Bitcoin.",
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
          "Não diretamente. Diferente de ações, prejuízos com criptomoedas não podem ser compensados com lucros futuros para fins de IR. Porém, o prejuízo reduz seu custo médio se você continuar comprando.",
      },
      {
        pergunta: "Como declarar operações em exchanges internacionais?",
        resposta:
          "As regras são as mesmas. A diferença é que você precisa converter os valores para Reais usando a cotação do dólar (PTAX) do dia da operação.",
      },
    ],
  },
  {
    categoria: "Declaração e Pagamento",
    perguntas: [
      {
        pergunta: "Qual o prazo para pagar o imposto?",
        resposta:
          "O imposto (DARF) deve ser pago até o último dia útil do mês seguinte à venda. Exemplo: vendeu em janeiro com lucro tributável, pague até o último dia útil de fevereiro.",
      },
      {
        pergunta: "O que é DARF e como emitir?",
        resposta:
          "DARF é o Documento de Arrecadação de Receitas Federais. Você emite pelo site da Receita Federal (Sicalc) ou pelo programa GCAP. O código é 4600 para ganho de capital de pessoa física.",
      },
      {
        pergunta: "O que é o GCAP?",
        resposta:
          "GCAP (Programa de Apuração de Ganhos de Capital) é o software da Receita Federal para calcular e declarar ganhos de capital. Você pode usá-lo para gerar o DARF e importar os dados na declaração anual.",
      },
      {
        pergunta: "Preciso declarar mesmo se não paguei imposto?",
        resposta:
          "Sim. Mesmo operações isentas (vendas abaixo de R$ 35.000) devem ser informadas na declaração anual de IR, na ficha de Bens e Direitos (código 81 para criptoativos).",
      },
    ],
  },
  {
    categoria: "Sobre a Ferramenta",
    perguntas: [
      {
        pergunta: "Os dados são seguros?",
        resposta:
          "Sim. Todos os dados são armazenados localmente no seu navegador (localStorage). Não enviamos suas informações para nenhum servidor. Você tem controle total.",
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
