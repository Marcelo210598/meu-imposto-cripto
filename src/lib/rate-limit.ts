/**
 * Rate limiter in-memory com sliding window.
 * Funciona por instância de serverless — suficiente para projetos sem Redis.
 * Chave: string (ex: "ip:123.4.5.6" ou "user:abc123")
 */

interface Bucket {
  count: number;
  reset: number; // timestamp ms do próximo reset
}

const store = new Map<string, Bucket>();

// Limpeza periódica para não vazar memória
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of store) {
    if (now > bucket.reset) store.delete(key);
  }
}, 60_000);

/**
 * Verifica se a requisição está dentro do limite.
 * @returns true = permitido | false = bloqueado
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count++;
  return true;
}

/** Extrai IP da requisição (compatível com Vercel) */
export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
