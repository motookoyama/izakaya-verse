import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.ts';
import { getFetch } from '../util/fetcher.ts';
import path from 'path';
import { loadCardsFromDirs, persistInternalCard } from '../util/fs-v2cards.ts';
import { promises as fs } from 'fs';

type V2Card = {
  id: string;
  name: string;
  meta: Record<string, any>; // may include { system?: string }
  raw: Record<string, any>;
  createdAt: number;
};

const cards: V2Card[] = [];
let defaultSystemTemplate = '';
let businessTemplate = '';
let toolTemplate = '';

function fillTemplate(tpl: string, data: any): string {
  const map: Record<string, string> = {
    name: data?.name || '',
    scenario: data?.scenario || '',
    first_mes: data?.first_mes || data?.first_message || '',
    personality: data?.personality || data?.description || ''
  };
  return tpl.replace(/\{\{\s*(name|scenario|first_mes|personality)\s*\}\}/g, (_m, k) => map[k] || '');
}

export function registerV2(app: FastifyInstance, cfg: AppConfig) {
  // Load existing cards from filesystem (docs/V2card, docs/cards)
  const root = process.cwd();
  const fsDirs = [path.join(root, 'docs', 'V2card'), path.join(root, 'docs', 'cards')];
  // Load default RP template if exists
  (async () => {
    try {
      const p = path.join(root, 'docs', 'cards', '_defaults', 'system.txt');
      defaultSystemTemplate = await fs.readFile(p, 'utf8');
      app.log.info({ template: 'docs/cards/_defaults/system.txt' }, 'Loaded default RP template');
    } catch {
      // fallback minimal template
      defaultSystemTemplate = 'あなたは{{name}}。{{personality}}\n背景: {{scenario}}\n最初の挨拶: {{first_mes}}';
    }
    try { businessTemplate = await fs.readFile(path.join(root, 'docs', 'cards', '_defaults', 'system.business.txt'), 'utf8'); } catch {}
    try { toolTemplate = await fs.readFile(path.join(root, 'docs', 'cards', '_defaults', 'system.tool.txt'), 'utf8'); } catch {}
  })();
  loadCardsFromDirs(fsDirs).then(list => {
    list.forEach(c => {
      cards.push({ id: c.id, name: c.name, meta: c.meta, raw: c.raw, createdAt: c.createdAt });
    });
    app.log.info({ count: list.length }, 'Loaded V2 cards from filesystem');
  }).catch(err => app.log.warn({ err }, 'V2 filesystem load failed'));
  // Create card (mock extraction)
  app.post('/api/v2/cards', {
    schema: {
      response: { 200: { type: 'object', properties: {
        id: { type: 'string' }, name: { type: 'string' }, meta: { type: 'object' }, raw: { type: 'object' }, createdAt: { type: 'number' }
      }, required: ['id','name','meta','raw','createdAt'] } }
    }
  }, async (req) => {
    // Accept JSON {imageBase64} or multipart form-data
    let meta: Record<string, any> = { source: 'mockV2' };
    let name = 'Sample Card';
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct.includes('multipart/form-data') && (req as any).isMultipart && (req as any).isMultipart()) {
      const file = await (req as any).file();
      if (file) { meta.filename = file.filename; meta.mimetype = file.mimetype; await file.toBuffer(); }
    } else if (ct.includes('application/json')) {
      const body = req.body as any;
      if (body?.imageBase64) meta.imageBase64 = String(body.imageBase64).slice(0, 64) + '...';
      if (body?.system) meta.system = String(body.system);
      if (body?.description) meta.description = String(body.description);
      if (body?.name) name = String(body.name);
      if (body?.thumbDataUrl) meta.thumb = String(body.thumbDataUrl).slice(0, 200); // small inline preview
    }

    const now = Date.now();
    const card: V2Card = {
      id: `v2_${cards.length + 1}`,
      name,
      meta,
      raw: { ok: true },
      createdAt: now,
    };
    cards.unshift(card);
    // persist
    persistInternalCard(path.join(root, 'docs', 'cards'), {
      id: card.id, name: card.name, meta: card.meta, raw: card.raw, createdAt: card.createdAt
    }).catch(()=>{});
    return card;
  });

  // List cards (summary)
  app.get('/api/v2/cards', {
    schema: {
      response: { 200: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: {
        id: { type: 'string' }, name: { type: 'string' }, meta: { type: 'object' }, createdAt: { type: 'number' }
      }, required: ['id','name','meta','createdAt'] } } } } }
    }
  }, async () => {
    return { items: cards.map(c => ({ id: c.id, name: c.name, meta: c.meta, createdAt: c.createdAt })) };
  });

  // Get single card
  app.get('/api/v2/cards/:id', {
    schema: { params: { type:'object', properties:{ id:{ type:'string' } }, required:['id'] }, response: { 200: { type:'object', properties: { id:{type:'string'}, name:{type:'string'}, meta:{type:'object'}, createdAt:{type:'number'} }, required:['id','name','meta','createdAt'] } } }
  }, async (req, reply) => {
    const id = (req.params as any).id as string;
    const card = cards.find(c => c.id === id);
    if (!card) return reply.code(404).send({ error: 'not found' } as any);
    return { id: card.id, name: card.name, meta: card.meta, createdAt: card.createdAt };
  });

  // Delete card (eject)
  app.delete('/api/v2/cards/:id', {
    schema: { params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] }, response: { 200: { type:'object', properties: { ok:{type:'boolean'} }, required:['ok'] } } }
  }, async (req) => {
    const id = (req.params as any).id as string;
    const idx = cards.findIndex(c => c.id === id);
    if (idx >= 0) cards.splice(idx, 1);
    return { ok: true };
  });

  // Patch card (update name/system/thumb)
  app.patch('/api/v2/cards/:id', {
    schema: {
      params: { type:'object', properties:{ id:{ type:'string' } }, required:['id'] },
      body: { type:'object', properties: { name:{type:'string'}, system:{type:'string'}, thumbDataUrl:{type:'string'} } },
      response: { 200: { type:'object', properties: { ok:{type:'boolean'}, item:{ type:'object' } }, required:['ok','item'] } }
    }
  }, async (req) => {
    const id = (req.params as any).id as string;
    const card = cards.find(c => c.id === id);
    if (!card) return { ok: false, item: null } as any;
    const body = (req.body || {}) as any;
    if (typeof body.name === 'string') card.name = body.name;
    card.meta = card.meta || {};
    if (typeof body.system === 'string') card.meta.system = body.system;
    if (typeof body.thumbDataUrl === 'string') card.meta.thumb = String(body.thumbDataUrl).slice(0, 200);
    // persist
    persistInternalCard(path.join(root, 'docs', 'cards'), {
      id: card.id, name: card.name, meta: card.meta, raw: card.raw, createdAt: card.createdAt
    }).catch(()=>{});
    return { ok: true, item: { id: card.id, name: card.name, meta: card.meta, createdAt: card.createdAt } };
  });

  // Chat with card context (mock delegate to chat)
  app.post('/api/v2/chat', {
    schema: {
      body: { type: 'object', required: ['cardId','messages'], properties: {
        cardId: { type: 'string' }, provider: { type: 'string' }, model: { type: 'string' }, messages: { type: 'array', items: { type: 'object', properties: {
          role: { type: 'string' }, content: { type: 'string' }
        }, required: ['role','content'] } }
      } },
      response: { 200: { type: 'object', properties: { reply: { type: 'string' } }, required: ['reply'] } }
    }
  }, async (req) => {
    const body = req.body as { cardId: string; provider?: string; model?: string; mode?: string; messages: { role: string; content: string }[] };
    const card = cards.find(c => c.id === body.cardId);
    const f = getFetch();
    const messages: any[] = [];
    if (card?.meta?.system) {
      messages.push({ role: 'system', content: String(card.meta.system) });
    } else {
      // Build from default template using any raw data if available
      const data = (card?.raw as any)?.data || {};
      const src = body?.mode === 'business' ? (businessTemplate || defaultSystemTemplate)
                : body?.mode === 'tool' ? (toolTemplate || defaultSystemTemplate)
                : defaultSystemTemplate;
      const sys = fillTemplate(src, { name: card?.name, ...data, ...card?.meta });
      if (sys && sys.trim()) messages.push({ role: 'system', content: sys });
    }
    (body.messages || []).forEach(m => messages.push({ role: m.role, content: m.content }));

    try {
      const r = await f(`http://127.0.0.1:${cfg.port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: (body.provider || cfg.provider), model: (body.model || cfg.ollamaModel), messages })
      } as any);
      if (r.ok) {
        const j: any = await r.json();
        const reply = j?.choices?.[0]?.message?.content || '';
        return { reply };
      }
    } catch {}

    // Fallback mock
    const lastUser = [...(body.messages || [])].reverse().find(m => m.role === 'user')?.content || '';
    const hint = card ? `カード(${card.name})に基づく応答` : 'カード未選択応答';
    return { reply: `【v2 mock】${hint}: ${lastUser || '...'}` };
  });
}
