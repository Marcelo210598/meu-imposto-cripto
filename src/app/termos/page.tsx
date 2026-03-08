import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Termos de Uso | Meu Imposto Cripto",
  description: "Termos de uso da plataforma Meu Imposto Cripto",
};

export default function TermosPage() {
  const ultimaAtualizacao = "08 de março de 2026";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Termos de Uso</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
            <p className="text-muted-foreground text-sm">Última atualização: {ultimaAtualizacao}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou utilizar o <strong>Meu Imposto Cripto</strong> (&quot;Plataforma&quot;), você concorda com estes
              Termos de Uso. Se não concordar com qualquer parte, não utilize a Plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Meu Imposto Cripto é uma ferramenta de auxílio para o cálculo e organização de informações
              tributárias relacionadas a operações com criptoativos. A Plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Realiza cálculos automáticos com base nas operações informadas pelo usuário</li>
              <li>Gera relatórios de apoio para declaração do IRPF</li>
              <li>Importa extratos de exchanges para organização das operações</li>
            </ul>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                ⚠ Aviso importante: O Meu Imposto Cripto é uma ferramenta de apoio e não substitui a orientação
                de um contador ou assessor tributário. Sempre consulte um profissional habilitado para a entrega
                da sua declaração.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Planos e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma oferece um plano gratuito com funcionalidades limitadas e planos pagos com recursos
              adicionais. As cobranças são processadas via Stripe e os valores são os indicados na página de preços
              no momento da contratação.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Assinaturas são mensais e renováveis automaticamente. Você pode cancelar a qualquer momento pelo
              painel do cliente, mantendo o acesso até o fim do período pago. Oferecemos garantia de 7 dias:
              solicite o reembolso integral caso não esteja satisfeito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Responsabilidades do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao utilizar a Plataforma, você se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Fornecer informações verdadeiras e precisas sobre suas operações</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Não utilizar a Plataforma para fins ilegais ou fraudulentos</li>
              <li>Verificar os cálculos gerados antes de utilizá-los em sua declaração fiscal</li>
              <li>Não tentar acessar contas de outros usuários ou sistemas da Plataforma</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Meu Imposto Cripto fornece a Plataforma &quot;como está&quot;. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Erros ou imprecisões nos cálculos decorrentes de dados incorretos fornecidos pelo usuário</li>
              <li>Multas, juros ou penalidades fiscais resultantes do uso das informações geradas</li>
              <li>Alterações na legislação tributária após a geração dos relatórios</li>
              <li>Interrupções temporárias do serviço por manutenção ou fatores externos</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos os direitos sobre a Plataforma, incluindo código-fonte, design, marca e conteúdo, são de
              propriedade exclusiva do Meu Imposto Cripto. É vedada a reprodução, distribuição ou uso comercial
              sem autorização expressa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar estes Termos a qualquer momento. Notificaremos usuários ativos por email sobre
              mudanças relevantes. O uso continuado da Plataforma após as alterações constitui aceitação dos
              novos Termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Legislação Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
              Comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes destes Termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos, entre em contato:{" "}
              <a
                href="mailto:difoggijuniormarcelo@gmail.com"
                className="text-primary underline-offset-4 hover:underline"
              >
                difoggijuniormarcelo@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
