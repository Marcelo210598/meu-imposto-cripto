import type { NextAuthConfig } from "next-auth";

/**
 * Configuração edge-safe do NextAuth.
 * NÃO importa bcryptjs ou Prisma — compatível com Edge Runtime (middleware).
 * O providers com Credentials (bcrypt) fica em auth.ts (Node.js runtime).
 */
// Timeout absoluto da sessão: 7 dias — expira mesmo com uso contínuo
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // segundos

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: 24 * 60 * 60, // renova o cookie a cada 24h de uso
  },
  pages: {
    signIn: "/login",
  },
  providers: [], // Credentials é adicionado em auth.ts
  callbacks: {
    authorized({ auth, request }) {
      // Usado pelo middleware para verificar se o usuário está autenticado
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;

      const rotasProtegidas = ["/relatorio", "/perfil", "/exchanges"];
      const isProtected = rotasProtegidas.some((r) => pathname.startsWith(r));

      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // OAuth: buscar plano do banco na primeira vez (user.plano pode não estar disponível)
        if (account?.provider === "google") {
          // plano virá do DB via adapter — usa "gratis" como fallback
          token.plano = (user as { plano?: string }).plano ?? "gratis";
        } else {
          token.plano = (user as { plano?: string }).plano ?? "gratis";
        }
        // Grava timestamp de emissão para calcular timeout absoluto
        token.issuedAt = Math.floor(Date.now() / 1000);
      }

      // Verifica timeout absoluto (7 dias a partir da emissão original)
      const issuedAt = token.issuedAt as number | undefined;
      if (issuedAt) {
        const age = Math.floor(Date.now() / 1000) - issuedAt;
        if (age > SESSION_MAX_AGE) {
          // Retorna token vazio para forçar logout
          return {};
        }
      }

      return token;
    },
    session({ session, token }) {
      // Token vazio = sessão expirada
      if (!token.id) {
        session.user = {} as typeof session.user;
        return session;
      }
      if (token) {
        session.user.id = token.id as string;
        (session.user as { plano?: string }).plano = token.plano as string;
      }
      return session;
    },
  },
};
