import { prisma } from "./db";
import { Prisma } from "@prisma/client";

export type AuditAction =
  | "login"
  | "login_failed"
  | "register"
  | "operacao_delete"
  | "export_csv"
  | "export_pdf";

interface AuditParams {
  action: AuditAction;
  userId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra uma ação sensível no audit log.
 * Nunca lança exceção — falha silenciosa para não bloquear o fluxo principal.
 */
export async function auditLog({ action, userId, ip, metadata }: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        ip: ip ?? null,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (err) {
    // Log no servidor mas não propaga erro
    console.error("[audit] falha ao registrar:", action, err);
  }
}
