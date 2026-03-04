"use client";

import { useState } from "react";
import { FileText, Copy, Check, ExternalLink, AlertTriangle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ResumoMensal } from "@/lib/types";
import { gerarDadosDARF } from "@/lib/darf";
import { formatCurrency } from "@/lib/utils";

interface DarfModalProps {
  resumosMensais: ResumoMensal[];
}

function CopiarCampo({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(valor);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <button
      onClick={copiar}
      className="ml-2 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title="Copiar"
    >
      {copiado ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center">
        <span className="font-mono font-semibold">{valor}</span>
        <CopiarCampo valor={valor} />
      </div>
    </div>
  );
}

export function DarfModal({ resumosMensais }: DarfModalProps) {
  const [aberto, setAberto] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  const mesesComImposto = resumosMensais
    .filter((r) => r.impostoDevido > 0)
    .sort((a, b) => b.mes.localeCompare(a.mes));

  if (mesesComImposto.length === 0) return null;

  const resumoSelecionado =
    mesesComImposto.find((r) => r.mes === mesSelecionado) ?? mesesComImposto[0];

  const darf = gerarDadosDARF(resumoSelecionado.mes, resumoSelecionado.impostoDevido);

  const abrirModal = (mes?: string) => {
    setMesSelecionado(mes ?? mesesComImposto[0].mes);
    setAberto(true);
  };

  const formatarMes = (mes: string) => {
    const [ano, m] = mes.split("-");
    const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${nomes[parseInt(m) - 1]}/${ano}`;
  };

  return (
    <>
      <Button
        onClick={() => abrirModal()}
        variant="default"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        <FileText className="h-4 w-4 mr-2" />
        Gerar DARF ({mesesComImposto.length} {mesesComImposto.length === 1 ? "mês" : "meses"})
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Dados para DARF
            </DialogTitle>
            <DialogDescription>
              Use esses dados no{" "}
              <a
                href="https://www.calculador.com.br/calculo/sicalc-online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                SICALC Online
              </a>{" "}
              para emitir o DARF oficial.
            </DialogDescription>
          </DialogHeader>

          {/* Seletor de mês se houver mais de um */}
          {mesesComImposto.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {mesesComImposto.map((r) => (
                <button
                  key={r.mes}
                  onClick={() => setMesSelecionado(r.mes)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    mesSelecionado === r.mes || (!mesSelecionado && r.mes === mesesComImposto[0].mes)
                      ? "bg-amber-600 text-white border-amber-600"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {formatarMes(r.mes)}
                </button>
              ))}
            </div>
          )}

          <Separator />

          {/* Campos do DARF */}
          <div className="space-y-2">
            <Campo label="Código de Receita" valor={darf.codigoReceita} />
            <Campo label="Período de Apuração" valor={darf.competencia} />
            <Campo label="Vencimento" valor={darf.vencimento} />
            <Campo
              label="Valor do Principal"
              valor={darf.valorPrincipal.toFixed(2).replace(".", ",")}
            />
          </div>

          {/* Aviso */}
          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Atenção</p>
              <p>O vencimento é estimado — confirme feriados nacionais e locais antes de pagar.</p>
              <p>Se o DARF estiver atrasado, o SICALC calculará automaticamente juros e multa.</p>
            </div>
          </div>

          {/* Resumo do valor */}
          <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 text-center">
            <p className="text-sm text-muted-foreground mb-1">Imposto a Pagar — {formatarMes(resumoSelecionado.mes)}</p>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(resumoSelecionado.impostoDevido)}
            </p>
            <Badge variant="secondary" className="mt-2">
              Código 4600 — Ganho de Capital
            </Badge>
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.open("https://sicalc.receita.economia.gov.br/sicalc/novocalculodarf", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir SICALC
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
