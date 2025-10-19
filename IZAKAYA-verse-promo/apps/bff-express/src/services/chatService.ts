import type { AppConfig, Provider } from "../config";

export interface ChatParams {
  prompt: string;
  system: string;
  temperature: number;
}

export class ChatService {
  constructor(private readonly cfg: AppConfig) {}

  async complete(params: ChatParams): Promise<string> {
    const provider = this.cfg.provider;
    switch (provider) {
      case "gemini":
        return this.callGemini(params);
      case "openai":
        return this.callOpenAI(params);
      case "mock":
      default:
        return this.callMock(params);
    }
  }

  private async callGemini({ prompt, system, temperature }: ChatParams): Promise<string> {
    if (!this.cfg.gemini.apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.cfg.gemini.model
    )}:generateContent?key=${encodeURIComponent(this.cfg.gemini.apiKey)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.cfg.requestTimeoutMs);
    try {
      const body = {
        systemInstruction: {
          role: "system",
          parts: [{ text: system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
        },
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini request failed (${res.status}): ${errorText}`);
      }
      const data = (await res.json()) as any;
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "")?.join("") ||
        data?.candidates?.[0]?.output ||
        "";
      return text.trim() || "（応答なし）";
    } finally {
      clearTimeout(timer);
    }
  }

  private async callOpenAI({ prompt, system, temperature }: ChatParams): Promise<string> {
    if (!this.cfg.openai.apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.cfg.requestTimeoutMs);
    try {
      const res = await fetch(`${this.cfg.openai.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${this.cfg.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: this.cfg.openai.model,
          temperature,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI request failed (${res.status}): ${errorText}`);
      }
      const data = (await res.json()) as any;
      const text = data?.choices?.[0]?.message?.content;
      return (text && text.trim()) || "（応答なし）";
    } finally {
      clearTimeout(timer);
    }
  }

  private async callMock({ prompt, system }: ChatParams): Promise<string> {
    const preview = prompt.length > 32 ? `${prompt.slice(0, 29)}…` : prompt;
    return [
      "【mock response】",
      `system=${system.slice(0, 40)}…`,
      `prompt="${preview}"`,
      "この応答はスタブです。",
    ].join("\n");
  }
}
