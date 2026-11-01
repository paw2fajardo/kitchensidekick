import { describe, it, expect, vi } from 'vitest';
import { MealieClient, MealieApiError } from '../src/mealie/client.js';

describe('MealieClient (BE-01)', () => {
  it('fetches recipes successfully', async () => {
    const mockData = {
      page: 1,
      per_page: 50,
      total: 1,
      total_pages: 1,
      items: [
        {
          id: 'test-recipe-1',
          slug: 'beef-sukiyaki',
          name: 'Beef Sukiyaki',
          description: 'Delicious hot pot',
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const client = new MealieClient({ baseUrl: 'http://localhost:9000', apiToken: 'secret-token' }, mockFetch as any);
    const result = await client.getRecipes();

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:9000/api/recipes?page=1&per_page=50',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token',
          Accept: 'application/json',
        }),
      })
    );
    expect(result.items.length).toBe(1);
    expect(result.items[0].slug).toBe('beef-sukiyaki');
  });

  it('fetches recipe by slug successfully', async () => {
    const mockRecipe = {
      id: 'rec-123',
      slug: 'sukiyaki',
      name: 'Sukiyaki',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockRecipe,
    });

    const client = new MealieClient({ baseUrl: 'http://localhost:9000' }, mockFetch as any);
    const recipe = await client.getRecipeBySlug('sukiyaki');

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:9000/api/recipes/sukiyaki', expect.anything());
    expect(recipe.id).toBe('rec-123');
  });

  it('throws 404 error when recipe does not exist', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Recipe not found',
    });

    const client = new MealieClient({ baseUrl: 'http://localhost:9000' }, mockFetch as any);
    await expect(client.getRecipeBySlug('nonexistent')).rejects.toThrow(MealieApiError);
  });

  it('handles auth token errors (401/403)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'Invalid token',
    });

    const client = new MealieClient({ baseUrl: 'http://localhost:9000' }, mockFetch as any);
    await expect(client.getRecipes()).rejects.toMatchObject({
      code: 'AUTH_ERROR',
      status: 401,
    });
  });

  it('handles connection timeout and network failures cleanly', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const client = new MealieClient({ baseUrl: 'http://bad-host:9999' }, mockFetch as any);
    await expect(client.getRecipes()).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
  });
});
