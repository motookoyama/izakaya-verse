import type { FastifyInstance } from 'fastify';

export function registerHealth(app: FastifyInstance) {
  app.get('/api/health', async () => {
    return { ok: true, service: 'bff', ts: Date.now() };
  });
}

