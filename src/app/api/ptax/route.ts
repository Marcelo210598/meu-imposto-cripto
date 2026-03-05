import { NextRequest, NextResponse } from "next/server";

// Cache em memória — evita múltiplas chamadas ao BCB na mesma sessão
const cache = new Map<string, { valor: number; timestamp: number }>();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 horas

async function buscarPTAX(data: string): Promise<number | null> {
  const cached = cache.get(data);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valor;
  }

  // Tenta a data fornecida e recua até 7 dias se for feriado/fim de semana
  for (let i = 0; i < 7; i++) {
    const d = new Date(data + "T12:00:00-03:00");
    d.setDate(d.getDate() - i);

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const dataFormatada = `${mm}-${dd}-${yyyy}`; // MM-DD-YYYY (formato do BCB)

    try {
      // CotacaoDolarDia já retorna o fechamento — sem filtro tipoBoletim
      const url =
        `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
        `CotacaoDolarDia(dataCotacao=@dataCotacao)` +
        `?@dataCotacao='${dataFormatada}'` +
        `&$top=1&$format=json&$select=cotacaoVenda`;

      const res = await fetch(url, {
        next: { revalidate: 43200 }, // 12h
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const json = await res.json();
      if (json.value && json.value.length > 0) {
        const valor = json.value[0].cotacaoVenda as number;
        cache.set(data, { valor, timestamp: Date.now() });
        return valor;
      }
    } catch {
      // Tenta o dia anterior
    }
  }

  return null;
}

// GET /api/ptax?data=2024-01-15
// GET /api/ptax?datas=2024-01-15,2024-02-20,2024-06-01  (bulk)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const dataParam = searchParams.get("data");
  const datasParam = searchParams.get("datas");

  // Bulk: múltiplas datas separadas por vírgula
  if (datasParam) {
    const datas = datasParam.split(",").filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.trim()));

    if (datas.length === 0) {
      return NextResponse.json({ error: "Nenhuma data válida" }, { status: 400 });
    }

    const datasUnicas = [...new Set(datas.map((d) => d.trim()))];
    const resultados: Record<string, number | null> = {};

    await Promise.all(
      datasUnicas.map(async (data) => {
        resultados[data] = await buscarPTAX(data);
      })
    );

    return NextResponse.json({ cotacoes: resultados });
  }

  // Single: uma data
  if (!dataParam || !/^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
    return NextResponse.json({ error: "Data inválida. Use YYYY-MM-DD" }, { status: 400 });
  }

  const cotacao = await buscarPTAX(dataParam);
  if (!cotacao) {
    return NextResponse.json(
      { error: "Cotação PTAX não encontrada para esta data" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: dataParam, cotacaoUSD: cotacao });
}
