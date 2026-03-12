"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGESTOES = [
  "Preciso pagar IR sobre cripto?",
  "O que é o limite de R$ 35 mil?",
  "Swap entre criptos é tributável?",
  "Qual o prazo para pagar o DARF?",
];

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o **Bit.AI**, seu assistente de IR em cripto 🤖\n\nTire suas dúvidas sobre tributação de criptomoedas no Brasil.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? data.error ?? "Erro ao responder." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Abrir Bit.AI"
      >
        <div className="relative h-7 w-7 flex-shrink-0">
          <Image src="/taxad-icon.svg" alt="Bit.AI" fill className="object-contain drop-shadow-sm" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm font-bold tracking-wide">Bit.AI</span>
          <span className="text-[10px] opacity-75">Dúvidas sobre IR?</span>
        </div>
        <Sparkles className="h-3.5 w-3.5 opacity-70 flex-shrink-0" />
      </button>

      {/* Janela do chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-background shadow-2xl shadow-black/20 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 flex-shrink-0 rounded-xl overflow-hidden bg-primary-foreground/10 flex items-center justify-center">
                <Image src="/taxad-icon.svg" alt="Bit.AI" fill className="object-contain p-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm">Bit.AI</p>
                  <span className="flex items-center gap-0.5 text-[10px] bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                    online
                  </span>
                </div>
                <p className="text-xs opacity-75">Assistente de IR em Criptomoedas</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80 min-h-44 bg-muted/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
                {msg.role === "assistant" && (
                  <div className="relative h-6 w-6 flex-shrink-0 mt-1 rounded-full overflow-hidden bg-primary/10">
                    <Image src="/taxad-icon.svg" alt="Bit.AI" fill className="object-contain p-0.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                      : "bg-background text-foreground rounded-bl-sm border shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start gap-2">
                <div className="relative h-6 w-6 flex-shrink-0 mt-1 rounded-full overflow-hidden bg-primary/10">
                  <Image src="/taxad-icon.svg" alt="Bit.AI" fill className="object-contain p-0.5" />
                </div>
                <div className="bg-background border rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Sugestões (só no início) */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-1.5 bg-muted/20 border-t border-border/50">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t bg-background">
            <input
              className="flex-1 text-sm bg-muted rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground"
              placeholder="Escreva sua dúvida sobre IR..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              maxLength={500}
              disabled={loading}
            />
            <Button
              size="icon"
              className="rounded-xl h-10 w-10 flex-shrink-0 shadow-sm"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground pb-2 bg-background">
            Bit.AI pode cometer erros. Consulte um contador para casos complexos.
          </p>
        </div>
      )}
    </>
  );
}
