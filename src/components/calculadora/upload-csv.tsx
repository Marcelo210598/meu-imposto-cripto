"use client";

import { useState, useCallback } from "react";
import {
  Upload, FileText, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, RefreshCw, DollarSign, X, FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseCSV } from "@/lib/csv-parser";
import { Operacao } from "@/lib/types";

interface UploadCSVProps {
  onImport: (operacoes: Operacao[]) => void;
  disabled?: boolean;
}

const EXCHANGES = [
  {
    nome: "Binance",
    instrucoes: 'Perfil → Central de Download de Dados → Spot - Histórico de Trades → PDF ou Excel → Gerar',
    aviso: 'Aceita PDF e Excel (.xlsx). Use "Spot - Histórico de Trades" (não Transaction History).',
    tipo: "br" as const,
  },
  {
    nome: "Mercado Bitcoin",
    instrucoes: "Histórico → Exportar relatório",
    aviso: null,
    tipo: "br" as const,
  },
  {
    nome: "Foxbit",
    instrucoes: "Conta → Histórico de Ordens → Exportar CSV",
    aviso: null,
    tipo: "br" as const,
  },
  {
    nome: "NovaDAX",
    instrucoes: "Conta → Histórico → Exportar",
    aviso: null,
    tipo: "br" as const,
  },
  {
    nome: "Bybit",
    instrucoes: "Assets → Spot → Order History → Export",
    aviso: "Valores em USDT — você precisará converter para BRL após importar",
    tipo: "int" as const,
  },
  {
    nome: "Bitget",
    instrucoes: "Orders → Spot Orders → Export",
    aviso: "Valores em USDT — converter para BRL após importar",
    tipo: "int" as const,
  },
  {
    nome: "OKX",
    instrucoes: "Trade → Order History → Export",
    aviso: "Valores em USDT — converter para BRL após importar",
    tipo: "int" as const,
  },
  {
    nome: "Coinbase",
    instrucoes: "Reports → Generate → Transaction History → CSV",
    aviso: "Valores em USD — converter para BRL após importar",
    tipo: "int" as const,
  },
  {
    nome: "Kraken",
    instrucoes: "History → Export → Trades → CSV",
    aviso: "Valores podem estar em USD — verificar após importar",
    tipo: "int" as const,
  },
];

const EXCHANGES_INTERNACIONAIS = ["Bybit (USDT)", "Bitget (USDT)", "OKX (USDT)", "Coinbase (USD)", "Kraken"];

export function UploadCSV({ onImport, disabled = false }: UploadCSVProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

  // PTAX flow
  const [pendingOps, setPendingOps] = useState<Operacao[] | null>(null);
  const [convertendo, setConvertendo] = useState(false);
  const [cotacoes, setCotacoes] = useState<Record<string, number>>({});
  const [ptaxCarregado, setPtaxCarregado] = useState(false);

  const isInternacional = (op: Operacao) =>
    EXCHANGES_INTERNACIONAIS.some((ex) => op.exchange?.startsWith(ex.split(" ")[0]));

  const buscarPTAX = useCallback(async (ops: Operacao[]) => {
    setConvertendo(true);
    try {
      const datasUnicas = [
        ...new Set(ops.filter(isInternacional).map((op) => op.data)),
      ];

      if (datasUnicas.length === 0) return;

      const res = await fetch(`/api/ptax?datas=${datasUnicas.join(",")}`);
      if (!res.ok) throw new Error("Falha ao buscar PTAX");

      const json = await res.json();
      setCotacoes(json.cotacoes ?? {});
      setPtaxCarregado(true);
    } catch {
      setCotacoes({});
    } finally {
      setConvertendo(false);
    }
  }, []);

  const confirmarImportacao = useCallback(() => {
    if (!pendingOps) return;

    const convertidas = pendingOps.map((op) => {
      if (isInternacional(op) && cotacoes[op.data]) {
        const fator = cotacoes[op.data];
        return {
          ...op,
          valorTotal: parseFloat((op.valorTotal * fator).toFixed(2)),
          precoUnitario: parseFloat((op.precoUnitario * fator).toFixed(2)),
          exchange: op.exchange?.replace(" (USDT)", " (convertido)").replace(" (USD)", " (convertido)"),
        };
      }
      return op;
    });

    onImport(convertidas);
    setPendingOps(null);
    setCotacoes({});
    setPtaxCarregado(false);
    setStatus("success");
    setMessage(`${convertidas.length} operações importadas com sucesso!`);
    setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
  }, [pendingOps, cotacoes, onImport]);

  const cancelarImportacao = () => {
    setPendingOps(null);
    setCotacoes({});
    setPtaxCarregado(false);
    setStatus("idle");
  };

  const handlePDF = useCallback(
    async (file: File) => {
      setStatus("idle");
      setMessage("");

      try {
        // pdfjs-dist roda no browser — sem dependências nativas
        const pdfjsLib = await import("pdfjs-dist");
        // Worker estático servido pelo próprio domínio (CSP-safe)
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let pageText = "";
          for (const item of content.items) {
            if ("str" in item) {
              pageText += item.str;
              pageText += item.hasEOL ? "\n" : " ";
            }
          }
          text += pageText + "\n";
        }

        const { parseBinancePDF } = await import("@/lib/pdf-parser");
        const operacoes = parseBinancePDF(text);

        if (operacoes.length === 0) {
          setStatus("error");
          setMessage(
            'Nenhuma operação encontrada. Exporte "Spot - Histórico de Trades" pela Central de Download de Dados da Binance.'
          );
          return;
        }

        const temInternacional = operacoes.some(isInternacional);
        if (temInternacional) {
          setPendingOps(operacoes);
          setCotacoes({});
          setPtaxCarregado(false);
          return;
        }

        onImport(operacoes);
        setStatus("success");
        setMessage(`${operacoes.length} operações importadas com sucesso!`);
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
      } catch (err) {
        console.error("PDF error:", err);
        setStatus("error");
        setMessage("Erro ao processar o PDF. Verifique se o arquivo é válido.");
      }
    },
    [onImport]
  );

  const handleXLSX = useCallback(
    async (file: File) => {
      setStatus("idle");
      setMessage("");
      try {
        const XLSX = await import("xlsx");
        const arrayBuffer = await file.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) {
          setStatus("error");
          setMessage("Planilha vazia ou formato inválido.");
          return;
        }

        const { parseBinanceXLSX } = await import("@/lib/pdf-parser");
        const operacoes = parseBinanceXLSX(rows);

        if (operacoes.length === 0) {
          setStatus("error");
          setMessage(
            'Nenhuma operação encontrada. Exporte "Spot - Histórico de Trades" pela Central de Download de Dados da Binance.'
          );
          return;
        }

        const temInternacional = operacoes.some(isInternacional);
        if (temInternacional) {
          setPendingOps(operacoes);
          setCotacoes({});
          setPtaxCarregado(false);
          return;
        }

        onImport(operacoes);
        setStatus("success");
        setMessage(`${operacoes.length} operações importadas com sucesso!`);
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
      } catch (err) {
        console.error("XLSX error:", err);
        setStatus("error");
        setMessage("Erro ao processar o arquivo Excel. Verifique se é um .xlsx válido da Binance.");
      }
    },
    [onImport]
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      const name = file.name.toLowerCase();

      if (name.endsWith(".pdf")) {
        return handlePDF(file);
      }

      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        return handleXLSX(file);
      }

      if (!name.endsWith(".csv")) {
        setStatus("error");
        setMessage("Formato não suportado. Selecione um arquivo CSV, PDF ou Excel (.xlsx).");
        return;
      }

      try {
        const content = await file.text();
        const operacoes = parseCSV(content);

        if (operacoes.length === 0) {
          setStatus("error");
          setMessage("Nenhuma operação encontrada. Verifique o formato do arquivo.");
          return;
        }

        const temInternacional = operacoes.some(isInternacional);
        if (temInternacional) {
          setPendingOps(operacoes);
          setCotacoes({});
          setPtaxCarregado(false);
          return;
        }

        onImport(operacoes);
        setStatus("success");
        setMessage(`${operacoes.length} operações importadas com sucesso!`);
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
      } catch (error) {
        if (error instanceof Error && error.message === "BINANCE_TRANSACTION_HISTORY") {
          setStatus("error");
          setMessage(
            'Arquivo "Transaction History" da Binance não é suportado — ele não contém o valor em BRL. ' +
            'Exporte "Spot - Histórico de Trades" pelo menu Central de Download de Dados.'
          );
        } else {
          setStatus("error");
          setMessage("Erro ao processar o arquivo. Verifique o formato.");
          console.error(error);
        }
      }
    },
    [onImport, disabled, handlePDF, handleXLSX]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const brExchanges = EXCHANGES.filter((e) => e.tipo === "br");
  const intExchanges = EXCHANGES.filter((e) => e.tipo === "int");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Operações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de drop */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {status === "idle" && (
            <>
              <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo CSV ou PDF, ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Binance PDF e Excel (.xlsx) · 9 exchanges via CSV · detecção automática
              </p>
              <label>
                <input
                  type="file"
                  accept=".csv,.pdf,.xlsx,.xls"
                  className="hidden"
                  onChange={handleInputChange}
                  disabled={disabled}
                />
                <Button variant="outline" asChild disabled={disabled}>
                  <span className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </span>
                </Button>
              </label>
            </>
          )}

          {status === "success" && (
            <div className="text-green-600">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-4" />
              <p className="font-medium">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-destructive">
              <AlertCircle className="h-10 w-10 mx-auto mb-4" />
              <p className="font-medium mb-4">{message}</p>
              <label>
                <input
                  type="file"
                  accept=".csv,.pdf,.xlsx,.xls"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Tentar Novamente</span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Painel conversão PTAX */}
        {pendingOps && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                    Exchanges internacionais detectadas
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {pendingOps.filter(isInternacional).length} de {pendingOps.length} operações estão em USDT/USD.
                    Converter automaticamente usando a cotação PTAX do Banco Central?
                  </p>
                </div>
              </div>
              <button onClick={cancelarImportacao} className="text-amber-700 hover:text-amber-900">
                <X className="h-4 w-4" />
              </button>
            </div>

            {ptaxCarregado && Object.keys(cotacoes).length > 0 && (
              <div className="rounded-md bg-white dark:bg-amber-950/50 p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Cotações PTAX carregadas (USD/BRL):
                </p>
                {Object.entries(cotacoes).map(([data, val]) => (
                  <div key={data} className="flex justify-between text-xs text-amber-700 dark:text-amber-400">
                    <span>{new Date(data + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                    <span>R$ {val?.toFixed(4) ?? "—"}</span>
                  </div>
                ))}
                {Object.values(cotacoes).some((v) => !v) && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠ Algumas cotações não foram encontradas — essas operações serão importadas sem conversão.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!ptaxCarregado ? (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => buscarPTAX(pendingOps)}
                    disabled={convertendo}
                  >
                    {convertendo ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Buscando PTAX...</>
                    ) : (
                      <><DollarSign className="h-4 w-4 mr-2" /> Buscar PTAX e Converter</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={confirmarImportacao}
                    className="border-amber-400"
                  >
                    Importar sem converter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={confirmarImportacao}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar e importar ({pendingOps.length} operações)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => buscarPTAX(pendingOps)}
                    className="border-amber-400"
                    disabled={convertendo}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instruções colapsáveis */}
        <button
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)}
        >
          <span>Como exportar o arquivo da sua exchange?</span>
          {mostrarInstrucoes ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {mostrarInstrucoes && (
          <div className="space-y-4 pt-2">
            {/* Exchanges brasileiras */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Exchanges BR — valores em BRL ✅
              </p>
              <ul className="space-y-2">
                {brExchanges.map((ex) => (
                  <li key={ex.nome} className="text-xs p-3 rounded-lg bg-muted/50">
                    <strong className="text-foreground">{ex.nome}:</strong>{" "}
                    {ex.instrucoes}
                    {ex.aviso && (
                      <p className="mt-1 text-amber-600 dark:text-amber-400">
                        ⚠ {ex.aviso}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Exchanges internacionais */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Exchanges Internacionais — valores em USDT/USD ⚠
              </p>
              <div className="text-xs p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 mb-2">
                ✨ Ao importar, o sistema detecta automaticamente a exchange e oferece conversão USDT/USD→BRL usando a cotação PTAX oficial do Banco Central na data de cada operação.
              </div>
              <ul className="space-y-2">
                {intExchanges.map((ex) => (
                  <li key={ex.nome} className="text-xs p-3 rounded-lg bg-muted/50">
                    <strong className="text-foreground">{ex.nome}:</strong>{" "}
                    {ex.instrucoes}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
