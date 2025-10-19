import type { Express } from "express";
import os from "node:os";
import type { AppConfig } from "../config";

export function registerHealth(app: Express, cfg: AppConfig, cardsCount: number): void {
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "izakaya-mini-bff",
      provider: cfg.provider,
      cards: cardsCount,
      hostname: os.hostname(),
    });
  });
}
