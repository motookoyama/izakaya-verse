import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
dotenv.config();

import { loadConfig } from './config.ts';
import { registerHealth } from './routes/health.ts';
import { registerModels } from './routes/models.ts';
import { registerChatCompat } from './routes/chat_compat.ts';
import { registerV2 } from './routes/v2.full.ts';
import { registerSave } from './routes/save.ts';

const cfg = loadConfig();
const app = Fastify({ logger: { level: cfg.logLevel } });

await app.register(cors, { origin: cfg.corsOrigin === '*' ? true : [cfg.corsOrigin] });
await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024, files: 1 } });

registerHealth(app);
registerModels(app, cfg);
registerChatCompat(app, cfg);
registerV2(app, cfg);
registerSave(app);

const close = async () => {
  try { await app.close(); } catch {}
  process.exit(0);
};
process.on('SIGINT', close);
process.on('SIGTERM', close);

app.listen({ port: cfg.port, host: '0.0.0.0' }).then(() => {
  app.log.info(`BFF running on http://localhost:${cfg.port}`);
}).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
