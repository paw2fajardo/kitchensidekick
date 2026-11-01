import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

console.log(`KitchenSidekick backend starting on port ${port}...`);
console.log(`Connected Mealie URL: ${process.env.MEALIE_BASE_URL || 'not set'}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`KitchenSidekick backend listening at http://localhost:${port}`);
