import { Hono } from 'hono';
import { MealieClient } from '../mealie/client.js';

export function createMediaRouter(mealieClient: MealieClient) {
  const router = new Hono();

  /**
   * GET /api/media/recipes/:id/images/:filename
   * Proxy image requests to Mealie with streaming binary body.
   */
  router.get('/recipes/:id/images/:filename', async (c) => {
    const id = c.req.param('id');
    const filename = c.req.param('filename') || 'original.webp';

    try {
      const upstreamRes = await mealieClient.fetchImage(id, filename);

      if (!upstreamRes.ok) {
        return c.text('Image not found', upstreamRes.status as any);
      }

      const contentType = upstreamRes.headers.get('content-type') || 'image/webp';
      const cacheControl = upstreamRes.headers.get('cache-control') || 'public, max-age=86400';

      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': cacheControl,
        },
      });
    } catch (err: any) {
      return c.text(`Failed to proxy image: ${err.message}`, 502);
    }
  });

  return router;
}
