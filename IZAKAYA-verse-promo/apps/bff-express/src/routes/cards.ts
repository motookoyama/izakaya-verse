import type { Express, Request, Response } from "express";
import type { CardRecord } from "../services/cardRegistry";

export function registerCards(app: Express, cards: CardRecord[]): void {
  app.get("/cards", (_req: Request, res: Response) => {
    res.json({ cards });
  });
}
