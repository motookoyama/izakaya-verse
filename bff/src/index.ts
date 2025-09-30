import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
dotenv.config();

import loadConfig from './config.js';
// import { registerHealth } from './routes/health.js'; // ファイルが存在しないためコメントアウト
import { registerModels } from './routes/models.js';
import { registerChatCompat } from './routes/chat_compat.js';
// import { registerV2 } from './routes/v2.full.js'; // ファイルが存在しないためコメントアウト
// import { registerSave } from './routes/save.js'; // ファイルが存在しないためコメントアウト
// import { registerPoints } from './routes/points.js'; // ファイルが存在しないためコメントアウト

const cfg = loadConfig();
const app = Fastify({ logger: { level: cfg.logLevel } });

await app.register(cors, { origin: cfg.corsOrigin === '*' ? true : [cfg.corsOrigin] });
await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024, files: 1 } });

// registerHealth(app);
registerModels(app, cfg);
registerChatCompat(app, cfg);

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
