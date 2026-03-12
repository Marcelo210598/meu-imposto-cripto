import { Star } from "lucide-react";

const exchanges = [
  { name: "Binance", color: "#F0B90B" },
  { name: "Mercado Bitcoin", color: "#F26522" },
  { name: "Bybit", color: "#F7A600" },
  { name: "Coinbase", color: "#0052FF" },
  { name: "Kraken", color: "#5741D9" },
  { name: "OKX", color: "#000000" },
  { name: "Foxbit", color: "#1DA462" },
  { name: "NovaDAX", color: "#E31837" },
];

const depoimentos: { nome: string; cargo: string; texto: string; estrelas: number }[] = [];

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
          <div className="flex flex-wrap justify-center gap-3">
            {exchanges.map((ex) => (
              <ExchangeLogo key={ex.name} {...ex} />
            ))}
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-border/50 mb-12" />

        {/* CTA honesto */}
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Seja um dos primeiros</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Estamos no início e construindo junto com a comunidade. Experimente grátis e nos ajude a melhorar a ferramenta.
          </p>
        </div>

        {/* Stats rápidos */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
          {[
            { value: "9", label: "exchanges suportadas" },
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
