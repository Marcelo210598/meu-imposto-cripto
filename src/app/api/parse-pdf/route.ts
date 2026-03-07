import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { parseBinancePDF } from "@/lib/pdf-parser";

const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
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
    const text = await extractTextFromPDF(buffer);

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
            'Certifique-se de exportar "Spot - Histórico de Trades" pela Central de Download de Dados da Binance.',
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

// ─── extração de texto via pdfjs-dist (JS puro, sem deps nativas) ────────────

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // pdfjs-dist é JS puro — funciona em qualquer ambiente serverless
  const pdfjsLib = await import("pdfjs-dist");

  // Sem worker no Node.js / Vercel
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    // @ts-expect-error — opção válida mas não tipada em todas as versões
    disableWorker: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Cada item é uma palavra/token — juntamos com espaço para reconstruir linhas
    // hasEOL indica fim de linha → substituímos por \n para o parser linha a linha
    let pageText = "";
    for (const item of content.items) {
      if ("str" in item) {
        pageText += item.str;
        if (item.hasEOL) pageText += "\n";
        else pageText += " ";
      }
    }

    fullText += pageText + "\n";
  }

  return fullText;
}
