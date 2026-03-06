import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Middleware usa authConfig (edge-safe) — sem bcryptjs ou Prisma
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const rotasProtegidas = ["/calculadora", "/relatorio", "/perfil"];
  const isProtected = rotasProtegidas.some((r) => pathname.startsWith(r));

  if (isProtected && !req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Não rodar em assets estáticos e rotas de auth do NextAuth
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
