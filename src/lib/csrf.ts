/**
 * Proteção CSRF para rotas de API que alteram estado (POST, DELETE, PATCH).
 * Verifica que o header Origin bate com o host da requisição.
 * Protege contra ataques cross-site onde o browser envia cookies automaticamente.
 */

const ALLOWED_ORIGINS_DEV = ["localhost:3000", "localhost:3001", "127.0.0.1:3000"];

export function verifyCsrf(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host") ?? "";
  const isDev = process.env.NODE_ENV === "development";

  // Requisições same-origin sem Origin header (ex: curl, Postman) — bloquear em produção
  if (!origin) {
    return isDev; // permite em dev, bloqueia em prod
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false; // origin malformado
  }

  // Dev: permite localhost
  if (isDev && ALLOWED_ORIGINS_DEV.some((h) => originHost === h || host === h)) {
    return true;
  }

  // Prod: origin deve bater com host
  return originHost === host;
}

/** Retorna resposta 403 padronizada para falha de CSRF */
export function csrfError() {
  return Response.json({ error: "Requisição inválida" }, { status: 403 });
}
