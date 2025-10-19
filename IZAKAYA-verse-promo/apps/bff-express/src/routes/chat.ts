import type { Express, Request, Response } from "express";
import type { CardRecord } from "../services/cardRegistry";
import type { AppConfig } from "../config";
import { ChatService } from "../services/chatService";
import { buildSystemPrompt } from "../services/systemPrompt";

interface ChatRequestBody {
  prompt?: string;
  cardId?: string;
  temperature?: number;
}

export function registerChat(
  app: Express,
  cfg: AppConfig,
  cards: CardRecord[],
  chatService: ChatService
): void {
  app.post("/chat/v1", async (req: Request, res: Response) => {
    const body = req.body as ChatRequestBody;
    const prompt = (body?.prompt || "").trim();
    const cardId = body?.cardId;
    const temperature = typeof body?.temperature === "number" ? body.temperature : 0.7;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }
    if (prompt.length > 4000) {
      return res.status(400).json({ error: "prompt is too long (max 4000 chars)" });
    }
    if (temperature < 0 || temperature > 1) {
      return res.status(400).json({ error: "temperature must be between 0 and 1" });
    }

    const system = buildSystemPrompt(cards, cardId);
    const started = Date.now();
    try {
      const reply = await chatService.complete({ prompt, system, temperature });
      const elapsed = (Date.now() - started) / 1000;
      return res.json({
        reply,
        meta: {
          provider: cfg.provider,
          model:
            cfg.provider === "gemini"
              ? cfg.gemini.model
              : cfg.provider === "openai"
              ? cfg.openai.model
              : "mock",
          elapsed: `${elapsed.toFixed(3)}s`,
          card: cards.find((c) => c.id === cardId)?.name ?? "default",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      return res.status(502).json({ error: message });
    }
  });
}
