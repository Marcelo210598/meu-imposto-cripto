import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { parseBinancePDF } from "@/lib/pdf-parser";

// Tamanho máximo: 10 MB
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  // Rate limit: 10 uploads por minuto por IP
  const ip = getIp(req);
  const allowed = rateLimit(`parse-pdf:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde um momento." }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande (máximo 10 MB)." }, { status: 413 });
  }

  const fileName = (file as File).name ?? "";
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Apenas arquivos PDF são aceitos." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Importação dinâmica — evita bug de inicialização do pdf-parse no Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const data = await pdfParse(buffer);
    const text: string = data.text ?? "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF. Verifique se é um PDF gerado pela Binance." },
        { status: 422 }
      );
    }

    const operacoes = parseBinancePDF(text);

    if (operacoes.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhuma operação encontrada no PDF. " +
            'Certifique-se de exportar "Spot - Histórico de Trades" (não Transaction History) ' +
            "no formato PDF pela Central de Download de Dados da Binance.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ operacoes, total: operacoes.length });
  } catch (err) {
    console.error("parse-pdf error:", err);
    return NextResponse.json(
      { error: "Erro ao processar o PDF. Tente novamente ou use o formato Excel." },
      { status: 500 }
    );
  }
}
