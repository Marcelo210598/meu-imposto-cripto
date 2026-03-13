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
    titulo: "Isenção de R$ 35.000/mês — regime de ganho de capital",
    descricao:
      "Em regra, nas alienações sujeitas ao regime tradicional de ganho de capital, se o total de vendas de criptoativos no mês for igual ou inferior a R$ 35.000, o ganho pode ser isento de IR. O critério considera o valor total alienado no mês, e não apenas o lucro. Atenção: essa lógica não deve ser aplicada automaticamente a toda operação envolvendo plataforma estrangeira. Em algumas estruturas com instituição ou custódia no exterior, o tratamento pode seguir o regime de aplicações financeiras no exterior, com apuração anual. O enquadramento depende da operação concreta. Nota: o simples fato de uma plataforma não ter CNPJ no Brasil não resolve, por si só, o enquadramento tributário.",
    detalhe: "Base legal: Art. 22 da Lei 9.532/1997 — aplica-se ao regime de ganho de capital",
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
    titulo: "Prazo de pagamento",
    descricao:
      "Nas operações sujeitas ao regime tradicional de ganho de capital, o imposto, quando devido, é recolhido via DARF até o último dia útil do mês seguinte ao da alienação. Código DARF: 4600. Já nas hipóteses enquadradas como aplicações financeiras no exterior, a tributação ocorre de forma anual, na Declaração de Ajuste Anual do IRPF, observadas as regras aplicáveis ao caso concreto.",
    detalhe: "DARF 4600 (ganho de capital) · Declaração Anual (aplicações no exterior)",
  },
  {
    icon: FileText,
    cor: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    titulo: "Declaração Anual (IRPF)",
    descricao:
      'Criptoativos devem ser informados na ficha "Bens e Direitos" da declaração anual do IRPF conforme as regras vigentes da Receita Federal para o respectivo ano-calendário e conforme a natureza do ativo. O enquadramento não deve ser tratado de forma genérica para todos os criptoativos. O grupo, o código e a descrição podem variar conforme o tipo de ativo e as orientações da Receita no programa da DIRPF do ano correspondente.',
    detalhe: "Antes de preencher, confira os códigos e orientações atualizados no programa da DIRPF do respectivo exercício",
  },
  {
    icon: Globe,
    cor: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950",
    titulo: "Criptoativos com instituição ou custódia no exterior",
    descricao:
      "A Lei 14.754/2023 e a regulamentação aplicável passaram a tratar, em determinadas hipóteses, ativos virtuais como aplicações financeiras no exterior. Em regra, isso pode alcançar ativos custodiados ou negociados por instituições localizadas no exterior, conforme o enquadramento jurídico da operação. Esse tratamento não deve ser definido automaticamente apenas porque a plataforma é estrangeira ou porque não possui CNPJ no Brasil. Ativos em autocustódia, sem intermediário, exigem análise própria e não devem ser classificados automaticamente como ativos no exterior. Quando houver enquadramento nesse regime, a tributação tende a ocorrer de forma anual, na Declaração de Ajuste Anual do IRPF, à alíquota de 15%, observadas as regras legais aplicáveis. Perdas e compensações devem observar o regime específico, não sendo recomendável misturar automaticamente com o regime de ganho de capital. Capitais Brasileiros no Exterior (CBE): obrigação do Banco Central, distinta do IRPF — CBE anual se saldo ≥ US$ 1.000.000 em 31/12; CBE trimestral se ≥ US$ 100.000.000. Obrigação acessória de reporte: não se limita a operações em exchange — pode alcançar operações fora de exchange quando o valor mensal ultrapassar o limite legal aplicável (IN 1.888/2019).",
    detalhe: "Lei 14.754/2023 + IN RFB 2.180/2024 · Consulte especialista para casos de autocustódia, DEX e operações sem intermediário",
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
      "A troca de um criptoativo por outro pode caracterizar fato gerador tributário, porque normalmente envolve a alienação de um ativo e a aquisição de outro. No entanto, a forma de apuração depende do regime aplicável ao caso concreto. Nas hipóteses sujeitas ao regime tradicional de ganho de capital, a análise costuma considerar a lógica das alienações e, quando cabível, a regra de isenção mensal de R$ 35.000. Já nas hipóteses enquadradas no regime de aplicações financeiras no exterior, a apuração segue a disciplina própria desse regime. Por isso, a regra dos R$ 35.000 não deve ser aplicada automaticamente a todo swap.",
  },
  {
    pergunta: "Staking e yield farming são tributados?",
    resposta:
      "Os rendimentos de staking e DeFi são considerados rendimentos tributáveis como 'outros rendimentos', sujeitos à tabela progressiva do IR (7,5% a 27,5%). Ainda há controvérsia sobre o momento exato de reconhecimento do rendimento (ao receber ou ao vender).",
  },
  {
    pergunta: "NFTs pagam imposto?",
    resposta:
      "O tratamento tributário dos NFTs exige cautela e depende da natureza do ativo e da operação realizada. Nem todo NFT deve ser tratado automaticamente da mesma forma que os demais criptoativos, nem como aplicação financeira no exterior em qualquer situação. Em alguns casos, o enquadramento pode variar conforme o conteúdo econômico do ativo representado. Por isso, a análise de NFTs deve ser feita caso a caso.",
  },
  {
    pergunta: "Posso compensar prejuízos de cripto?",
    resposta:
      "A compensação de prejuízos depende do regime tributário aplicável à operação. Nas situações sujeitas ao regime tradicional de ganho de capital, a análise deve observar as regras próprias desse regime. Já nas hipóteses enquadradas como aplicações financeiras no exterior, perdas e ganhos seguem a disciplina específica desse regime, inclusive quanto ao período em que a compensação pode ocorrer. Não é recomendável misturar automaticamente prejuízos de regimes diferentes.",
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
  {
    pergunta: "Autocustódia, wallets próprias e DEX",
    resposta:
      "Operações com wallet própria, hardware wallet, MetaMask, protocolos DeFi ou DEX exigem atenção especial. Essas situações não devem ser tratadas automaticamente da mesma forma que operações realizadas com custódia em instituição localizada no exterior. A presença ou ausência de intermediário, a forma de custódia e a natureza da operação podem alterar o enquadramento tributário e as obrigações acessórias.",
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
                  Este conteúdo tem finalidade educacional e resume regras tributárias
                  que podem exigir interpretação conforme a estrutura da operação.
                  O conteúdo mistura diferentes hierarquias normativas: leis federais
                  (fontes primárias), instruções normativas da Receita Federal
                  (obrigações acessórias), orientações de preenchimento da DIRPF
                  (caráter declaratório) e interpretações sobre temas ainda não
                  consolidados. Em casos com autocustódia, DEX, NFTs ou estruturas
                  no exterior, a revisão por contador ou advogado tributarista pode
                  ser recomendável. A legislação tributária está sujeita a alterações.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como ler estas regras */}
        <section className="py-4 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-muted/50 rounded-lg p-5 border border-border/50">
              <h3 className="font-semibold text-sm mb-3">Como ler estas regras</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><strong>Incidência do imposto:</strong> define quando e como pode haver tributação.</li>
                <li><strong>Obrigação acessória:</strong> define quando a operação precisa ser informada à Receita ou a outro órgão.</li>
                <li><strong>Declaração anual:</strong> trata do preenchimento do IRPF.</li>
                <li><strong>Interpretação:</strong> alguns casos, como autocustódia, DEX e certos NFTs, exigem análise mais cuidadosa.</li>
              </ul>
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
                      "Isenção de R$ 35.000/mês (regime de ganho de capital)",
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
