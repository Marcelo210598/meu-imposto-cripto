# Meu Imposto Cripto - Resumo do Projeto

> Última atualização: 05/03/2026 (Sessão 3 — Stripe Live)

## 🎯 Objetivo

Calculadora de Imposto de Renda para operações com criptomoedas no Brasil, seguindo as regras da Receita Federal.

## 🔗 Links Importantes

- **Produção:** https://workspace-tau-olive.vercel.app
- **Repositório:** https://github.com/Marcelo210598/meu-imposto-cripto
- **Vercel Dashboard:** https://vercel.com (projeto: meu-imposto-cripto)

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 15.1 | Framework principal |
| React | 19 | UI Components |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 3.4 | Estilização |
| shadcn/ui | new-york | Componentes UI |
| Recharts | 2.15 | Gráficos |
| Prisma | 5.x | ORM |
| Neon PostgreSQL | - | Banco de dados |
| NextAuth | v5 beta | Autenticação |
| bcryptjs | - | Hash de senhas |
| Vercel | - | Deploy |

## 📊 Status do Projeto

### Completo ✅
- [x] Landing page
- [x] Calculadora funcional
- [x] Parser CSV (Binance, MB)
- [x] Cálculo preço médio
- [x] Cálculo IR com regras BR
- [x] Gráficos evolução
- [x] Portfolio
- [x] Exportação PDF
- [x] Dark mode
- [x] SEO completo
- [x] llms.txt
- [x] FAQ
- [x] Exemplos de cálculo
- [x] Página de preços

### Sprint 1 ✅ (04/03/2026)
- [x] Prisma + Neon PostgreSQL
- [x] NextAuth v5 (login/register)
- [x] API /api/operacoes (GET/POST/DELETE)
- [x] Calculadora: DB para logados, localStorage para guests (limite 50)
- [x] Página /legislacao (lei brasileira, DeCripto, FAQ)
- [x] Header com auth state e menu de usuário

### Sprint 2 ✅ (04/03/2026)
- [x] Deploy Vercel com env vars configuradas
- [x] Persistência de operações no banco via API REST
- [x] Upload CSV com detecção automática de exchange
- [x] Suporte a múltiplas exchanges (Binance, Bybit, Coinbase...)
- [x] Cálculo de IR integrado com dados do banco
- [x] Dashboard com gráficos e portfolio

### Sprint 3 ✅ (04/03/2026)
- [x] PTAX automático via API oficial do Banco Central (proxy server-side)
  - Single e bulk (Promise.all), cache 12h, retry 7 dias
  - Formato correto: MM-DD-YYYY (quirk da API BCB)
- [x] Conversão automática USDT/USD→BRL na importação CSV
  - Detecção de exchanges internacionais (Bybit USDT, Coinbase USD, etc.)
  - Painel âmbar com preview das cotações antes de confirmar
- [x] Relatório IRPF completo (/relatorio)
  - Seção 1: Bens e Direitos (Grupo 08 — BTC→01, ETH→02, USDT→03, outros→09)
  - Seção 2: Ganho de Capital mês a mês (DARF/Isento/Sem vendas)
  - Seção 3: Rendimentos Isentos (código 05 IRPF)
  - Seção 4: Texto GCAP + exportação CSV (BOM UTF-8, ponto-e-vírgula)
  - Impressão otimizada (CSS print-friendly)
- [x] Navegação atualizada (header + dropdown + botão na calculadora)
- [x] Sitemap atualizado com /relatorio
- [x] Build limpo (19 rotas, 0 erros), deploy Vercel ✅ (commit c225382)

### 05/03/2026 — Stripe Live ✅
- [x] Integração Stripe Checkout (live mode)
- [x] Webhook configurado (4 eventos, Ativo)
- [x] Portal de assinatura (gerenciar/cancelar)
- [x] Planos Pro (R$29/mês) e Contador (R$99/mês) em live mode
- [x] Fix: env vars Stripe tinham \n literal (corrigido via echo -n)
- [x] try/catch robusto em /api/stripe/checkout e /api/stripe/portal
- [x] Password reset (email via Nodemailer/Gmail SMTP)
- [x] 19 testes unitários (Jest + ts-jest)
- [x] CSRF protection, rate limiting, validação Zod
- PENDENTE: revisão Stripe (2-3 dias úteis para live mode completo)

### Próxima sessão — Visual/Animações
- [ ] Animações na landing page (Framer Motion ou CSS)
- [ ] Elementos mais dinâmicos no hero
- [ ] Micro-interações nos cards de stats
- [ ] Transições suaves entre seções
- [ ] Floating elements / partículas no fundo (crypto theme)

## 💰 Regras de IR (Brasil)

```
Isenção: Vendas ≤ R$ 35.000/mês
Alíquotas:
  - Até R$ 5M: 15%
  - R$ 5M a 10M: 17.5%
  - R$ 10M a 30M: 20%
  - Acima R$ 30M: 22.5%
Vencimento: Último dia útil do mês seguinte
```

## 🚀 Como rodar localmente

```bash
cd "Desktop/Projetos AI/meu-imposto-cripto"
npm install
npm run dev
# Acesse: http://localhost:3000
```

## 📁 Estrutura principal

```
src/
├── app/
│   ├── api/
│   │   ├── operacoes/     # CRUD operações (auth)
│   │   ├── ptax/          # Proxy PTAX Banco Central
│   │   └── auth/          # NextAuth handlers
│   ├── calculadora/       # Calculadora de IR
│   ├── relatorio/         # Relatório IRPF anual
│   ├── legislacao/        # Lei brasileira / DeCripto
│   ├── login/ register/   # Auth pages
│   └── ...
├── components/
│   ├── ui/                # shadcn/ui
│   ├── layout/            # Header, Footer
│   ├── home/              # Landing page
│   └── calculadora/       # Upload CSV, gráficos
└── lib/
    ├── calculadora.ts     # Cálculos de IR
    ├── relatorio.ts       # Geração relatório IRPF/GCAP
    ├── csv-parser.ts      # Parser de exchanges
    └── storage.ts         # localStorage (guests)
```

## 📝 Commits recentes

| Hash | Descrição |
|------|-----------|
| 0152300 | docs: snapshot Sprint 3 em historico/ |
| c225382 | feat(sprint3): PTAX Banco Central, conversão USD→BRL, Relatório IRPF completo |
| (sprint2) | feat(sprint2): persistência Neon, upload CSV multi-exchange, deploy Vercel |
| (sprint1) | feat(sprint1): auth NextAuth v5, Prisma Neon, API operacoes, legislação |
| f5298b3 | feat: adiciona OG images, favicons e analytics |

## 🔑 Variáveis de ambiente

```env
# Banco de dados (Neon — pooler)
DATABASE_URL="postgresql://...pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30"

# Auth
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"  # ou https://... em produção

# Analytics (opcional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=workspace-tau-olive.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📅 Histórico de sessões

| Data | Principais entregas |
|------|---------------------|
| 02/02/2025 | Projeto criado do zero, 3 fases implementadas, SEO, Analytics |
| 04/03/2026 (sprint1) | Sprint 1: auth, Neon DB, API operacoes, legislação, CSV fixes |
| 04/03/2026 (sprint2) | Sprint 2: deploy Vercel, persistência, upload CSV multi-exchange |
| 04/03/2026 (sprint3) | Sprint 3: PTAX BCB, conversão USD→BRL, Relatório IRPF completo, GCAP |
| 05/03/2026 (sessão 1-2) | Sprint segurança: CSRF, rate limit, Zod, testes Jest, password reset, Nodemailer |
| 05/03/2026 (sessão 3) | Stripe live: checkout funcionando, webhook ativo, fix env vars com \n |

---

*Para detalhes de cada sessão, veja os arquivos em `/historico/YYYY-MM-DD.md`*
