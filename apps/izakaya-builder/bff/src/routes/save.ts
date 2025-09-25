import type { FastifyInstance } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';

export function registerSave(app: FastifyInstance) {
  app.post('/api/save', {
    schema: {
      body: {
        type: 'object',
        required: ['filename', 'content'],
        properties: {
          filename: { type: 'string' },
          content: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            path: { type: 'string' },
            bytes: { type: 'number' }
          },
          required: ['ok','path','bytes']
        }
      }
    }
  }, async (req, reply) => {
    const { filename, content } = req.body as { filename: string; content: string };

    // Restrict to docs/samples and prevent traversal
    const root = process.cwd();
    const baseDir = path.join(root, 'docs', 'samples');
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalName = safeName.endsWith('.html') ? safeName : `${safeName}.html`;
    const abs = path.join(baseDir, finalName);
    if (!abs.startsWith(baseDir)) {
      reply.code(400);
      return { ok: false, path: '', bytes: 0 } as any;
    }

    await fs.mkdir(baseDir, { recursive: true });
    const data = Buffer.from(content, 'utf8');
    await fs.writeFile(abs, data);
    return { ok: true, path: path.relative(root, abs), bytes: data.length };
  });
}

