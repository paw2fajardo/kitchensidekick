import { Hono } from 'hono';
import { MealieClient } from '../mealie/client.js';
import { canonicalSukiyakiMealieRecipe } from '../workflow/fixtures/sukiyaki.js';

export function createRecipesRouter(mealieClient: MealieClient) {
  const router = new Hono();

  /**
   * GET /api/recipes
   * Fetch recipes from Mealie with graceful fallback to canonical Sukiyaki fixture.
   */
  router.get('/', async (c) => {
    const page = Number(c.req.query('page')) || 1;
    const perPage = Number(c.req.query('per_page')) || 50;

    try {
      const response = await mealieClient.getRecipes(page, perPage);
      return c.json(response, 200);
    } catch (err: any) {
      console.warn(`[Recipes API] Mealie unreachable (${err.message}). Falling back to canonical fixtures.`);

      // Fallback to canonical recipe list
      const fallbackSummary = {
        id: canonicalSukiyakiMealieRecipe.id,
        slug: canonicalSukiyakiMealieRecipe.slug,
        name: canonicalSukiyakiMealieRecipe.name,
        description: canonicalSukiyakiMealieRecipe.description ?? null,
        image: canonicalSukiyakiMealieRecipe.image ?? null,
        totalTime: canonicalSukiyakiMealieRecipe.totalTime ?? null,
        recipeYield: canonicalSukiyakiMealieRecipe.recipeYield ?? null,
        recipeCategory: canonicalSukiyakiMealieRecipe.recipeCategory ?? [],
        tags: canonicalSukiyakiMealieRecipe.tags ?? [],
      };

      return c.json(
        {
          page: 1,
          per_page: perPage,
          total: 1,
          total_pages: 1,
          items: [fallbackSummary],
        },
        200
      );
    }
  });

  /**
   * GET /api/recipes/:slug
   * Fetch full recipe details by slug from Mealie with canonical fallback.
   */
  router.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    try {
      const recipe = await mealieClient.getRecipeBySlug(slug);
      return c.json(recipe, 200);
    } catch (err: any) {
      if (slug === canonicalSukiyakiMealieRecipe.slug || slug === canonicalSukiyakiMealieRecipe.id) {
        return c.json(canonicalSukiyakiMealieRecipe, 200);
      }
      return c.json({ error: `Recipe not found: ${err.message}` }, 404);
    }
  });

  return router;
}
