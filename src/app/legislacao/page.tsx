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
      "Novo modelo de reporte obrigatório. Exchanges estrangeiras também serão obrigadas a reportar operações de brasileiros à Receita Federal. Escopo ampliado: pode incluir staking, DeFi, NFTs e carteiras self-custody — os limites e condições exatos estão definidos na IN RFB 2.291/2025.",
    status: "futuro",
  },
];

const regras = [
  {
    icon: CheckCircle,
    cor: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    titulo: "Isenção de R$ 35.000/mês — regime nacional",
    descricao:
      "Se o total de vendas de criptoativos no mês for igual ou inferior a R$ 35.000, o ganho é isento de IR. Atenção: o critério é o valor total vendido no mês, não o lucro. ⚠️ Esta isenção aplica-se exclusivamente a operações em exchanges com CNPJ brasileiro (Mercado Bitcoin, Foxbit, NovaDAX etc.). Exchanges estrangeiras (Binance global, Bybit, Coinbase, Kraken etc.) seguem a Lei 14.754/2023 e não possuem faixa de isenção — qualquer lucro é tributado.",
    detalhe: "Base legal: Lei 9.250/1995 c/c Art. 22 da Lei 9.532/1997 — aplica-se apenas ao regime nacional",
  },
  {
    icon: TrendingUp,
    cor: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    titulo: "Alíquotas progressivas — regime nacional",
    descricao:
      "Quando as vendas mensais superam R$ 35.000 em exchanges brasileiras, incide IR sobre o ganho de capital (receita de venda menos custo de aquisição). As alíquotas são progressivas. Day trade de criptoativos usa essa mesma tabela progressiva (não é 20% fixo, que se aplica apenas a day trade na bolsa de valores).",
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
    titulo: "Prazo de pagamento — DARF (regime nacional)",
    descricao:
      "Para exchanges com CNPJ no Brasil: o imposto deve ser recolhido via DARF até o último dia útil do mês seguinte ao da operação. Para exchanges estrangeiras (Lei 14.754/2023): não há DARF mensal — o imposto é calculado sobre o lucro líquido anual e pago na Declaração de Ajuste Anual do IRPF.",
    detalhe: "Código DARF para ganho de capital: 4600 (aplica-se ao regime nacional)",
  },
  {
    icon: FileText,
    cor: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    titulo: "Declaração Anual (IRPF)",
    descricao:
      'Criptoativos em geral devem ser declarados na ficha "Bens e Direitos" do IRPF anual quando o custo de aquisição total for superior a R$ 5.000. Mesmo sem ter vendido nada, a declaração é obrigatória se o saldo superar esse limite. O enquadramento e o código de declaração podem variar conforme o tipo de criptoativo e as instruções do programa DIRPF do ano-calendário correspondente — consulte o guia da Receita Federal vigente ou um contador para confirmar o código correto para cada ativo.',
    detalhe: "Código 89 tende a ser utilizado para criptomoedas em geral — verifique as instruções do DIRPF do ano vigente para cada tipo de ativo",
  },
  {
    icon: Globe,
    cor: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    titulo: "Criptoativos no exterior — Lei 14.754/2023",
    descricao:
      'A Lei 14.754/2023 criou um regime específico para investimentos em plataformas no exterior. Em regra, aplica-se quando os criptoativos estão custodiados por instituição localizada fora do Brasil e há um intermediário estrangeiro na operação — o que tende a coincidir com o uso de exchanges sem CNPJ no Brasil, mas o enquadramento correto depende da natureza da operação e deve ser avaliado caso a caso. Quando aplicável: alíquota fixa de 15% sobre o lucro líquido anual, sem a isenção de R$ 35.000/mês, e apuração anual na Declaração de Ajuste Anual (não via DARF mensal). Prejuízos do ano compensam ganhos do mesmo ano. Obrigações acessórias: (1) CBE ao BACEN — obrigatório se saldo em 31/12 for igual ou superior a US$ 1.000.000 (CBE anual) ou US$ 100.000.000 em qualquer trimestre (CBE trimestral) — obrigação distinta do IRPF; (2) reporte via e-CAC se movimentação mensal superar R$ 30.000, incluindo operações fora de exchanges quando aplicável (IN 1.888/2019). Autocustódia (wallets próprias, hardware wallets) e operações em DEX não devem ser tratadas automaticamente como "ativo no exterior" — o enquadramento depende da natureza da operação.',
    detalhe: "Lei 14.754/2023 + IN RFB 2.180/2024 · 15% sobre lucro anual · sem isenção de R$ 35k · consulte especialista para casos de custódia própria e DEX",
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
      "Em regra, a Receita Federal entende que a troca de criptoativos pode constituir fato gerador de IR, mesmo sem conversão para reais. O valor de mercado no momento da troca tende a ser usado como base de cálculo. Para operações em exchanges nacionais, a regra de isenção dos R$ 35.000/mês pode se aplicar. Para operações em exchanges sujeitas à Lei 14.754/2023, não há faixa de isenção — a tributação é anual e incide sobre o resultado líquido. Trocas realizadas diretamente em wallets ou DEX têm enquadramento menos consolidado e devem ser analisadas caso a caso.",
  },
  {
    pergunta: "Staking e yield farming são tributados?",
    resposta:
      "Os rendimentos de staking e DeFi são considerados rendimentos tributáveis como 'outros rendimentos', sujeitos à tabela progressiva do IR (7,5% a 27,5%). Ainda há controvérsia sobre o momento exato de reconhecimento do rendimento (ao receber ou ao vender).",
  },
  {
    pergunta: "NFTs pagam imposto?",
    resposta:
      "Em regra, a venda de NFTs com lucro tende a ser tratada como ganho de capital. No entanto, o enquadramento pode variar conforme a natureza do ativo — NFTs que representem utilidade, acesso a serviços ou outras formas de ativo podem ter tratamento distinto. Não existe regra única e definitiva para todos os NFTs. Recomendamos consultar um especialista para casos específicos, especialmente em volumes relevantes. A isenção de R$ 35.000/mês em regra se aplica quando as operações ocorrem em exchanges nacionais.",
  },
  {
    pergunta: "Posso compensar prejuízos de cripto?",
    resposta:
      "Sim, em regra. No regime nacional (exchanges com CNPJ no Brasil), prejuízos com criptoativos podem ser compensados com ganhos futuros de criptoativos do mesmo regime, mês a mês. No regime da Lei 14.754/2023 (plataformas no exterior), prejuízos dentro do mesmo ano-calendário compensam ganhos do mesmo regime — os não utilizados podem ser aproveitados em anos posteriores. Importante: os regimes não se comunicam entre si para fins de compensação. O prejuízo deve ser registrado na declaração anual.",
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

        {/* Banner MP 1.303/2025 */}
        <section className="py-5 px-4 bg-blue-50 dark:bg-blue-950/30 border-y border-blue-200 dark:border-blue-800">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  Atenção: MP 1.303/2025 — ainda não está em vigor
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                  O governo federal publicou a MP 1.303/2025 propondo mudanças como fim da isenção de R$ 35.000
                  e alíquota única de 17,5% para criptoativos. Essa medida ainda não está em vigor.
                  As regras atuais continuam válidas para 2026.
                  Acompanharemos e atualizaremos a ferramenta caso a MP seja aprovada pelo Congresso Nacional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Aviso importante */}
        <section className="py-6 px-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Aviso legal
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  As informações aqui são de caráter educativo e não constituem
                  consultoria fiscal ou jurídica. O conteúdo mistura diferentes
                  hierarquias normativas: leis (fontes primárias), instruções
                  normativas da Receita Federal (obrigações acessórias e
                  reporte), orientações de preenchimento da DIRPF (caráter
                  declaratório) e interpretações sobre temas ainda não
                  consolidados. Muitos pontos envolvem cautela e podem depender
                  de consulta especializada. A legislação tributária está sujeita
                  a alterações.
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
                      "Reporte de carteiras self-custody acima de R$ 5k (quando aplicável)",
                    ],
                  },
                  {
                    titulo: "O que permanece igual",
                    itens: [
                      "Isenção de R$ 35.000/mês (regime nacional)",
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
