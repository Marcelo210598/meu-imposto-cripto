import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Meu Imposto Cripto - Calculadora de IR para Criptomoedas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #16a34a20 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16a34a20 0%, transparent 50%)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              backgroundColor: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
            }}
          >
            Meu Imposto Cripto
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginBottom: 50,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Calculadora de Imposto de Renda para Criptomoedas
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 40px",
              backgroundColor: "#16a34a20",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              R$ 35 mil
            </span>
            <span style={{ fontSize: 16, color: "#a1a1aa" }}>
              Limite de isenção
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 40px",
              backgroundColor: "#16a34a20",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              15-22.5%
            </span>
            <span style={{ fontSize: 16, color: "#a1a1aa" }}>Alíquotas</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px 40px",
              backgroundColor: "#16a34a20",
              borderRadius: 12,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              Grátis
            </span>
            <span style={{ fontSize: 16, color: "#a1a1aa" }}>Para usar</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "#16a34a",
          }}
        >
          100% de acordo com a Receita Federal
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
