import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv();

export type Provider = "gemini" | "openai" | "mock";

export interface AppConfig {
  port: number;
  host: string;
  provider: Provider;
  gemini: {
    apiKey?: string;
    model: string;
  };
  openai: {
    apiKey?: string;
    baseUrl: string;
    model: string;
  };
  corsOrigins: string[];
  requestTimeoutMs: number;
  cardsJsonPath: string;
  dataDir: string;
}

function parseOrigins(raw?: string): string[] {
  if (!raw) return ["*"];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadConfig(): AppConfig {
  const port = Number(process.env.PORT || 4117);
  const host = process.env.HOST || "0.0.0.0";
  const provider = (process.env.PROVIDER || "mock").toLowerCase() as Provider;

  const cardsJsonPath =
    process.env.CARDS_JSON ||
    path.resolve(process.cwd(), "data", "cards", "cards.json");
  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), "data");

  return {
    port,
    host,
    provider,
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    },
    corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
    cardsJsonPath,
    dataDir,
  };
}
