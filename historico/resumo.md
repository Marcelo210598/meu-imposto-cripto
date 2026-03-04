# Meu Imposto Cripto - Resumo do Projeto

> Última atualização: 04/03/2026

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

### Pendente 🚧 (Sprint 2)
- [ ] Deploy Vercel com env vars configuradas
- [ ] Geração de DARF (PDF automático)
- [ ] Mais exchanges (Foxbit, Coinbase, NovaDAX)
- [ ] Exportação GCAP
- [ ] Pagamentos (Stripe — Sprint 3)

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
├── app/           # Páginas (App Router)
├── components/    # Componentes React
│   ├── ui/        # shadcn/ui
│   ├── layout/    # Header, Footer
│   ├── home/      # Landing page
│   └── calculadora/
└── lib/           # Lógica de negócio
    ├── calculadora.ts  # Cálculos de IR
    ├── csv-parser.ts   # Parser de exchanges
    └── storage.ts      # localStorage
```

## 📝 Commits recentes

| Hash | Descrição |
|------|-----------|
| f5298b3 | feat: adiciona OG images, favicons e analytics |
| 7493e77 | feat: implementa SEO completo e llms.txt |
| e2bf132 | feat: implementa 3 fases completas do projeto |
| 0b96c8b | fix: adiciona vercel.json |
| 4382675 | feat: implementa projeto do zero com Next.js 15 |

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
| 04/03/2026 | Sprint 1: auth, Neon DB, API operacoes, legislação, CSV fixes |

---

*Para detalhes de cada sessão, veja os arquivos em `/historico/YYYY-MM-DD.md`*
