import { promises as fs } from "node:fs";
import path from "node:path";
import { generateTxId } from "./tx";

export type LedgerType = "credit" | "debit";

export type LedgerEntry = {
  txId: string;
  userId: string;
  type: LedgerType;
  amount: number;
  source: string;
  sku?: string;
  idempotencyKey?: string;
  note?: string;
  createdAt: string;
};

export type WalletRecord = {
  balance: number;
  updatedAt: string;
};

type StoreData = {
  wallets: Record<string, WalletRecord>;
  ledger: LedgerEntry[];
};

const DEFAULT_STORE: StoreData = {
  wallets: {},
  ledger: [],
};

type CreditOptions = {
  note?: string;
  sku?: string;
};

type DebitOptions = {
  sku?: string;
  idempotencyKey?: string;
  source?: string;
  note?: string;
};

export class WalletStore {
  private readonly filePath: string;

  constructor(private readonly dataDir: string) {
    this.filePath = path.join(dataDir, "wallet.store.json");
  }

  private async read(): Promise<StoreData> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.wallets && parsed.ledger) {
        return parsed as StoreData;
      }
    } catch {
      // ignore
    }
    await this.write(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }

  private async write(data: StoreData): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private getWalletRecord(store: StoreData, userId: string): WalletRecord {
    const existing = store.wallets[userId];
    if (existing) return existing;
    const record: WalletRecord = { balance: 0, updatedAt: new Date().toISOString() };
    store.wallets[userId] = record;
    return record;
  }

  private appendLedger(store: StoreData, entry: LedgerEntry): void {
    store.ledger.unshift(entry);
    if (store.ledger.length > 2000) {
      store.ledger = store.ledger.slice(0, 2000);
    }
  }

  async getWallet(userId: string): Promise<{ record: WalletRecord; entries: LedgerEntry[] }> {
    const store = await this.read();
    const record = this.getWalletRecord(store, userId);
    const entries = store.ledger.filter((item) => item.userId === userId);
    return { record, entries };
  }

  async credit(
    userId: string,
    txId: string,
    amount: number,
    source: string,
    options: CreditOptions = {}
  ): Promise<{ record: WalletRecord; entry: LedgerEntry }> {
    if (amount <= 0) throw new Error("amount must be > 0");
    const store = await this.read();
    const existing = store.ledger.find((item) => item.txId === txId && item.userId === userId);
    if (existing) {
      const record = this.getWalletRecord(store, userId);
      return { record, entry: existing };
    }
    const record = this.getWalletRecord(store, userId);
    record.balance += amount;
    record.updatedAt = new Date().toISOString();
    const entry: LedgerEntry = {
      txId,
      userId,
      type: "credit",
      amount,
      source,
      sku: options.sku,
      note: options.note,
      createdAt: new Date().toISOString(),
    };
    this.appendLedger(store, entry);
    await this.write(store);
    return { record, entry };
  }

  async debit(
    userId: string,
    amount: number,
    options: DebitOptions = {}
  ): Promise<{ record: WalletRecord; entry: LedgerEntry }> {
    if (amount <= 0) throw new Error("amount must be > 0");
    const store = await this.read();
    const record = this.getWalletRecord(store, userId);
    if (record.balance < amount) {
      throw new Error("Insufficient Funds");
    }
    if (options.idempotencyKey) {
      const existing = store.ledger.find(
        (item) =>
          item.userId === userId &&
          item.type === "debit" &&
          item.idempotencyKey === options.idempotencyKey
      );
      if (existing) {
        return { record, entry: existing };
      }
    }
    record.balance -= amount;
    record.updatedAt = new Date().toISOString();
    const entry: LedgerEntry = {
      txId: generateTxId(),
      userId,
      type: "debit",
      amount,
      source: options.source || "API_CONSUME",
      sku: options.sku,
      idempotencyKey: options.idempotencyKey,
      note: options.note,
      createdAt: new Date().toISOString(),
    };
    this.appendLedger(store, entry);
    await this.write(store);
    return { record, entry };
  }
}
