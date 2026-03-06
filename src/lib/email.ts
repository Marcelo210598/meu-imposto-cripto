import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("EMAIL_USER ou EMAIL_APP_PASSWORD não configurados");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

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
