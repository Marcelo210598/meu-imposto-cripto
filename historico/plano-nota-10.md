# Plano para Nota 10 — Meu Imposto Cripto
> Preparado em 10/03/2026 — aplicar na próxima sessão

## 🔴 Prioridade Alta (impacto direto em conversão)

### 1. Liberar calculadora sem login obrigatório
- **Problema:** `/calculadora` está protegida pelo middleware → "Começar Grátis" redireciona para login (assassino de conversão)
- **Fix:** Remover `/calculadora` de `rotasProtegidas` em `src/lib/auth.config.ts`
- **Resultado:** Usuário experimenta o produto → se convence → cria conta
- Arquivo: `src/lib/auth.config.ts` linha ~27

### 2. Corrigir FAQ desatualizado
- **Problema:** FAQ diz "dados salvos localmente no navegador" — era verdade antes, hoje logado salva na nuvem
- **Fix:** Atualizar resposta da pergunta "Os dados são seguros?" na FAQ
- Arquivo: `src/app/faq/page.tsx`

### 3. Corrigir inconsistências no plano grátis
- **Problema A:** Preços diz "50 operações por ano" mas o app diz só "50 operações"
- **Problema B:** Preços diz "Dados salvos localmente" mas logado salva na nuvem
- **Fix:** Padronizar copy — "50 operações" (sem "por ano") + mudar "Dados salvos localmente" para "Dados salvos na nuvem"
- Arquivo: `src/app/precos/page.tsx`

## 🟡 Prioridade Média

### 4. Substituir prova social fictícia
- **Problema:** "500+ usuários ativos" e depoimentos inventados — avaliador percebe
- **Fix:** Trocar por algo honesto: "Seja um dos primeiros" ou remover número por enquanto
- Arquivo: `src/components/home/social-proof.tsx`

### 5. Corrigir favicon/icon-192 quebrados
- **Problema:** 404 em todo request para `/favicon.ico` e `/icon-192.png`
- **Fix:** Verificar se os arquivos estão em `/public/` e se os paths estão certos
- Pasta: `public/`

## 🟢 Prioridade Baixa

### 6. Testar Stripe end-to-end
- Usar test mode (sk_test_...)
- Fluxo: login → /precos → Assinar Pro → checkout → webhook → plano atualizado
- Verificar se banner X/50 some após upgrade

## 📋 Ordem de execução sugerida
1. Fix calculadora sem login (5 min, alto impacto)
2. Fix inconsistências preços (10 min)
3. Fix FAQ (5 min)
4. Fix prova social (10 min)
5. Fix favicon (5 min)
6. Teste Stripe (20 min)

**Tempo total estimado: ~1h**
