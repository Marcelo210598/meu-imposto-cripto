# Meu Imposto Cripto - Progresso

## Última atualização: 02/02/2025 21:30

## 📌 Visão Geral

- **Objetivo:** Calculadora de IR para criptomoedas (Brasil)
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui
- **Status:** MVP funcional, deploy em produção
- **URL:** https://workspace-tau-olive.vercel.app

## ✅ Concluído

### Infraestrutura
- [x] Projeto Next.js 15 configurado
- [x] TypeScript + ESLint
- [x] Tailwind CSS + shadcn/ui
- [x] Deploy na Vercel funcionando
- [x] Git + GitHub configurado

### Frontend
- [x] Landing page (hero, features, how-it-works)
- [x] Header responsivo com menu mobile
- [x] Footer com links
- [x] Dark mode com toggle
- [x] Tema verde (#16a34a) consistente

### Calculadora
- [x] Formulário de operação manual
- [x] Upload e parse de CSV (Binance, MB)
- [x] Lista de operações com delete
- [x] Persistência localStorage
- [x] Cálculo de preço médio
- [x] Cálculo de ganho de capital
- [x] Cálculo de imposto devido
- [x] Resumo mensal com barra de progresso
- [x] Alerta de isenção/tributação
- [x] Portfolio com preço médio por cripto
- [x] Gráficos de evolução (barras e linhas)
- [x] Exportação para PDF

### Páginas de Conteúdo
- [x] FAQ com 16 perguntas em 4 categorias
- [x] Exemplos de cálculo (4 cenários)
- [x] Página de preços (3 planos)

### SEO & Marketing
- [x] Meta tags completas
- [x] Open Graph images
- [x] Twitter Cards
- [x] JSON-LD structured data
- [x] sitemap.xml dinâmico
- [x] robots.txt
- [x] llms.txt
- [x] Favicon e Apple Icon
- [x] manifest.json (PWA ready)
- [x] Analytics (Plausible + GA)

## 🚧 Em progresso

*Nada no momento - sessão encerrada*

## ⚠️ Problemas conhecidos

1. **Aviso de versão @next/swc** - Não afeta funcionamento
2. **Dados só locais** - Perdidos se limpar navegador

## 📈 Métricas

- **Páginas:** 6 (/, /calculadora, /exemplos, /faq, /precos, /sitemap.xml)
- **Componentes:** 15+
- **Commits:** 6

## 📋 Próximos passos

### Prioridade Alta
1. Backend com Neon PostgreSQL
2. Sistema de autenticação
3. Persistência de dados no banco

### Prioridade Média
4. Parser para mais exchanges (Foxbit, NovaDAX)
5. Melhorias de UX mobile
6. Mais criptomoedas

### Prioridade Baixa
7. Integração direta com APIs de exchanges
8. Sistema de pagamentos (Stripe)
9. Exportação formato GCAP oficial
10. App mobile (React Native?)

## 🔧 Configurações importantes

### Variáveis de ambiente (Vercel)
```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=workspace-tau-olive.vercel.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Scripts
```bash
npm run dev     # Desenvolvimento
npm run build   # Build produção
npm run start   # Rodar produção
npm run lint    # Linting
```

## 📚 Dependências principais

```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "recharts": "^2.15.0",
  "tailwindcss": "^3.4.17",
  "@radix-ui/*": "latest",
  "lucide-react": "^0.469.0"
}
```
