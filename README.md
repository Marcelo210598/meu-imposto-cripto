# Meu Imposto Cripto

Calculadora de Imposto de Renda para operações com criptomoedas no Brasil.

## Stack

- **Next.js 15** - App Router, Server Components
- **React 19** - UI Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Charts and visualizations

## Funcionalidades

- [ ] Importação de CSV de exchanges (Binance, Mercado Bitcoin, Foxbit)
- [ ] Cálculo automático de preço médio de aquisição
- [ ] Cálculo de ganho/perda por operação
- [ ] Aplicação das regras da Receita Federal
  - Isenção de R$ 35.000/mês em vendas
  - Alíquotas progressivas (15% a 22.5%)
- [ ] Dashboard com visualização de operações
- [ ] Exportação para GCAP
- [ ] Relatórios por período

## Regras de Imposto (Brasil)

### Isenção
- Vendas mensais até R$ 35.000 são isentas de IR

### Alíquotas sobre ganho de capital
| Ganho | Alíquota |
|-------|----------|
| Até R$ 5 milhões | 15% |
| De R$ 5 a 10 milhões | 17.5% |
| De R$ 10 a 30 milhões | 20% |
| Acima de R$ 30 milhões | 22.5% |

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

## Estrutura do Projeto

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── calculadora/        # Calculadora page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, Footer
│   └── home/               # Landing page components
└── lib/
    └── utils.ts            # Utility functions
```

## License

MIT
