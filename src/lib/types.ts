export interface Operacao {
  id: string;
  tipo: "compra" | "venda";
  cripto: string;
  quantidade: number;
  valorTotal: number;
  precoUnitario: number;
  data: string;
  exchange?: string;
}

export interface PortfolioCripto {
  cripto: string;
  quantidade: number;
  precoMedio: number;
  custoTotal: number;
}

export interface ResumoMensal {
  mes: string; // formato: "2024-01"
  totalVendas: number;
  totalCompras: number;
  lucroTotal: number;
  impostoDevido: number;
  isento: boolean;
  operacoes: Operacao[];
}

export interface ResumoGeral {
  totalOperacoes: number;
  totalVendas: number;
  totalCompras: number;
  lucroAcumulado: number;
  impostoTotalDevido: number;
  portfolio: PortfolioCripto[];
}

export interface DadosGrafico {
  mes: string;
  vendas: number;
  compras: number;
  lucro: number;
  imposto: number;
}

// Alíquotas de IR sobre ganho de capital (Brasil)
export const ALIQUOTAS_IR = [
  { limite: 5000000, aliquota: 0.15 },    // Até 5 milhões: 15%
  { limite: 10000000, aliquota: 0.175 },  // 5 a 10 milhões: 17.5%
  { limite: 30000000, aliquota: 0.20 },   // 10 a 30 milhões: 20%
  { limite: Infinity, aliquota: 0.225 },  // Acima de 30 milhões: 22.5%
];

export const LIMITE_ISENCAO_MENSAL = 35000; // R$ 35.000
