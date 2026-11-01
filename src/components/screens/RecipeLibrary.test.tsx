import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecipeLibrary, CANONICAL_RECIPES } from './RecipeLibrary';

function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
}

describe('RecipeLibrary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canonical fallback recipes when remote fetch fails or returns empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    renderWithClient(<RecipeLibrary />);
    const heading = await screen.findByText('Kanto-Style Sukiyaki (Simmered Beef Hot Pot)');
    expect(heading).toBeDefined();
    expect(screen.getByText('Authentic Sukiyaki Warishita Sauce Base')).toBeDefined();
    expect(screen.getByText('Crispy Panko Pork Tonkatsu')).toBeDefined();
  });

  it('properly extracts items from Mealie paginated format { items: [...] }', async () => {
    const mockMealiePaginatedResponse = {
      page: 1,
      per_page: 50,
      total: 2,
      items: [
        {
          id: 'mealie-rec-1',
          slug: 'miso-glazed-salmon',
          name: 'Miso Glazed Salmon',
          description: 'Sweet and savory broiled salmon with red miso and mirin.',
          recipeYield: '2 servings',
          totalTime: '20 mins',
          hasWorkflow: true,
          image: 'recipe-image-id',
        },
        {
          id: 'mealie-rec-2',
          slug: 'dashi-chawanmushi',
          name: 'Dashi Chawanmushi',
          description: 'Silky savory egg custard steamed with dashi.',
          recipeYield: '4 cups',
          totalTime: '30 mins',
          hasWorkflow: false,
          image: null,
        },
      ],
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockMealiePaginatedResponse,
    } as Response);

    renderWithClient(<RecipeLibrary />);

    expect(await screen.findByText('Miso Glazed Salmon')).toBeDefined();
    expect(screen.getByText('Dashi Chawanmushi')).toBeDefined();
    // Verify image proxy path
    const img = screen.getByAltText('Miso Glazed Salmon') as HTMLImageElement;
    expect(img.src).toContain('/api/media/recipes/mealie-rec-1/images/original.webp');
  });

  it('filters recipes dynamically through the search bar', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    renderWithClient(<RecipeLibrary />);
    await screen.findByText('Authentic Sukiyaki Warishita Sauce Base');
    const searchInput = screen.getByLabelText('Search recipes');
    
    fireEvent.change(searchInput, { target: { value: 'Kansai' } });

    await waitFor(() => {
      expect(screen.getByText('Kansai-Style Sukiyaki (Pan-Seared Beef)')).toBeDefined();
      expect(screen.queryByText('Kanto-Style Sukiyaki (Simmered Beef Hot Pot)')).toBeNull();
      expect(screen.queryByText('Authentic Sukiyaki Warishita Sauce Base')).toBeNull();
    });
  });

  it('filters recipes by protein category tab (pork, beef, chicken, fish/seafood, vegetarian)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    renderWithClient(<RecipeLibrary />);
    await screen.findByText('Kanto-Style Sukiyaki (Simmered Beef Hot Pot)');

    // Click Pork Tab
    const porkTab = screen.getByRole('tab', { name: /pork/i });
    fireEvent.click(porkTab);

    await waitFor(() => {
      expect(screen.getByText('Crispy Panko Pork Tonkatsu')).toBeDefined();
      expect(screen.getByText('Buta Kakuni (Slow-Braised Pork Belly)')).toBeDefined();
      expect(screen.queryByText('Kanto-Style Sukiyaki (Simmered Beef Hot Pot)')).toBeNull();
      expect(screen.queryByText('Saikyo Miso-Glazed King Salmon')).toBeNull();
    });

    // Click Seafood Tab
    const seafoodTab = screen.getByRole('tab', { name: /fish & seafood/i });
    fireEvent.click(seafoodTab);

    await waitFor(() => {
      expect(screen.getByText('Saikyo Miso-Glazed King Salmon')).toBeDefined();
      expect(screen.getByText('Ginger & Scallion Steamed Sea Bass')).toBeDefined();
      expect(screen.queryByText('Crispy Panko Pork Tonkatsu')).toBeNull();
    });
  });

  it('renders >=48px CTA buttons for all displayed recipe cards', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const { container } = renderWithClient(<RecipeLibrary />);
    await screen.findByText('Kanto-Style Sukiyaki (Simmered Beef Hot Pot)');

    const cardCtas = CANONICAL_RECIPES.map((recipe) => {
      const btn = container.querySelector(`#btn-open-recipe-${recipe.slug}`);
      expect(btn).not.toBeNull();
      return btn as HTMLButtonElement;
    });

    expect(cardCtas.length).toBe(CANONICAL_RECIPES.length);
    cardCtas.forEach((btn) => {
      expect(btn.className).toContain('min-h-[48px]');
    });
  });
});
