export type AppConfig = {
  port: number;
  provider: 'ollama' | 'openai' | 'gemini' | 'lmstudio' | 'openrouter';
  ollamaBaseUrl: string;
  ollamaModel: string;
  openaiBaseUrl: string;
  openaiApiKey?: string;
  geminiApiKey?: string;
  lmstudioBaseUrl: string;
  openrouterBaseUrl: string;
  openrouterApiKey?: string;
  openrouterSiteUrl?: string;
  openrouterAppName?: string;
  corsOrigin: string | '*';
  requestTimeoutMs: number;
  logLevel: 'info' | 'error' | 'warn' | 'debug' | 'trace' | 'fatal';
};

export function loadConfig(): AppConfig {
  const env = process.env as Record<string, string | undefined>;
  const port = Number(env.PORT || 8787);
  const provider = (env.PROVIDER || 'ollama').toLowerCase() as AppConfig['provider'];
  const ollamaBaseUrl = env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
  const ollamaModel = env.OLLAMA_MODEL || 'qwen3:4b';
  const openaiBaseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const openaiApiKey = env.OPENAI_API_KEY;
  const geminiApiKey = env.GEMINI_API_KEY;
  const lmstudioBaseUrl = env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
  const openrouterBaseUrl = env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const openrouterApiKey = env.OPENROUTER_API_KEY;
  const openrouterSiteUrl = env.OPENROUTER_SITE_URL;
  const openrouterAppName = env.OPENROUTER_APP_NAME;
  const corsOrigin = env.CORS_ORIGIN || 'http://localhost:5173';
  const requestTimeoutMs = Number(env.REQUEST_TIMEOUT_MS || 15000);
  const logLevel = (env.LOG_LEVEL || 'info') as AppConfig['logLevel'];

  return {
    port,
    provider,
    ollamaBaseUrl,
    ollamaModel,
    openaiBaseUrl,
    openaiApiKey,
    geminiApiKey,
    lmstudioBaseUrl,
    openrouterBaseUrl,
    openrouterApiKey,
    openrouterSiteUrl,
    openrouterAppName,
    corsOrigin,
    requestTimeoutMs,
    logLevel,
  };
}

