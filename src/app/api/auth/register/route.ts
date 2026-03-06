import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { verifyCsrf, csrfError } from "@/lib/csrf";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) return csrfError();

  // Rate limiting: 5 registros por IP a cada 15 minutos (anti-spam)
  const ip = getIp(req);
  if (!rateLimit(`register:${ip}`, 5, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Muitas tentativas de registro. Tente novamente em 15 minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    // Retornar primeiro erro de cada campo (sem vazar internals)
    const mensagem =
      errors.email?.[0] ?? errors.password?.[0] ?? errors.name?.[0] ?? "Dados inválidos";
    return NextResponse.json({ error: mensagem }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashed,
      },
      select: { id: true, name: true, email: true, plano: true },
    });

    await auditLog({ action: "register", userId: user.id, ip });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
