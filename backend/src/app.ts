import { Hono } from 'hono';
import { IWorkflowRepository } from './repository/types.js';
import { MemoryWorkflowRepository } from './repository/memory-repository.js';
import { MealieClient } from './mealie/client.js';
import { createWorkflowsRouter } from './api/workflows.js';
import { createSessionsRouter } from './api/sessions.js';
import { createRecipesRouter } from './api/recipes.js';
import { createMediaRouter } from './api/media.js';

export interface AppConfig {
  repository?: IWorkflowRepository;
  mealieClient?: MealieClient;
}

export function createApp(config: AppConfig = {}) {
  const app = new Hono();

  const repository = config.repository || new MemoryWorkflowRepository();
  const mealieClient =
    config.mealieClient ||
    new MealieClient({
      baseUrl: process.env.MEALIE_BASE_URL || 'http://localhost:9000',
      apiToken: process.env.MEALIE_API_TOKEN,
    });

  // Health check
  app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // Sub-routers
  app.route('/api/recipes', createRecipesRouter(mealieClient));
  app.route('/api/workflows', createWorkflowsRouter(repository, mealieClient));
  app.route('/api/sessions', createSessionsRouter(repository));
  app.route('/api/media', createMediaRouter(mealieClient));

  return app;
}
