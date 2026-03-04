export interface DadosDARF {
  competencia: string;   // "01/2024"
  vencimento: string;    // "29/02/2024"
  codigoReceita: "4600";
  valorPrincipal: number;
  mes: string;           // "2024-01"
}

/**
 * Calcula o vencimento do DARF:
 * Último dia útil do mês seguinte ao fato gerador.
 * Simplificação: recua finais de semana para sexta-feira.
 * Feriados nacionais não são considerados (orientar o usuário a confirmar).
 */
export function calcularVencimentoDARF(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);

  const mesSeguinte = mesNum === 12 ? 1 : mesNum + 1;
  const anoSeguinte = mesNum === 12 ? ano + 1 : ano;

  // Último dia do mês seguinte
  const data = new Date(anoSeguinte, mesSeguinte, 0);

  const diaSemana = data.getDay();
  if (diaSemana === 0) data.setDate(data.getDate() - 2); // Dom → Sex
  if (diaSemana === 6) data.setDate(data.getDate() - 1); // Sáb → Sex

  return data.toLocaleDateString("pt-BR");
}

export function gerarDadosDARF(mes: string, valorImposto: number): DadosDARF {
  const [ano, mesNum] = mes.split("-");
  const competencia = `${mesNum}/${ano}`;
  const vencimento = calcularVencimentoDARF(mes);

  return {
    competencia,
    vencimento,
    codigoReceita: "4600",
    valorPrincipal: valorImposto,
    mes,
  };
}
