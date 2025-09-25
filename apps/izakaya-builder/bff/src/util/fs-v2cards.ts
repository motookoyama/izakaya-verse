import { promises as fs } from 'fs';
import path from 'path';

export type LoadedCard = {
  id: string;
  name: string;
  meta: Record<string, any>;
  raw: Record<string, any>;
  createdAt: number;
};

async function* walk(dir: string): AsyncGenerator<string> {
  try {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) yield* walk(p);
      else yield p;
    }
  } catch {}
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'card';
}

function synthesizeSystem(data: any) {
  const name = data?.name || '{{char}}';
  const personality = data?.personality || data?.description || '';
  const scenario = data?.scenario || '';
  const first = data?.first_mes || data?.first_message || '';
  return [
    `あなたは${name}。${personality}`.trim(),
    scenario ? `背景: ${scenario}` : '',
    'ルール:\n- 事実→理由→次の一歩の順で簡潔に。\n- 初心者にも分かる言い換えを添える。\n- 不明点は質問で補う。',
    first ? `最初の挨拶: ${first}` : ''
  ].filter(Boolean).join('\n');
}

export async function loadCardsFromDirs(dirs: string[]): Promise<LoadedCard[]> {
  const out: LoadedCard[] = [];
  const seen = new Set<string>();
  for (const base of dirs) {
    for await (const f of walk(base)) {
      if (!f.toLowerCase().endsWith('.json')) continue;
      try {
        const rawText = await fs.readFile(f, 'utf8');
        const j = JSON.parse(rawText);
        let name = j?.data?.name || j?.name || path.basename(f, '.json');
        let system = j?.data?.system_prompt ?? j?.data?.post_history_instructions;
        if (!system) system = synthesizeSystem(j?.data || j);
        const id = slugify(name + '-' + path.basename(f, '.json'));
        if (seen.has(id)) continue;
        seen.add(id);
        const stat = await fs.stat(f);
        out.push({
          id,
          name,
          meta: { system },
          raw: j,
          createdAt: Math.floor(stat.mtimeMs || Date.now())
        });
      } catch {
        // ignore bad files
      }
    }
  }
  return out;
}

export async function persistInternalCard(baseDir: string, card: LoadedCard) {
  const dir = path.join(baseDir, card.id);
  await fs.mkdir(dir, { recursive: true });
  const internal = { name: card.name, meta: card.meta, raw: card.raw, createdAt: card.createdAt };
  await fs.writeFile(path.join(dir, 'internal.json'), JSON.stringify(internal, null, 2), 'utf8');
}

