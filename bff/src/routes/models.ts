import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';
import { getFetch } from '../util/fetcher.js';

type ModelsResponse = { provider: string; models: string[] };

export function registerModels(app: FastifyInstance, cfg: AppConfig) {
  app.get('/api/models', {
    schema: {
      querystring: { type: 'object', properties: { provider: { type: 'string' } } },
      response: { 200: { type: 'object', properties: {
        provider: { type: 'string' },
        models: { type: 'array', items: { type: 'string' } }
      }, required: ['provider','models'] } }
    }
  }, async (req, reply) => {
    const q: any = (req as any).query || {};
    const provider = (q.provider || cfg.provider) as AppConfig['provider'];
    const result: ModelsResponse = { provider, models: [] };
    const f = getFetch();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.requestTimeoutMs);
    try {
      if (provider === 'ollama') {
        const r = await f(`${cfg.ollamaBaseUrl}/models`, { method: 'GET', signal: ctrl.signal } as any);
        if (!r.ok) throw new Error(`status ${r.status}`);
        const j: any = await r.json();
        result.models = Array.isArray(j?.data) ? j.data.map((m: any) => m.id).filter(Boolean) : [];
      } else if (provider === 'lmstudio') {
        const r = await f(`${cfg.lmstudioBaseUrl}/models`, { method: 'GET', signal: ctrl.signal } as any);
        if (!r.ok) throw new Error(`status ${r.status}`);
        const j: any = await r.json();
        result.models = Array.isArray(j?.data) ? j.data.map((m: any) => m.id).filter(Boolean) : [];
      } else if (provider === 'openai') {
        if (!cfg.openaiApiKey) { reply.code(400); return { provider, models: [] }; }
        const r = await f(`${cfg.openaiBaseUrl}/models`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${cfg.openaiApiKey}` },
          signal: ctrl.signal as any
        } as any);
        if (!r.ok) throw new Error(`status ${r.status}`);
        const j: any = await r.json();
        result.models = Array.isArray(j?.data) ? j.data.map((m: any) => m.id).filter(Boolean).slice(0, 100) : [];
      } else if (provider === 'openrouter') {
        if (!cfg.openrouterApiKey) { reply.code(400); return { provider, models: [] }; }
        const headers: Record<string,string> = { Authorization: `Bearer ${cfg.openrouterApiKey}` };
        if (cfg.openrouterSiteUrl) headers['HTTP-Referer'] = cfg.openrouterSiteUrl;
        if (cfg.openrouterAppName) headers['X-Title'] = cfg.openrouterAppName;
        const r = await f(`${cfg.openrouterBaseUrl}/models`, { method: 'GET', headers, signal: ctrl.signal as any } as any);
        if (!r.ok) throw new Error(`status ${r.status}`);
        const j: any = await r.json();
        result.models = Array.isArray(j?.data) ? j.data.map((m: any) => m.id).filter(Boolean).slice(0, 100) : [];
      } else if (provider === 'gemini') {
        if (!cfg.geminiApiKey) { reply.code(400); return { provider, models: [] }; }
        const r = await f(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cfg.geminiApiKey)}`, {
          method: 'GET', signal: ctrl.signal as any
        } as any);
        if (!r.ok) throw new Error(`status ${r.status}`);
        const j: any = await r.json();
        const names = Array.isArray(j?.models) ? j.models.map((m: any) => String(m.name)).filter(Boolean) : [];
        result.models = names.map((s: string) => s.includes('/') ? s.split('/').pop()! : s).slice(0, 100);
      } else {
        reply.code(400); return { provider, models: [] };
      }
    } catch (e) {
      reply.code(502);
      return { provider, models: [] };
    } finally { clearTimeout(timer); }

    return result;
  });
}

