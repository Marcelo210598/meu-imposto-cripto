import Link from "next/link";
import { Bitcoin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Bitcoin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Meu Imposto Cripto</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Simplifique o cálculo do seu Imposto de Renda sobre criptomoedas.
              Ferramenta 100% brasileira, seguindo as regras da Receita Federal.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/calculadora" className="hover:text-foreground transition-colors">
                  Calculadora
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-foreground transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition-colors">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/termos" className="hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Meu Imposto Cripto. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Esta ferramenta é apenas para fins informativos. Consulte um contador para orientação fiscal profissional.
          </p>
        </div>
      </div>
    </footer>
  );
}
