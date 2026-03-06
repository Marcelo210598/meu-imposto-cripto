import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  token: z.string().min(1).max(200),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[\d\W]/, "Precisa ter pelo menos 1 número ou símbolo"),
});

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  const ip = getIp(req);
  if (!rateLimit(`reset-password:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Muitas tentativas." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
  }

  if (resetToken.usedAt) {
    return NextResponse.json({ error: "Este link já foi utilizado." }, { status: 400 });
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
