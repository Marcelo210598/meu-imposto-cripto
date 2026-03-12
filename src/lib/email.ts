import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("EMAIL_USER ou EMAIL_APP_PASSWORD não configurados");
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const user = process.env.EMAIL_USER;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Meu Imposto Cripto" <${user}>`,
    to,
    subject: "Bem-vindo ao Meu Imposto Cripto!",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #16a34a; margin-bottom: 4px;">Meu Imposto Cripto</h2>
        <p style="color: #374151; font-size: 16px; margin-bottom: 8px;">
          Olá, <strong>${name}</strong>! Seja bem-vindo(a) 👋
        </p>
        <p style="color: #374151; margin-bottom: 24px;">
          Sua conta foi criada com sucesso. Agora você pode calcular o IR sobre suas criptomoedas
          com precisão e de acordo com as regras da Receita Federal.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #15803d;">No plano gratuito você tem:</p>
          <ul style="margin: 0; padding-left: 16px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>Até 50 operações registradas</li>
            <li>Cálculo de IR com regras da Receita Federal</li>
            <li>Importação via CSV e PDF (Binance, Bybit, MB e mais)</li>
            <li>Exportação de resumo em PDF</li>
          </ul>
        </div>

        <a
          href="${process.env.AUTH_URL ?? "https://workspace-tau-olive.vercel.app"}/calculadora"
          style="display: inline-block; background: #16a34a; color: #fff;
                 text-decoration: none; padding: 12px 28px; border-radius: 8px;
                 font-weight: 600; font-size: 14px;"
        >
          Acessar minha calculadora →
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          Qualquer dúvida, responda este email. Estamos aqui para ajudar.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const user = process.env.EMAIL_USER;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Meu Imposto Cripto" <${user}>`,
    to,
    subject: "Redefinir sua senha — Meu Imposto Cripto",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">Meu Imposto Cripto</h2>
        <p style="color: #374151; margin-bottom: 24px;">
          Recebemos uma solicitação para redefinir a senha da sua conta.
          Clique no botão abaixo para criar uma nova senha.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #16a34a; color: #fff;
                 text-decoration: none; padding: 12px 24px; border-radius: 8px;
                 font-weight: 600; font-size: 14px;"
        >
          Redefinir Senha
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          Este link expira em <strong>1 hora</strong>.
          Se você não solicitou a troca de senha, ignore este e-mail.
        </p>
        <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">
          Ou acesse: ${resetUrl}
        </p>
      </div>
    `,
  });
}
