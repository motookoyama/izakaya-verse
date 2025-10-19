import type { Express, Request, Response } from "express";
import { WalletStore } from "../services/walletStore";
import { generateTxId, isValidTxId } from "../services/tx";

type RedeemBody = {
  tx_id?: string;
  amount_pt?: number;
  source?: string;
  note?: string;
};

type ConsumeBody = {
  amount_pt?: number;
  sku?: string;
  idempotency_key?: string;
};

const UNIT = "pt";

function resolveUserId(req: Request): string | undefined {
  const header = req.header("X-IZK-UID");
  const query = req.query.user_id as string | undefined;
  const userId = (header || query || "").trim();
  return userId || undefined;
}

export function registerWallet(app: Express, wallet: WalletStore): void {
  app.get("/wallet/balance", async (req: Request, res: Response) => {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "missing X-IZK-UID header" });
    }
    const { record, entries } = await wallet.getWallet(userId);
    return res.json({
      user_id: userId,
      balance: record.balance,
      unit: UNIT,
      updated_at: record.updatedAt,
      transactions: entries.slice(0, 20),
    });
  });

  app.post("/wallet/redeem", async (req: Request, res: Response) => {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "missing X-IZK-UID header" });
    }
    const body = req.body as RedeemBody;
    const amount = Number(body?.amount_pt ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount_pt must be > 0" });
    }
    const txId = body?.tx_id?.trim() || generateTxId();
    if (!isValidTxId(txId)) {
      return res.status(400).json({ error: "invalid tx_id" });
    }
    try {
      const { record, entry } = await wallet.credit(userId, txId, amount, body?.source || "MANUAL_REDEEM", {
        note: body?.note,
      });
      return res.json({
        ok: true,
        user_id: userId,
        tx_id: entry.txId,
        balance_after: record.balance,
        unit: UNIT,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      return res.status(500).json({ error: message });
    }
  });

  app.post("/wallet/consume", async (req: Request, res: Response) => {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "missing X-IZK-UID header" });
    }
    const body = req.body as ConsumeBody;
    const amount = Number(body?.amount_pt ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount_pt must be > 0" });
    }
    if (!body?.sku) {
      return res.status(400).json({ error: "sku is required" });
    }
    try {
      const { record, entry } = await wallet.debit(userId, amount, {
        sku: body?.sku,
        idempotencyKey: body?.idempotency_key,
        source: "API_CONSUME",
      });
      return res.json({
        ok: true,
        user_id: userId,
        tx_id: entry.txId,
        balance_after: record.balance,
        unit: UNIT,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      if (message.toLowerCase().includes("insufficient")) {
        return res.status(402).json({ error: "Insufficient Funds" });
      }
      return res.status(500).json({ error: message });
    }
  });
}
