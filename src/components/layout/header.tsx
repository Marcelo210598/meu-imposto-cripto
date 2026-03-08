"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bitcoin, Menu, X, LogOut, User, ChevronDown, FileText, BarChart2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  const navLinks = [
    { href: "/calculadora", label: "Calculadora" },
    { href: "/legislacao",  label: "Legislação"  },
    { href: "/exemplos",    label: "Exemplos"    },
    { href: "/faq",         label: "FAQ"          },
    { href: "/precos",      label: "Preços"       },
    ...(session
      ? [
          { href: "/historico",  label: "Histórico"      },
          { href: "/exchanges",  label: "Exchanges"       },
          { href: "/relatorio",  label: "Relatório IRPF"  },
        ]
      : []),
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-background/80 backdrop-blur"
      } supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-all duration-200 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/30">
            <Bitcoin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Meu Imposto Cripto</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-9 w-24 animate-shimmer rounded-md" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">
                  {session.user?.name?.split(" ")[0] || "Conta"}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-background shadow-lg z-20 py-1 animate-fade-in">
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1 truncate">
                      {session.user?.email}
                    </div>
                    {[
                      { href: "/calculadora", label: "Minha calculadora",    icon: null      },
                      { href: "/historico",   label: "Histórico & Gráficos", icon: BarChart2 },
                      { href: "/exchanges",   label: "Exchanges conectadas", icon: Link2     },
                      { href: "/relatorio",   label: "Relatório IRPF",       icon: FileText  },
                      { href: "/perfil",      label: "Minha conta",          icon: User      },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors rounded-md mx-1"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t mt-1 pt-1 mx-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors w-full text-left text-destructive rounded-md"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild className="shadow-sm">
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <nav className="container mx-auto flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t space-y-2 mt-2">
              {session ? (
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>Criar conta grátis</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
