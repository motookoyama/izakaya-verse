import type { FastifyInstance } from 'fastify';
import { ensureUser, getSnapshot, chargePoints, spendPoints, setPersona, touchLogin } from '../store/pointsStore.ts';

const DEFAULT_USER_ID = 'default';

export function registerPoints(app: FastifyInstance) {
  app.get('/api/account', async () => {
    await ensureUser({ id: DEFAULT_USER_ID });
    await touchLogin(DEFAULT_USER_ID);
    return getSnapshot(DEFAULT_USER_ID, { limit: 10 });
  });

  app.post('/api/points/charge', {
    schema: {
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 1 },
          note: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const body = req.body as { amount: number; note?: string; userId?: string };
    try {
      const snapshot = await chargePoints(body.userId ?? DEFAULT_USER_ID, Math.floor(body.amount), body.note);
      return snapshot;
    } catch (error) {
      reply.status(400);
      return { error: (error as Error).message };
    }
  });

  app.post('/api/points/spend', {
    schema: {
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 1 },
          note: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const body = req.body as { amount: number; note?: string; userId?: string };
    try {
      const snapshot = await spendPoints(body.userId ?? DEFAULT_USER_ID, Math.floor(body.amount), body.note);
      return snapshot;
    } catch (error) {
      reply.status(400);
      return { error: (error as Error).message };
    }
  });

  app.post('/api/account/persona', {
    schema: {
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          personaUrl: { type: 'string' },
          tier: { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const body = req.body as { userId?: string; personaUrl?: string; tier?: string };
    try {
      const snapshot = await setPersona(body.userId ?? DEFAULT_USER_ID, body.personaUrl, body.tier as any);
      return snapshot;
    } catch (error) {
      reply.status(400);
      return { error: (error as Error).message };
    }
  });
}
