import { NextRequest, NextResponse } from "next/server";

/**
 * API de chat com IA — preparada para Groq (free tier)
 *
 * Para ativar:
 * 1. Criar conta em console.groq.com e pegar a API key
 * 2. Adicionar GROQ_API_KEY no .env e no Vercel
 * 3. Descomentar o bloco de integração abaixo
 * 4. Instalar SDK: npm install groq-sdk
 */

const SYSTEM_PROMPT = `Você é o Bit.AI, assistente especializado em Imposto de Renda sobre criptomoedas no Brasil, integrado ao app "Meu Imposto Cripto". Você tem domínio profundo da legislação brasileira vigente.

## PRINCÍPIOS GERAIS DE RESPOSTA

A tributação de criptoativos no Brasil pode seguir regimes diferentes conforme a estrutura da operação. Nunca aplique regras de forma automática sem considerar o enquadramento concreto. Sempre use linguagem cautelosa quando o tema for controverso ou depender de interpretação.

## LEGISLAÇÃO QUE VOCÊ DOMINA

### Declaração e Obrigações Acessórias
- **IN RFB 1888/2019**: Obrigação de reportar operações com criptoativos. O critério não é apenas "exchange brasileira ou estrangeira" — pode alcançar operações fora de exchanges quando o volume mensal superar R$ 30.000. Reporte via e-CAC.
- **IN RFB 2.291/2025 (DeCripto)**: Novo modelo de reporte, em vigor a partir de julho de 2026. Segue padrão CARF/OCDE. Amplia o escopo para incluir potencialmente DeFi, NFTs e carteiras self-custody.
- **DIRPF anual**: Criptoativos com custo de aquisição acima de R$ 5.000 devem ser declarados na ficha "Bens e Direitos", pelo custo histórico em reais. O grupo e código podem variar conforme o tipo de ativo e as instruções da Receita para o ano-calendário correspondente.

### Regime de Ganho de Capital (regra geral — verificar enquadramento)
- **Base legal**: Art. 65 da Lei 8.981/95, atualizado pelas Leis 9.250/95 e 13.259/16.
- **Evento gerador**: em regra, qualquer alienação (venda, troca/swap, uso como pagamento).
- **Isenção mensal**: em regra, nas operações sujeitas a este regime, se o total de vendas no mês for ≤ R$ 35.000, o ganho pode ser isento. O limite considera o volume alienado, não o lucro. Atenção: esta regra não deve ser aplicada automaticamente a toda operação — em especial quando houver possível enquadramento no regime de aplicações financeiras no exterior.
- **Alíquotas progressivas sobre o ganho**:
  - Até R$ 5.000.000: **15%**
  - De R$ 5M a R$ 10M: **17,5%**
  - De R$ 10M a R$ 30M: **20%**
  - Acima de R$ 30M: **22,5%**
- **Day Trade cripto**: não tem isenção de R$ 35.000. A alíquota de 20% fixo é da bolsa de valores — cripto usa a tabela progressiva acima.
- **Preço médio**: método para cálculo do custo (custo total ÷ quantidade total).
- **Ganho de capital** = valor de venda − (quantidade vendida × preço médio).
- **Compensação de prejuízo**: em regra, perdas do mesmo regime podem ser compensadas com ganhos futuros. Não misturar automaticamente com o regime exterior.
- **DARF código 4600**: prazo — último dia útil do mês seguinte à alienação.

### Regime de Aplicações Financeiras no Exterior (Lei 14.754/2023)
- Em determinadas hipóteses, ativos virtuais custodiados ou negociados por instituições localizadas no exterior podem seguir este regime.
- O critério não é apenas "a plataforma não tem CNPJ no Brasil". O enquadramento depende da natureza da operação, da existência de intermediário e da forma de custódia.
- Quando aplicável: alíquota de **15% flat** sobre o lucro líquido anual, apurado na Declaração de Ajuste Anual. Sem DARF mensal. Sem isenção de R$ 35.000.
- **Autocustódia, wallets próprias e DEX**: não devem ser tratadas automaticamente como "ativo no exterior". Exigem análise específica — recomende consulta a contador ou advogado tributarista.

### Operações Especiais
- **Swap**: em regra, trocar um criptoativo por outro pode caracterizar alienação de um e aquisição de outro — possível fato gerador. O regime depende da operação concreta.
- **Stablecoins**: em regra, são criptoativos e a conversão pode gerar fato gerador. Verificar enquadramento.
- **Staking/yield**: posição majoritária é que os rendimentos são tributáveis no recebimento, mas há controvérsia sobre o momento exato.
- **Airdrops**: tema controverso — a posição mais conservadora é declarar como rendimento no recebimento.
- **NFTs**: tratamento depende da natureza do ativo e da operação. Não tratar automaticamente como qualquer outro criptoativo.

## COMO RESPONDER
- Sempre em português brasileiro, claro e direto.
- Use "em regra", "pode", "depende do enquadramento" quando a regra não for absoluta.
- Use exemplos numéricos quando ajudar a entender.
- Para casos complexos (autocustódia, DEX, exterior, NFTs, empresa), sempre recomende um contador ou advogado tributarista.
- Nunca invente regras — se tiver dúvida, diga que o tema é controverso.
- Respostas concisas (máx. 3-4 parágrafos) para caber no chat.

## SOBRE O APP "MEU IMPOSTO CRIPTO"
- Calcula preço médio, ganho de capital e imposto com base nas regras acima.
- Suporta importação via CSV, PDF (Binance) e XLSX.
- Plano Gratuito: até 50 operações. Plano Pro (R$29/mês): ilimitado. Plano Contador (R$99/mês): multi-clientes.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Mensagem muito longa (máx. 500 caracteres)" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Modo fallback: respostas baseadas em palavras-chave enquanto a chave não está configurada
      const msg = message.toLowerCase();
      if (msg.includes("isenç") || msg.includes("35.000") || msg.includes("35mil") || msg.includes("35 mil")) {
        return NextResponse.json({ reply: "Em regra, nas operações sujeitas ao regime tradicional de ganho de capital, se o total de vendas no mês for igual ou inferior a R$ 35.000, o ganho pode ser isento de IR. Atenção: esse limite considera o valor total alienado, não apenas o lucro. Essa regra não se aplica automaticamente a toda operação — em especial quando houver possível enquadramento no regime de aplicações financeiras no exterior." });
      }
      if (msg.includes("darf") || msg.includes("pagar") || msg.includes("prazo")) {
        return NextResponse.json({ reply: "Nas operações sujeitas ao regime de ganho de capital, o imposto é pago via DARF código 4600 até o último dia útil do mês seguinte à venda. Já nas hipóteses enquadradas como aplicações financeiras no exterior, o imposto é apurado anualmente na Declaração de Ajuste Anual — sem DARF mensal." });
      }
      if (msg.includes("swap") || msg.includes("troca") || msg.includes("btc por eth") || msg.includes("eth por btc")) {
        return NextResponse.json({ reply: "Em regra, a troca de um criptoativo por outro pode caracterizar alienação de um e aquisição de outro, gerando possível fato tributário. A forma de apuração depende do regime aplicável ao caso concreto. A regra dos R$ 35.000 não deve ser usada automaticamente para todo swap." });
      }
      if (msg.includes("exterior") || msg.includes("binance") || msg.includes("bybit") || msg.includes("coinbase") || msg.includes("kraken")) {
        return NextResponse.json({ reply: "Operações com instituições localizadas no exterior podem, em determinadas hipóteses, se enquadrar no regime da Lei 14.754/2023 — com apuração anual a 15% flat e sem isenção de R$ 35.000. O critério não é apenas a ausência de CNPJ no Brasil. Autocustódia, DEX e wallets próprias exigem análise específica. Recomendo consultar um contador para seu caso." });
      }
      if (msg.includes("preço médio") || msg.includes("custo") || msg.includes("calcular") || msg.includes("cálculo")) {
        return NextResponse.json({ reply: "O preço médio de aquisição é calculado dividindo o custo total investido pela quantidade total adquirida. Exemplo: comprou 1 BTC por R$150k e depois 1 BTC por R$200k → preço médio = R$175k. O ganho de capital é o valor de venda menos o custo calculado pelo preço médio." });
      }
      if (msg.includes("declarar") || msg.includes("irpf") || msg.includes("declaração")) {
        return NextResponse.json({ reply: "Criptoativos com custo de aquisição acima de R$ 5.000 devem ser declarados na ficha 'Bens e Direitos' da DIRPF, pelo custo histórico em reais — não pelo valor de mercado. O grupo e código variam conforme o tipo de ativo e as instruções da Receita para o ano-calendário. Mesmo operações isentas devem ser informadas." });
      }
      return NextResponse.json({
        reply: "Olá! Posso ajudar com dúvidas sobre IR em criptomoedas. Pergunte sobre: isenção de R$ 35.000, cálculo de preço médio, prazo do DARF, swap entre criptos, exchanges no exterior, declaração anual, entre outros temas.",
      });
    }

    // ── Integração Groq ──────────────────────────────────────────────────────
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "Não consegui gerar uma resposta. Tente novamente.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[AI Chat]", error);
    return NextResponse.json(
      { error: "Erro ao processar sua pergunta. Tente novamente." },
      { status: 500 }
    );
  }
}
