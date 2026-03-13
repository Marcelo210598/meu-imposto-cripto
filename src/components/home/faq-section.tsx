import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    pergunta: "Quando devo pagar imposto sobre criptomoedas?",
    resposta:
      "Em regra, no regime de ganho de capital, você deve pagar imposto quando vender criptomoedas com lucro e o total de vendas no mês ultrapassar R$ 35.000 em corretoras brasileiras. Porém, o enquadramento pode variar conforme a exchange e o tipo de operação — consulte um contador para confirmar o regime aplicável ao seu caso.",
  },
  {
    pergunta: "Troca de uma cripto por outra precisa pagar IR?",
    resposta:
      "A troca (swap) de uma criptomoeda por outra pode caracterizar alienação para fins de IR, dependendo do regime aplicável. Se for tratada como venda, o lucro apurado pode ser tributado conforme as regras vigentes. Recomendamos consultar um profissional para avaliar seu caso específico.",
  },
  {
    pergunta: "Como funciona o cálculo de preço médio?",
    resposta:
      "É a média ponderada de todas as suas compras. Se você comprou 1 BTC por R$ 100.000 e depois 1 BTC por R$ 150.000, seu preço médio é R$ 125.000. A ferramenta calcula isso automaticamente para cada ativo.",
  },
  {
    pergunta: "Stablecoins como USDT são tributáveis?",
    resposta:
      "Em geral, stablecoins seguem as mesmas regras aplicáveis a outros criptoativos. Converter Bitcoin para USDT, por exemplo, pode ser tratado como alienação de Bitcoin e, dependendo do regime, gerar tributação. O enquadramento exato depende das circunstâncias da operação.",
  },
  {
    pergunta: "Qual o prazo para pagar o imposto (DARF)?",
    resposta:
      "No regime de ganho de capital, o DARF deve ser pago até o último dia útil do mês seguinte à venda. Por exemplo: vendeu em março com lucro tributável, pague até o último dia útil de abril. Para outros regimes, o prazo pode ser diferente — verifique com seu contador.",
  },
  {
    pergunta: "Os meus dados ficam seguros?",
    resposta:
      "Sim. Quando você está logado, seus dados são salvos com segurança na nuvem em banco de dados criptografado. Usamos HTTPS em todas as comunicações e nunca compartilhamos suas informações.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Dúvidas Frequentes
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Respostas rápidas sobre IR em Cripto
            </h2>
            <p className="text-lg text-muted-foreground">
              As dúvidas mais comuns sobre tributação de criptomoedas no Brasil.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-background border rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                  {faq.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-10">
            <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
            <Button variant="outline" asChild>
              <Link href="/faq">Ver todas as perguntas →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
