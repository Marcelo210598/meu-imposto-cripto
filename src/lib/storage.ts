"use client";

import { Operacao } from "./types";

const STORAGE_KEY = "meu-imposto-cripto-operacoes";

export function salvarOperacoes(operacoes: Operacao[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(operacoes));
}

export function carregarOperacoes(): Operacao[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Operacao[];
  } catch {
    return [];
  }
}

export function limparOperacoes(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
