"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseCSV } from "@/lib/csv-parser";
import { Operacao } from "@/lib/types";

interface UploadCSVProps {
  onImport: (operacoes: Operacao[]) => void;
  disabled?: boolean;
}

export function UploadCSV({ onImport, disabled = false }: UploadCSVProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

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

        // Reset status após 3 segundos
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
    [onImport]
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Operações
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                Suportamos: Binance, Mercado Bitcoin
              </p>
              <label>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <Button variant="outline" asChild>
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

        <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm font-medium">Como exportar seu CSV:</p>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>
              <strong className="text-foreground">Binance:</strong>{" "}
              Carteira → Histórico de Negociações → Exportar → CSV
              <br />
              <span className="text-amber-600 dark:text-amber-400">
                ⚠ Use &quot;Trade History&quot; (não Transaction History) — precisa do valor em BRL/USDT
              </span>
            </li>
            <li>
              <strong className="text-foreground">Mercado Bitcoin:</strong>{" "}
              Histórico → Exportar relatório
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
