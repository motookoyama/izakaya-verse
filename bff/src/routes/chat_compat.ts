import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';
import { getFetch } from '../util/fetcher.js';

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
interface ChatReq { model?: string; messages: ChatMessage[]; stream?: boolean; temperature?: number; max_tokens?: number; provider?: string }

export function registerChatCompat(app: FastifyInstance, cfg: AppConfig) {
  app.post('/v1/chat/completions', {
    schema: {
      body: { type: 'object', required: ['messages'], properties: {
        model: { type: 'string' }, provider: { type: 'string' }, stream: { type: 'boolean' },
        temperature: { type: 'number' }, max_tokens: { type: 'number' },
        messages: { type: 'array', items: { type: 'object', required: ['role','content'], properties: {
          role: { type: 'string', enum: ['system','user','assistant'] }, content: { type: 'string' }
        }}}
      }},
      response: { 200: { type: 'object', properties: {
        id: { type: 'string' }, object: { type: 'string' }, choices: { type: 'array', items: { type: 'object', properties: {
          index: { type: 'number' }, message: { type: 'object', properties: { role: { type: 'string' }, content: { type: 'string' } }, required: ['role','content'] }
        }, required: ['index','message'] } }
      }, required: ['id','object','choices'] } }
    }
  }, async (req, reply) => {
    const body = req.body as ChatReq;
    const provider = ((body?.provider || (req as any)?.query?.provider) || cfg.provider) as AppConfig['provider'];
    const model = body?.model || cfg.ollamaModel;
    const messages = body?.messages || [];
    if (!messages.length) { reply.code(400); return { error: 'messages is required' } as any; }

    const f = getFetch();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.requestTimeoutMs);
    try {
      if (provider === 'ollama') {
        const r = await f(`${cfg.ollamaBaseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, messages, stream: false, temperature: body?.temperature, max_tokens: body?.max_tokens }), signal: ctrl.signal as any } as any);
        if (!r.ok) {
          const raw = await r.text();
          app.log.error({ provider, model, status: r.status, raw }, 'ollama chat error');
          reply.code(r.status);
          try { return JSON.parse(raw); } catch { return { error: raw || 'ollama chat error', status: r.status } as any; }
        }
        const j: any = await r.json();
        return normOpenAIResponse(j);
      }
      if (provider === 'lmstudio') {
        const r = await f(`${cfg.lmstudioBaseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model, messages, stream: false, temperature: body?.temperature, max_tokens: body?.max_tokens }), signal: ctrl.signal as any } as any);
        if (!r.ok) {
          const raw = await r.text();
          app.log.error({ provider, model, status: r.status, raw }, 'lmstudio chat error');
          reply.code(r.status);
          try { return JSON.parse(raw); } catch { return { error: raw || 'lmstudio chat error', status: r.status } as any; }
        }
        const j: any = await r.json();
        return normOpenAIResponse(j);
      }
      if (provider === 'openai') {
        if (!cfg.openaiApiKey) { reply.code(400); return { error: 'OPENAI_API_KEY not set' } as any; }
        const r = await f(`${cfg.openaiBaseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${cfg.openaiApiKey}` }, body: JSON.stringify({ model, messages, stream: false, temperature: body?.temperature, max_tokens: body?.max_tokens }), signal: ctrl.signal as any } as any);
        if (!r.ok) {
          const raw = await r.text();
          app.log.error({ provider, model, status: r.status, raw }, 'openai chat error');
          reply.code(r.status);
          try { return JSON.parse(raw); } catch { return { error: raw || 'openai chat error', status: r.status } as any; }
        }
        const j: any = await r.json();
        return normOpenAIResponse(j);
      }
      if (provider === 'openrouter') {
        if (!cfg.openrouterApiKey) { reply.code(400); return { error: 'OPENROUTER_API_KEY not set' } as any; }
        const headers: Record<string,string> = { 'content-type': 'application/json', Authorization: `Bearer ${cfg.openrouterApiKey}` };
        if (cfg.openrouterSiteUrl) headers['HTTP-Referer'] = cfg.openrouterSiteUrl;
        if (cfg.openrouterAppName) headers['X-Title'] = cfg.openrouterAppName;
        const r = await f(`${cfg.openrouterBaseUrl}/chat/completions`, { method: 'POST', headers, body: JSON.stringify({ model, messages, stream: false, temperature: body?.temperature, max_tokens: body?.max_tokens }), signal: ctrl.signal as any } as any);
        if (!r.ok) {
          const raw = await r.text();
          app.log.error({ provider, model, status: r.status, raw }, 'openrouter chat error');
          reply.code(r.status);
          try { return JSON.parse(raw); } catch { return { error: raw || 'openrouter chat error', status: r.status } as any; }
        }
        const j: any = await r.json();
        return normOpenAIResponse(j);
      }
      if (provider === 'gemini') {
        if (!cfg.geminiApiKey) { reply.code(400); return { error: 'GEMINI_API_KEY not set' } as any; }
        const contents = [ { role: 'user', parts: messages.filter(m=>m.role!=='system').map(m => ({ text: m.content })) } ];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(cfg.geminiApiKey)}`;
        const r = await f(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents }), signal: ctrl.signal as any } as any);
        if (!r.ok) {
          const raw = await r.text();
          app.log.error({ provider, model, status: r.status, raw }, 'gemini chat error');
          reply.code(r.status);
          try { return JSON.parse(raw); } catch { return { error: raw || 'gemini chat error', status: r.status } as any; }
        }
        const j: any = await r.json();
        const text = j?.candidates?.[0]?.content?.parts?.map((p:any)=>p?.text||'').join('') || '';
        return { id: `chatcmpl_${Date.now()}`, object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content: sanitizeContent(text) } }] };
      }
      reply.code(400); return { error: `Unsupported provider: ${provider}` } as any;
    } finally {
      clearTimeout(timer);
    }
  });
}

function normOpenAIResponse(j: any) {
  return {
    id: j?.id || `chatcmpl_${Date.now()}`,
    object: 'chat.completion',
    choices: [ { index: 0, message: { role: 'assistant', content: sanitizeContent(j?.choices?.[0]?.message?.content || '') } } ]
  };
}

// Remove provider-specific auxiliary traces like <think>...</think> and similar tags.
function sanitizeContent(text: string): string {
  if (!text) return text;
  try {
    // Remove <think>...</think> blocks (including multiline)
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Optionally strip special tokens often surfaced by some models
    text = text.replace(/<\|?assistant\|?>/gi, '').replace(/<\|?user\|?>/gi, '');
  } catch {}
  return text;
}
