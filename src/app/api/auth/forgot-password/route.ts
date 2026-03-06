import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email(),
});

// Rate limit: 3 req / 15 min por IP — evita enumeração de e-mails
const LIMIT = 3;
const WINDOW = 15 * 60_000;

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const ip = getIp(req);
  if (!rateLimit(`forgot-password:${ip}`, LIMIT, WINDOW)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 15 minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Sempre retorna sucesso para não vazar quais e-mails existem
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    // Usuário não existe ou usa OAuth — retorna 200 silenciosamente
    return NextResponse.json({ ok: true });
  }

  // Invalida tokens anteriores do usuário
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Gera token seguro de 32 bytes (256 bits)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60_000); // 1 hora

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://workspace-tau-olive.vercel.app";
  const resetUrl = `${baseUrl}/redefinir-senha?token=${token}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    console.error("Erro ao enviar e-mail de reset:", err);
    // Não expõe o erro ao cliente
  }

  return NextResponse.json({ ok: true });
}
