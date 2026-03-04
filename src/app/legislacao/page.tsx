import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Scale,
  TrendingUp,
  Globe,
  CalendarClock,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Legislação sobre Cripto no Brasil",
  description:
    "Entenda as leis e regras de tributação de criptomoedas no Brasil. IN 1888, DeCripto, alíquotas do IR, DARF, isenção de R$35mil e prazos de declaração.",
};

const timeline = [
  {
    ano: "2019",
    titulo: "IN 1888 — A primeira regulamentação",
    descricao:
      "A Receita Federal publica a Instrução Normativa 1888, obrigando exchanges e detentores de criptoativos a reportar operações mensalmente. Brasil se torna um dos primeiros países a ter uma regulação específica para cripto.",
    status: "historico",
  },
  {
    ano: "2022",
    titulo: "Lei 14.478 — Marco legal de criptoativos",
    descricao:
      "O Brasil aprova o Marco Legal dos Criptoativos, reconhecendo oficialmente os ativos virtuais como meio de pagamento e definindo regras gerais para o setor. O Banco Central passa a ser o principal regulador de prestadores de serviços de ativos virtuais (PSAVs).",
    status: "ativo",
  },
  {
    ano: "Nov 2025",
    titulo: "IN RFB 2.291 — DeCripto e padrão OCDE",
    descricao:
      "A Receita Federal publica nova instrução normativa alinhando o Brasil ao padrão internacional CARF (Crypto-Asset Reporting Framework) da OCDE. Cria a Declaração de Criptoativos (DeCripto), que substituirá a IN 1888 a partir de julho de 2026.",
    status: "novo",
  },
  {
    ano: "Jul 2026",
    titulo: "DeCripto entra em vigor",
    descricao:
      "Novo modelo de reporte obrigatório. Exchanges estrangeiras também são obrigadas a reportar operações de brasileiros à Receita Federal. Escopo ampliado: inclui staking, DeFi, NFTs e carteiras self-custody com saldo acima de R$5mil.",
    status: "futuro",
  },
];

const regras = [
  {
    icon: CheckCircle,
    cor: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    titulo: "Isenção de R$ 35.000/mês",
    descricao:
      "Se o total de vendas de criptoativos no mês for igual ou inferior a R$ 35.000, o ganho é isento de IR. Atenção: o critério é o valor total vendido no mês, não o lucro.",
    detalhe: "Base legal: Lei 9.250/1995 c/c Art. 22 da Lei 9.532/1997",
  },
  {
    icon: TrendingUp,
    cor: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    titulo: "Alíquotas progressivas de ganho de capital",
    descricao:
      "Quando as vendas mensais superam R$ 35.000, incide IR sobre o ganho de capital (receita de venda menos custo de aquisição). As alíquotas são progressivas.",
    detalhe: "Base legal: Lei 13.259/2016",
    tabela: [
      { faixa: "Até R$ 5.000.000", aliquota: "15%" },
      { faixa: "De R$ 5M a R$ 10M", aliquota: "17,5%" },
      { faixa: "De R$ 10M a R$ 30M", aliquota: "20%" },
      { faixa: "Acima de R$ 30M", aliquota: "22,5%" },
    ],
  },
  {
    icon: Clock,
    cor: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    titulo: "Prazo de pagamento — DARF",
    descricao:
      "O imposto deve ser recolhido via DARF (Documento de Arrecadação de Receitas Federais) até o último dia útil do mês seguinte ao da operação.",
    detalhe: "Código DARF para ganho de capital: 4600",
  },
  {
    icon: FileText,
    cor: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    titulo: "Declaração Anual (IRPF)",
    descricao:
      'Criptoativos devem ser declarados na ficha "Bens e Direitos" do IRPF anual se o custo de aquisição for superior a R$ 5.000. Mesmo em prejuízo, a declaração é obrigatória se você tiver saldo acima desse limite.',
    detalhe: "Código 89 — Demais bens e direitos (cripto)",
  },
  {
    icon: Globe,
    cor: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    titulo: "Criptoativos no exterior",
    descricao:
      'Brasileiros com criptoativos em exchanges estrangeiras ou carteiras self-custody com saldo acima de US$ 1.000 (ou equivalente) devem declarar no CBE (Capitais Brasileiros no Exterior) ao Banco Central. Operações acima de R$ 30.000/mês também entram na IN 1888.',
    detalhe: "Regulado pelo BACEN — CBE anual e trimestral",
  },
  {
    icon: Scale,
    cor: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950",
    titulo: "Penalidades por omissão",
    descricao:
      "Deixar de declarar ou pagar o IR sobre ganhos em cripto pode gerar multa de 75% a 150% sobre o valor do imposto devido, mais juros de mora (Selic). A Receita tem acesso ao histórico de movimentações via exchanges.",
    detalhe: "Art. 44 da Lei 9.430/1996",
  },
];

const faqLegislacao = [
  {
    pergunta: "Troca de cripto por cripto (BTC → ETH) é tributada?",
    resposta:
      "Sim. A Receita Federal entende que qualquer troca de criptoativos é um fato gerador de IR, mesmo sem conversão para reais. O valor de mercado no momento da troca é usado como base de cálculo. A regra de isenção dos R$ 35.000/mês também se aplica.",
  },
  {
    pergunta: "Staking e yield farming são tributados?",
    resposta:
      "Os rendimentos de staking e DeFi são considerados rendimentos tributáveis como 'outros rendimentos', sujeitos à tabela progressiva do IR (7,5% a 27,5%). Ainda há controvérsia sobre o momento exato de reconhecimento do rendimento (ao receber ou ao vender).",
  },
  {
    pergunta: "NFTs pagam imposto?",
    resposta:
      "Sim. A venda de NFTs com lucro segue as mesmas regras de ganho de capital. A isenção de R$ 35.000/mês também se aplica. O custo de aquisição é o valor pago em reais na compra.",
  },
  {
    pergunta: "Posso compensar prejuízos de cripto?",
    resposta:
      "Sim! Prejuízos de cripto podem ser compensados com ganhos futuros de cripto para reduzir a base de cálculo do IR. O prejuízo deve ser registrado na declaração anual mesmo que não gere imposto a pagar.",
  },
  {
    pergunta: "O que muda com a DeCripto em 2026?",
    resposta:
      "A DeCripto amplia o escopo de reporting: exchanges estrangeiras e provedores de serviços DeFi também serão obrigados a reportar operações de brasileiros. O padrão segue o CARF da OCDE, permitindo troca automática de informações entre países. A transparência aumenta significativamente.",
  },
  {
    pergunta: "Preciso declarar mesmo sem ter vendido nada?",
    resposta:
      "Sim, se o custo de aquisição total for superior a R$ 5.000, você deve declarar os criptoativos na ficha Bens e Direitos, informando o custo de aquisição (e não o valor de mercado). Não é obrigatório atualizar o valor de mercado anualmente.",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "novo")
    return (
      <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
        Novo
      </span>
    );
  if (status === "ativo")
    return (
      <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
        Vigente
      </span>
    );
  if (status === "futuro")
    return (
      <span className="text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">
        Em breve
      </span>
    );
  return (
    <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
      Histórico
    </span>
  );
}

export default function LegislacaoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Scale className="h-4 w-4" />
              Atualizado — Março 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Legislação de Cripto no Brasil
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Tudo que você precisa saber sobre as regras de Imposto de Renda
              para criptomoedas no Brasil — explicado de forma simples e objetiva.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button asChild>
                <Link href="/calculadora">
                  Calcular meu IR agora
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/faq">Ver FAQ completo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Aviso importante */}
        <section className="py-6 px-4 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-800">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Aviso legal
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  As informações aqui são de caráter educativo e não constituem
                  consultoria fiscal ou jurídica. A legislação tributária está
                  sujeita a alterações. Para sua situação específica, consulte
                  um contador ou advogado tributarista.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-10">
              <CalendarClock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Linha do tempo da regulação</h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2" />
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div
                    key={i}
                    className={`relative flex gap-6 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="flex-1 pl-10 md:pl-0">
                      <Card
                        className={`${
                          item.status === "novo"
                            ? "border-green-300 dark:border-green-700"
                            : item.status === "futuro"
                            ? "border-amber-300 dark:border-amber-700"
                            : ""
                        }`}
                      >
                        <CardContent className="pt-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-primary">
                              {item.ano}
                            </span>
                            <StatusBadge status={item.status} />
                          </div>
                          <h3 className="font-semibold mb-2">{item.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.descricao}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="absolute left-2.5 top-5 h-3 w-3 rounded-full border-2 border-primary bg-background md:left-1/2 md:-translate-x-1.5" />
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Regras principais */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-10">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Regras essenciais do IR Cripto</h2>
            </div>

            <div className="space-y-6">
              {regras.map((regra, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${regra.bg}`}
                      >
                        <regra.icon className={`h-5 w-5 ${regra.cor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{regra.titulo}</h3>
                        <p className="text-muted-foreground mb-3">{regra.descricao}</p>

                        {regra.tabela && (
                          <div className="rounded-lg border overflow-hidden mb-3">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-3 font-medium">Faixa de ganho</th>
                                  <th className="text-right p-3 font-medium">Alíquota</th>
                                </tr>
                              </thead>
                              <tbody>
                                {regra.tabela.map((linha, j) => (
                                  <tr key={j} className="border-t">
                                    <td className="p-3 text-muted-foreground">{linha.faixa}</td>
                                    <td className="p-3 text-right font-semibold text-primary">
                                      {linha.aliquota}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Info className="h-3 w-3 flex-shrink-0" />
                          {regra.detalhe}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* DeCripto em destaque */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">O que é a DeCripto?</h2>
                  <span className="text-xs text-primary font-medium">
                    Vigência: julho 2026
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                A <strong>Declaração de Criptoativos (DeCripto)</strong>, criada pela{" "}
                <strong>IN RFB nº 2.291 de novembro de 2025</strong>, é o novo
                modelo de reporte criado pela Receita Federal para substituir a IN
                1888. Ela segue o padrão internacional{" "}
                <strong>CARF (Crypto-Asset Reporting Framework)</strong> da OCDE —
                o mesmo usado para declaração de contas bancárias no exterior.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    titulo: "O que muda",
                    itens: [
                      "Exchanges estrangeiras obrigadas a reportar",
                      "Inclui operações DeFi e NFTs",
                      "Troca automática de dados entre países",
                      "Carteiras self-custody acima de R$5k",
                    ],
                  },
                  {
                    titulo: "O que permanece igual",
                    itens: [
                      "Isenção de R$ 35.000/mês",
                      "Alíquotas de 15% a 22,5%",
                      "DARF para recolhimento mensal",
                      "Declaração anual no IRPF",
                    ],
                  },
                ].map((col, i) => (
                  <div key={i} className="bg-background/60 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-sm">{col.titulo}</h3>
                    <ul className="space-y-2">
                      {col.itens.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                Fonte: Receita Federal do Brasil — IN RFB nº 2.291/2025
                <a
                  href="https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/novembro/rfb-atualiza-regulamentacao-de-criptoativos-para-adapta-la-ao-padrao-internacional-carf-da-ocde-2013-in-rfb-no-2-291-de-14-de-novembro-de-2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  Ver fonte oficial
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-10">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Dúvidas frequentes sobre a lei</h2>
            </div>

            <div className="space-y-4">
              {faqLegislacao.map((item, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.pergunta}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.resposta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Pronto para calcular seu imposto?
            </h2>
            <p className="text-muted-foreground mb-8">
              Use nossa calculadora gratuita para saber exatamente quanto você
              deve de IR sobre suas operações com criptomoedas.
            </p>
            <Button size="lg" asChild>
              <Link href="/calculadora">Calcular agora — grátis</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
