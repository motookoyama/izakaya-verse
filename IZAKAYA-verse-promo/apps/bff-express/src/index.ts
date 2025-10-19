import express from "express";
import cors from "cors";
import path from "node:path";
import { loadConfig } from "./config";
import { ensureCardsFile, loadCardRegistry } from "./services/cardRegistry";
import { registerHealth } from "./routes/health";
import { registerCards } from "./routes/cards";
import { registerChat } from "./routes/chat";
import { registerWallet } from "./routes/wallet";
import { createPaypalRouter } from "./routes/paypal";
import { ChatService } from "./services/chatService";
import { WalletStore } from "./services/walletStore";

async function bootstrap(): Promise<void> {
  const cfg = loadConfig();

  await ensureCardsFile(cfg.cardsJsonPath);
  const cards = await loadCardRegistry(cfg.cardsJsonPath);
  const walletStore = new WalletStore(cfg.dataDir);
  const chatService = new ChatService(cfg);

  const app = express();

  const allowAll = cfg.corsOrigins.includes("*");
  app.use(
    cors({
      origin: allowAll ? true : cfg.corsOrigins,
      credentials: false,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const publicDir = path.resolve(process.cwd(), "public");
  app.use("/preview", express.static(publicDir));

  app.get("/", (_req, res) => {
    res.json({
      service: "izakaya-mini-bff",
      version: "0.1.0",
      provider: cfg.provider,
      cards: cards.length,
    });
  });

  registerHealth(app, cfg, cards.length);
  registerCards(app, cards);
  registerChat(app, cfg, cards, chatService);
  registerWallet(app, walletStore);
  app.use("/paypal/ipn", createPaypalRouter({ wallet: walletStore }));

  app.get("/preview", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.get("/preview/*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "internal error";
    res.status(500).json({ error: message });
  });

  app.listen(cfg.port, cfg.host, () => {
    console.log(`[mini-bff] listening on http://${cfg.host}:${cfg.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("[mini-bff] failed to start", err);
  process.exit(1);
});
