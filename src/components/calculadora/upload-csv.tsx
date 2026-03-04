"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
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
    instrucoes: "Carteira → Histórico de Negociações → Exportar → CSV",
    aviso: 'Use "Trade History" (não Transaction History) — precisa do valor em BRL/USDT',
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

export function UploadCSV({ onImport, disabled = false }: UploadCSVProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      if (!file.name.endsWith(".csv")) {
        setStatus("error");
        setMessage("Por favor, selecione um arquivo CSV");
        return;
      }

      try {
        const content = await file.text();
        const operacoes = parseCSV(content);

        if (operacoes.length === 0) {
          setStatus("error");
          setMessage(
            "Nenhuma operação encontrada. Verifique o formato do arquivo."
          );
          return;
        }

        setStatus("success");
        setMessage(`${operacoes.length} operações importadas com sucesso!`);
        onImport(operacoes);

        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage("Erro ao processar o arquivo. Verifique o formato.");
        console.error(error);
      }
    },
    [onImport, disabled]
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
          Importar Operações via CSV
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
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo CSV ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                9 exchanges suportadas — detecção automática de formato
              </p>
              <label>
                <input
                  type="file"
                  accept=".csv"
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
                  accept=".csv"
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

        {/* Instruções colapsáveis */}
        <button
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)}
        >
          <span>Como exportar o CSV da sua exchange?</span>
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
                ⚠ Exchanges internacionais registram valores em USDT ou USD. Após importar, os valores aparecerão em USDT/USD e você precisará ajustar para BRL usando a cotação PTAX do Banco Central na data da operação.
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
