import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade | Meu Imposto Cripto",
  description: "Política de Privacidade e tratamento de dados da plataforma Meu Imposto Cripto",
};

export default function PrivacidadePage() {
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
          <h1 className="ml-4 text-lg font-semibold">Política de Privacidade</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground text-sm">Última atualização: {ultimaAtualizacao}</p>
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Esta Política está em conformidade com a{" "}
                <strong>Lei Geral de Proteção de Dados (LGPD) — Lei nº 13.709/2018</strong>.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Controlador dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong>Meu Imposto Cripto</strong> é o controlador dos dados pessoais coletados através desta
              Plataforma. Para questões relacionadas aos seus dados, entre em contato pelo email:{" "}
              <a
                href="mailto:difoggijuniormarcelo@gmail.com"
                className="text-primary underline-offset-4 hover:underline"
              >
                difoggijuniormarcelo@gmail.com
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos os seguintes dados para o funcionamento da Plataforma:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold text-sm mb-2">Dados de Cadastro</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Nome completo</li>
                  <li>Endereço de email</li>
                  <li>Senha (armazenada com hash bcrypt — nunca em texto puro)</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold text-sm mb-2">Dados de Operações (inseridos pelo usuário)</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Tipo, data, valor e quantidade das operações com criptoativos</li>
                  <li>Nome da exchange utilizada</li>
                  <li>Dados importados de extratos em CSV, PDF ou XLSX</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-background">
                <h3 className="font-semibold text-sm mb-2">Dados de Uso e Pagamento</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Logs de acesso e ações (para segurança e auditoria)</li>
                  <li>Plano de assinatura ativo</li>
                  <li>Dados de pagamento processados pelo Stripe (não armazenamos dados de cartão)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Finalidade e Base Legal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Finalidade</th>
                    <th className="text-left py-2 font-medium">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  <tr>
                    <td className="py-3 pr-4">Criação e gestão de conta</td>
                    <td className="py-3">Art. 7º, V — Execução de contrato</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Cálculo e geração de relatórios fiscais</td>
                    <td className="py-3">Art. 7º, V — Execução de contrato</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Processamento de pagamentos</td>
                    <td className="py-3">Art. 7º, V — Execução de contrato</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Segurança e prevenção a fraudes</td>
                    <td className="py-3">Art. 7º, IX — Legítimo interesse</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Comunicações sobre a conta e serviço</td>
                    <td className="py-3">Art. 7º, V — Execução de contrato</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados são compartilhados apenas com:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Stripe</strong> — processamento de pagamentos (
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                  política de privacidade
                </a>
                )
              </li>
              <li>
                <strong className="text-foreground">Neon (Supabase)</strong> — armazenamento seguro de dados em
                servidores na região sa-east-1 (São Paulo)
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong> — hospedagem da aplicação
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Não vendemos, alugamos ou compartilhamos</strong> seus dados
              com terceiros para fins publicitários ou comerciais.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Retenção dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos seus dados pelo período em que você utiliza a Plataforma. Após o encerramento da conta,
              os dados são excluídos em até 30 dias, exceto quando a retenção for obrigatória por lei (ex: registros
              contábeis e fiscais — até 5 anos, conforme legislação brasileira).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Acesso</strong> — confirmar o tratamento e acessar seus dados</li>
              <li><strong className="text-foreground">Correção</strong> — corrigir dados incompletos ou inexatos</li>
              <li><strong className="text-foreground">Exclusão</strong> — solicitar a exclusão dos seus dados</li>
              <li><strong className="text-foreground">Portabilidade</strong> — receber seus dados em formato estruturado</li>
              <li><strong className="text-foreground">Revogação</strong> — revogar o consentimento a qualquer momento</li>
              <li><strong className="text-foreground">Oposição</strong> — opor-se ao tratamento em caso de irregularidade</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Para exercer qualquer direito, entre em contato:{" "}
              <a
                href="mailto:difoggijuniormarcelo@gmail.com"
                className="text-primary underline-offset-4 hover:underline"
              >
                difoggijuniormarcelo@gmail.com
              </a>
              . Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Senhas armazenadas com hash bcrypt (irreversível)</li>
              <li>Conexões protegidas por SSL/TLS</li>
              <li>Banco de dados com acesso restrito e logs de auditoria</li>
              <li>Rate limiting para prevenir ataques de força bruta</li>
              <li>Proteção CSRF em todas as operações sensíveis</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies de
              rastreamento ou publicidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política periodicamente. Notificaremos por email em caso de mudanças
              relevantes. A data de &quot;Última atualização&quot; no topo indica quando a versão atual entrou em vigor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contato e DPO</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para qualquer questão sobre privacidade ou proteção de dados, entre em contato com o responsável
              pelo tratamento de dados:
            </p>
            <div className="p-4 rounded-lg border bg-background text-sm space-y-1 text-muted-foreground">
              <p><strong className="text-foreground">Meu Imposto Cripto</strong></p>
              <p>Email: difoggijuniormarcelo@gmail.com</p>
              <p>Você também pode registrar uma reclamação na ANPD (Autoridade Nacional de Proteção de Dados): gov.br/anpd</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
