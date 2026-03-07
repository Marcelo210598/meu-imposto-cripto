import type { NextConfig } from "next";

const securityHeaders = [
  // Força HTTPS por 2 anos
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Bloqueia iframes (clickjacking)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Impede MIME sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Controla informações no Referer
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Desabilita features desnecessárias
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // DNS prefetch desabilitado (privacidade)
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  // Content Security Policy
  // 'unsafe-inline' necessário para Tailwind/shadcn | 'unsafe-eval' para Next.js dev
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://olinda.bcb.gov.br https://plausible.io https://www.google-analytics.com https://analytics.google.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
  async headers() {
    return [
      {
        // Aplica em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
