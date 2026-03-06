import { z } from "zod";

/** Remove tags HTML e caracteres de controle de uma string */
function sanitize(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

const sanitizedString = (max: number) =>
  z.string().max(max).transform(sanitize);

// ─── Operação ────────────────────────────────────────────────────────────────

export const operacaoSchema = z.object({
  tipo: z.enum(["compra", "venda"]),
  // Apenas letras maiúsculas e números, ex: BTC, ETH, USDT
  cripto: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Símbolo de cripto inválido"),
  quantidade: z.number().positive("Quantidade deve ser positiva").max(1e15),
  valorTotal: z.number().positive("Valor total deve ser positivo").max(1e15),
  precoUnitario: z.number().positive("Preço unitário deve ser positivo").max(1e15),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida, use YYYY-MM-DD")
    .refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  exchange: sanitizedString(100).optional(),
});

export type OperacaoInput = z.infer<typeof operacaoSchema>;

// Bulk: aceita array ou objeto único
export const operacoesBulkSchema = z
  .union([operacaoSchema, z.array(operacaoSchema).min(1).max(500)])
  .transform((v) => (Array.isArray(v) ? v : [v]));

// ─── Register ────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: sanitizedString(100).optional(),
  email: z.string().email("Email inválido").max(200).toLowerCase(),
  // Mínimo 8 chars, ao menos 1 número ou símbolo
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128, "Senha muito longa")
    .regex(
      /^(?=.*[0-9!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`])/,
      "Senha deve ter pelo menos 1 número ou símbolo"
    ),
});

// ─── PTAX (já tem regex, mas centraliza aqui) ─────────────────────────────────

export const ptaxSingleSchema = z.object({
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida, use YYYY-MM-DD")
    .refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
});

export const ptaxBulkSchema = z.object({
  datas: z
    .string()
    .max(500) // evita payload enorme
    .transform((v) =>
      v
        .split(",")
        .map((d) => d.trim())
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    )
    .pipe(z.array(z.string()).min(1, "Nenhuma data válida").max(100, "Máximo 100 datas")),
});
