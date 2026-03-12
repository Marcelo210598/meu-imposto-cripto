// Proxy Binance para meu-imposto-cripto
// Deploy no Railway (EU West) para evitar bloqueio de IP da Binance.
// Vercel usa IPs bloqueados. Railway EU usa IPs diferentes que funcionam.

const http = require("http");

// Adicione a URL do seu app Vercel aqui
const ALLOWED_ORIGINS = [
  "https://meu-imposto-cripto.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

const ALLOWED_PATHS = ["/api/v3/account", "/api/v3/myTrades"];

const BINANCE_BASES = [
  "https://api.binance.com",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
];

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";

  // CORS
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/binance") {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { path, queryString, apiKey } = JSON.parse(body);

      if (!ALLOWED_PATHS.includes(path)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Path not allowed" }));
        return;
      }

      if (!queryString || !apiKey) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing params" }));
        return;
      }

      // Tenta cada base URL até uma funcionar
      let lastStatus = 502;
      let lastData = { error: "All Binance endpoints failed" };

      for (const base of BINANCE_BASES) {
        try {
          const url = `${base}${path}?${queryString}`;
          const response = await fetch(url, {
            headers: { "X-MBX-APIKEY": apiKey },
            signal: AbortSignal.timeout(12000),
          });

          const data = await response.json();

          if (response.status !== 502 && response.status !== 503) {
            res.writeHead(response.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
            return;
          }

          lastStatus = response.status;
          lastData = data;
        } catch {
          continue;
        }
      }

      res.writeHead(lastStatus, { "Content-Type": "application/json" });
      res.end(JSON.stringify(lastData));
    } catch (err) {
      console.error("Proxy error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal proxy error" }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Binance proxy running on port ${PORT}`);
});
