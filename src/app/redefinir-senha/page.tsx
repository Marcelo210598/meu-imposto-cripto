"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bitcoin, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function RedefinirForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">
          Link inválido. Solicite um novo link de redefinição de senha.
        </p>
        <Link href="/esqueci-senha">
          <Button className="w-full">Solicitar novo link</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Erro ao redefinir senha. Tente novamente.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
        <p className="font-medium">Senha redefinida com sucesso!</p>
        <p className="text-sm text-muted-foreground">
          Redirecionando para o login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPass ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Mínimo 8 caracteres, incluindo pelo menos 1 número ou símbolo
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar nova senha</Label>
        <Input
          id="confirm"
          type={showPass ? "text" : "password"}
          placeholder="Repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Redefinindo...
          </>
        ) : (
          "Redefinir senha"
        )}
      </Button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Bitcoin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Meu Imposto Cripto</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>
              Crie uma nova senha para sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            }>
              <RedefinirForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
