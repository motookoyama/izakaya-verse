import { promises as fs } from "node:fs";
import path from "node:path";

export interface CardRecord {
  id: string;
  name: string;
  system: string;
  image?: string;
}

const FALLBACK_CARDS: CardRecord[] = [];

export async function loadCardRegistry(filePath: string): Promise<CardRecord[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed?.cards)) {
      return parsed.cards.filter(Boolean);
    }
  } catch {
    // ignore and fallback
  }
  return FALLBACK_CARDS;
}

export async function ensureCardsFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath);
  } catch {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify({ cards: FALLBACK_CARDS }, null, 2),
      "utf-8"
    );
  }
}
