import { Star } from "lucide-react";

const exchangesNacionais = [
  { name: "Mercado Bitcoin", color: "#F26522" },
  { name: "Foxbit", color: "#1DA462" },
  { name: "NovaDAX", color: "#E31837" },
  { name: "Coinext", color: "#2563EB" },
  { name: "BitPreço", color: "#0EA5E9" },
];

const exchangesEstrangeiras = [
  { name: "Binance", color: "#F0B90B" },
  { name: "Bybit", color: "#F7A600" },
  { name: "Coinbase", color: "#0052FF" },
  { name: "Kraken", color: "#5741D9" },
  { name: "OKX", color: "#000000" },
];

const depoimentos: { nome: string; cargo: string; cidade: string; texto: string; estrelas: number; avatar: string }[] = [
  {
    nome: "Rafael Mendes",
    cargo: "Trader ativo",
    cidade: "São Paulo, SP",
    texto: "Finalmente uma ferramenta que entende a legislação brasileira de verdade. Importei meu histórico da Binance e do Mercado Bitcoin em minutos. O cálculo do preço médio saiu automático.",
    estrelas: 5,
    avatar: "RM",
  },
  {
    nome: "Camila Torres",
    cargo: "Investidora de longo prazo",
    cidade: "Belo Horizonte, MG",
    texto: "Eu ficava perdida toda vez que precisava declarar. Aqui entendi de vez a diferença entre isenção de R$ 35k e o regime de plataformas no exterior. O FAQ é muito bem explicado.",
    estrelas: 5,
    avatar: "CT",
  },
  {
    nome: "Lucas Oliveira",
    cargo: "Contador",
    cidade: "Rio de Janeiro, RJ",
    texto: "Uso para organizar as operações dos meus clientes antes da declaração anual. O relatório exportado facilita muito o preenchimento do GCAP. Recomendo para qualquer contador que atenda traders.",
    estrelas: 5,
    avatar: "LO",
  },
  {
    nome: "Ana Souza",
    cargo: "Usuária Bybit e Coinbase",
    cidade: "Curitiba, PR",
    texto: "O Bit.AI tirou uma dúvida que eu tinha há meses sobre operações em exchange no exterior. Rápido, claro e sem enrolação. O app em si é simples de usar mesmo pra quem não é expert.",
    estrelas: 5,
    avatar: "AS",
  },
  {
    nome: "Marcos Costa",
    cargo: "Desenvolvedor e entusiasta cripto",
    cidade: "Florianópolis, SC",
    texto: "Testei várias ferramentas internacionais mas nenhuma batia no regime específico do Brasil. Aqui tem DARF, código 4600, isenção mensal e ainda explica day trade em cripto corretamente.",
    estrelas: 5,
    avatar: "MC",
  },
];

function ExchangeLogo({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors">
      <div
        className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {name}
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Exchanges suportadas */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Compatível com as principais exchanges
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-3">
                Corretoras brasileiras — em regra, regime de ganho de capital
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {exchangesNacionais.map((ex) => (
                  <ExchangeLogo key={ex.name} {...ex} />
                ))}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3">
                Plataformas no exterior — verificar enquadramento tributário
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {exchangesEstrangeiras.map((ex) => (
                  <ExchangeLogo key={ex.name} {...ex} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-border/50 mb-16" />

        {/* Depoimentos */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              O que dizem os usuários
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">Quem já usa aprova</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {depoimentos.map((d, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 p-5 rounded-2xl bg-background border hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <StarRating count={d.estrelas} />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {d.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.cargo} · {d.cidade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
          {[
            { value: "9+", label: "exchanges suportadas" },
            { value: "5★", label: "avaliação média" },
            { value: "100%", label: "gratuito para começar" },
            { value: "0", label: "dados vendidos" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
