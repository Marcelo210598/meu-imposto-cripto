import { Operacao, ResumoMensal, ResumoGeral } from "./types";
import { formatCurrency, formatCrypto, formatDate } from "./utils";

interface DadosRelatorio {
  operacoes: Operacao[];
  resumoGeral: ResumoGeral;
  resumosMensais: ResumoMensal[];
}

export function gerarHTMLRelatorio(dados: DadosRelatorio): string {
  const { operacoes, resumoGeral, resumosMensais } = dados;

  const operacoesHTML = operacoes
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .map(
      (op) => `
      <tr>
        <td>${formatDate(new Date(op.data))}</td>
        <td>${op.tipo === "compra" ? "Compra" : "Venda"}</td>
        <td>${op.cripto}</td>
        <td>${formatCrypto(op.quantidade)}</td>
        <td>${formatCurrency(op.precoUnitario)}</td>
        <td>${formatCurrency(op.valorTotal)}</td>
        <td>${op.exchange || "-"}</td>
      </tr>
    `
    )
    .join("");

  const resumoMensalHTML = resumosMensais
    .sort((a, b) => b.mes.localeCompare(a.mes))
    .map(
      (r) => `
      <tr>
        <td>${r.mes}</td>
        <td>${formatCurrency(r.totalVendas)}</td>
        <td>${formatCurrency(r.totalCompras)}</td>
        <td style="color: ${r.lucroTotal >= 0 ? "green" : "red"}">${formatCurrency(r.lucroTotal)}</td>
        <td>${r.isento ? "Sim" : "Não"}</td>
        <td><strong>${formatCurrency(r.impostoDevido)}</strong></td>
      </tr>
    `
    )
    .join("");

  const portfolioHTML = resumoGeral.portfolio
    .map(
      (p) => `
      <tr>
        <td>${p.cripto}</td>
        <td>${formatCrypto(p.quantidade)}</td>
        <td>${formatCurrency(p.precoMedio)}</td>
        <td>${formatCurrency(p.custoTotal)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de IR - Criptomoedas</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 8px;
          color: #16a34a;
        }
        h2 {
          font-size: 18px;
          margin-top: 32px;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #16a34a;
        }
        .header {
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        .date {
          color: #666;
          font-size: 14px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card .label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .summary-card .value {
          font-size: 20px;
          font-weight: bold;
        }
        .summary-card .value.positive { color: #16a34a; }
        .summary-card .value.negative { color: #dc2626; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-bottom: 24px;
        }
        th {
          background: #f3f4f6;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:hover {
          background: #f9fafb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
        }
        .disclaimer {
          background: #fef3c7;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-top: 24px;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Imposto de Renda</h1>
        <p class="date">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        <p class="date">Meu Imposto Cripto - Calculadora de IR para Criptomoedas</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Total de Operações</div>
          <div class="value">${resumoGeral.totalOperacoes}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total de Vendas</div>
          <div class="value">${formatCurrency(resumoGeral.totalVendas)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Lucro Acumulado</div>
          <div class="value ${resumoGeral.lucroAcumulado >= 0 ? "positive" : "negative"}">
            ${formatCurrency(resumoGeral.lucroAcumulado)}
          </div>
        </div>
        <div class="summary-card">
          <div class="label">Imposto Total Devido</div>
          <div class="value">${formatCurrency(resumoGeral.impostoTotalDevido)}</div>
        </div>
      </div>

      <h2>Resumo por Mês</h2>
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Vendas</th>
            <th>Compras</th>
            <th>Lucro/Prejuízo</th>
            <th>Isento?</th>
            <th>Imposto</th>
          </tr>
        </thead>
        <tbody>
          ${resumoMensalHTML || "<tr><td colspan='6'>Nenhum resumo mensal disponível</td></tr>"}
        </tbody>
      </table>

      <h2>Portfolio Atual</h2>
      <table>
        <thead>
          <tr>
            <th>Criptomoeda</th>
            <th>Quantidade</th>
            <th>Preço Médio</th>
            <th>Custo Total</th>
          </tr>
        </thead>
        <tbody>
          ${portfolioHTML || "<tr><td colspan='4'>Portfolio vazio</td></tr>"}
        </tbody>
      </table>

      <h2>Todas as Operações</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Cripto</th>
            <th>Quantidade</th>
            <th>Preço Unit.</th>
            <th>Valor Total</th>
            <th>Exchange</th>
          </tr>
        </thead>
        <tbody>
          ${operacoesHTML || "<tr><td colspan='7'>Nenhuma operação registrada</td></tr>"}
        </tbody>
      </table>

      <div class="disclaimer">
        <strong>Aviso Legal:</strong> Este relatório é apenas para fins informativos e não constitui
        aconselhamento fiscal ou jurídico. Consulte um contador ou especialista tributário para
        orientação profissional sobre sua situação específica.
      </div>

      <div class="footer">
        <p>Meu Imposto Cripto &copy; ${new Date().getFullYear()} - Todos os direitos reservados</p>
      </div>
    </body>
    </html>
  `;
}

export function exportarPDF(dados: DadosRelatorio): void {
  const html = gerarHTMLRelatorio(dados);

  // Criar uma nova janela para impressão/PDF
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export function exportarHTML(dados: DadosRelatorio): void {
  const html = gerarHTMLRelatorio(dados);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-ir-cripto-${new Date().toISOString().split("T")[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
