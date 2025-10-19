import type { CardRecord } from "./cardRegistry";

export function buildSystemPrompt(cards: CardRecord[], cardId?: string): string {
  const base =
    "あなたは Dr.Orb と同僚の舞台監督。ユーザーの一言から即興の一幕を紡ぐ。";
  if (!cardId) {
    return `${base} 人格は汎用。丁寧で簡潔に。`;
  }
  const card = cards.find((c) => c.id === cardId);
  if (!card) {
    return `${base} 人格は汎用。丁寧で簡潔に。`;
  }
  return `${base} 現在の配役: ${card.name}。${card.system}`;
}
