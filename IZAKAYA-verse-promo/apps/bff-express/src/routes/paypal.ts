import type { Request, Response, Router } from "express";
import express from "express";
import type { WalletStore } from "../services/walletStore";
import { generateTxId, isValidTxId } from "../services/tx";

type PaypalRouterOptions = {
  wallet: WalletStore;
};

/**
 * PayPal IPN handler.
 * 本番環境では VERIFIED ハンドシェイクを行う必要がありますが、
 * プレビュー環境では受信内容をそのままウォレットへ credit します。
 */
export function createPaypalRouter({ wallet }: PaypalRouterOptions): Router {
  const router = express.Router();

  router.post("/notify", async (req: Request, res: Response) => {
    const body = req.body as Record<string, string | undefined>;
    const userId = (body.custom || body.payer_email || "").trim();
    if (!userId) {
      return res.status(400).json({ error: "missing custom (user id)" });
    }
    const amountRaw = body.mc_gross || body.payment_gross || "0";
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "invalid mc_gross" });
    }
    const txnId = body.txn_id && isValidTxId(body.txn_id) ? body.txn_id : generateTxId();
    try {
      const { record, entry } = await wallet.credit(userId, txnId, amount, "PAYPAL_IPN", {
        note: body.item_name || undefined,
        sku: body.item_number || undefined,
      });
      return res.json({
        ok: true,
        tx_id: entry.txId,
        user_id: userId,
        balance_after: record.balance,
        unit: "pt",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
