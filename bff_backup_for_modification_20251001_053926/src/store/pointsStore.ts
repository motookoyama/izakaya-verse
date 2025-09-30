import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'points.json');

export type LedgerEntry = {
  id: string;
  userId: string;
  type: 'charge' | 'spend';
  amount: number;
  balance: number;
  note?: string;
  createdAt: string;
};

export type UserAccount = {
  id: string;
  name: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  personaUrl?: string;
  lastLogin: string;
  points: number;
};

export type PointsSnapshot = {
  user: UserAccount;
  ledger: LedgerEntry[];
};

type StoreData = {
  users: UserAccount[];
  ledger: LedgerEntry[];
};

const DEFAULT_USER_ID = 'default';

const DEFAULT_DATA: StoreData = {
  users: [
    {
      id: DEFAULT_USER_ID,
      name: '常連ゲスト #715',
      tier: 'Bronze',
      points: 1250,
      personaUrl: undefined,
      lastLogin: new Date().toISOString(),
    },
  ],
  ledger: [
    {
      id: randomUUID(),
      userId: DEFAULT_USER_ID,
      type: 'charge',
      amount: 1250,
      balance: 1250,
      note: 'Initial balance',
      createdAt: new Date().toISOString(),
    },
  ],
};

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
  }
}

async function readStore(): Promise<StoreData> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw) as StoreData;
    parsed.users ??= [];
    parsed.ledger ??= [];
    return parsed;
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
    return { ...DEFAULT_DATA };
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function appendLedger(store: StoreData, entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
  const fullEntry: LedgerEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  store.ledger.push(fullEntry);
  return fullEntry;
}

export async function ensureUser(user: Partial<UserAccount> & { id: string }): Promise<UserAccount> {
  const store = await readStore();
  let existing = store.users.find((u) => u.id === user.id);
  if (!existing) {
    existing = {
      id: user.id,
      name: user.name ?? 'ゲスト',
      tier: user.tier ?? 'Bronze',
      personaUrl: user.personaUrl,
      lastLogin: user.lastLogin ?? new Date().toISOString(),
      points: user.points ?? 0,
    };
    store.users.push(existing);
    await writeStore(store);
  }
  return existing;
}

export async function getSnapshot(userId = DEFAULT_USER_ID, opts?: { limit?: number }): Promise<PointsSnapshot> {
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  const limit = opts?.limit ?? 10;
  const ledger = store.ledger
    .filter((entry) => entry.userId === userId)
    .slice(-limit)
    .reverse();
  return { user, ledger };
}

export async function chargePoints(userId: string, amount: number, note?: string): Promise<PointsSnapshot> {
  if (amount <= 0) throw new Error('Charge amount must be positive');
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);

  user.points += amount;
  appendLedger(store, { userId, type: 'charge', amount, balance: user.points, note });
  await writeStore(store);
  return getSnapshot(userId);
}

export async function spendPoints(userId: string, amount: number, note?: string): Promise<PointsSnapshot> {
  if (amount <= 0) throw new Error('Spend amount must be positive');
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  if (user.points < amount) throw new Error('Insufficient points');

  user.points -= amount;
  appendLedger(store, { userId, type: 'spend', amount, balance: user.points, note });
  await writeStore(store);
  return getSnapshot(userId);
}

export async function touchLogin(userId: string): Promise<void> {
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return;
  user.lastLogin = new Date().toISOString();
  await writeStore(store);
}

export async function setPersona(
  userId: string,
  personaUrl?: string,
  tier?: UserAccount['tier']
): Promise<PointsSnapshot> {
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error(`User not found: ${userId}`);
  user.personaUrl = personaUrl;
  if (tier) user.tier = tier;
  await writeStore(store);
  return getSnapshot(userId);
}
