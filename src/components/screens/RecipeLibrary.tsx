import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, Users, Sparkles, ChefHat, AlertCircle, ArrowRight } from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';

export interface RecipeSummaryItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  recipeYield?: string | null;
  totalTime?: string | null;
  hasWorkflow?: boolean;
}

// Canonical Sukiyaki recipes guaranteed as fallback so the kitchen tablet is never empty
export const CANONICAL_RECIPES: RecipeSummaryItem[] = [
  {
    id: 'sukiyaki-kanto-001',
    slug: 'kanto-style-sukiyaki',
    name: 'Kanto-Style Sukiyaki (Simmered Beef Hot Pot)',
    description: 'Classic Tokyo-style sukiyaki cooked in seasoned warishita broth with thinly sliced beef ribeye, shiitake mushrooms, grilled tofu, and shirataki noodles.',
    totalTime: '45 mins',
    recipeYield: '4 servings',
    hasWorkflow: true,
  },
  {
    id: 'sukiyaki-kansai-002',
    slug: 'kansai-style-sukiyaki',
    name: 'Kansai-Style Sukiyaki (Pan-Seared Beef)',
    description: 'Western Japan style where beef is seared first with crystallized sugar and soy sauce directly in beef tallow before vegetables are added.',
    totalTime: '35 mins',
    recipeYield: '4 servings',
    hasWorkflow: false,
  },
  {
    id: 'warishita-base-003',
    slug: 'traditional-warishita-sauce',
    name: 'Authentic Sukiyaki Warishita Sauce Base',
    description: 'Balanced sweet-savory reduction of sake, mirin, Japanese dark soy sauce, and organic cane sugar.',
    totalTime: '15 mins',
    recipeYield: '600 ml',
    hasWorkflow: true,
  },
];

export interface RecipeLibraryProps {
  onSelectRecipe?: (recipe: RecipeSummaryItem) => void;
  onOpenWorkflow?: (recipeSlug: string) => void;
}

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  onSelectRecipe,
  onOpenWorkflow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // TanStack Query fetching from backend /api/recipes with fallback
  const { data: recipes = CANONICAL_RECIPES, isLoading, isError } = useQuery<RecipeSummaryItem[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
          // If backend endpoint is not yet present, gracefully fall back to canonical items
          return CANONICAL_RECIPES;
        }
        const data = await response.json();
        const rawItems: Record<string, unknown>[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];

        if (rawItems.length > 0) {
          return rawItems.map((item) => {
            const id = String(item.id || '');
            const image = item.image
              ? `/api/media/recipes/${id}/images/original.webp`
              : (item.image === null ? null : undefined);
            return {
              id,
              slug: String(item.slug || id),
              name: String(item.name || 'Untitled Recipe'),
              description: typeof item.description === 'string' ? item.description : null,
              image,
              recipeYield: typeof item.recipeYield === 'string' ? item.recipeYield : null,
              totalTime: typeof item.totalTime === 'string' ? item.totalTime : null,
              hasWorkflow: Boolean(item.hasWorkflow),
            };
          });
        }
        return CANONICAL_RECIPES;
      } catch {
        return CANONICAL_RECIPES;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return recipes;
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }, [recipes, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      {/* Library Top Action Bar */}
      <div className="p-4 md:p-6 lg:p-8 border-b border-[#D9DDD4] bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#20251F] tracking-tight">
              Recipe Library
            </h2>
            <p className="text-[14px] md:text-[16px] text-[#5F675F]">
              Browse recipes synced from Mealie or start from canonical kitchen templates.
            </p>
          </div>
        </div>

        {/* Search Bar - Kitchen Accessible >=48px */}
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F675F]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipe name or ingredient..."
            aria-label="Search recipes"
            className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-[10px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[16px] placeholder-[#8E968E] focus:outline-none focus:ring-2 focus:ring-[#245C43] focus:bg-[#FFFFFF] transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-6 lg:p-8 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[240px] text-[#5F675F] text-[16px]">
            <span>Loading recipe catalog...</span>
          </div>
        ) : isError ? (
          <div className="p-4 rounded-[10px] bg-[#FDF4E7] border border-[#D9DDD4] text-[#A86416] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[15px]">Could not load remote recipes. Displaying local canonical recipes.</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-[#8E968E] mx-auto mb-3" />
            <h3 className="text-[18px] font-semibold text-[#20251F]">No recipes match &ldquo;{searchQuery}&rdquo;</h3>
            <p className="text-[14px] text-[#5F675F] mt-1">Try a different search keyword or clear your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-[12px] border border-[#D9DDD4] bg-[#FFFFFF] overflow-hidden flex flex-col justify-between hover:border-[#8E968E] transition-colors"
              >
                <div>
                  {recipe.image && (
                    <div className="w-full h-40 bg-[#F5F5F0] overflow-hidden border-b border-[#D9DDD4]">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Hide broken image container cleanly
                          (e.target as HTMLElement).parentElement?.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}

                  <div className="p-5 pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-[18px] md:text-[20px] font-bold text-[#20251F] leading-snug">
                        {recipe.name}
                      </h3>
                    </div>

                    {recipe.description && (
                      <p className="text-[14px] md:text-[15px] text-[#5F675F] line-clamp-3 mb-4 leading-relaxed">
                        {recipe.description}
                      </p>
                    )}

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      {recipe.totalTime && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#5F675F] text-[13px] font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#5F675F]" />
                          {recipe.totalTime}
                        </span>
                      )}
                      {recipe.recipeYield && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#5F675F] text-[13px] font-medium">
                          <Users className="w-3.5 h-3.5 text-[#5F675F]" />
                          {recipe.recipeYield}
                        </span>
                      )}
                      {recipe.hasWorkflow && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#E4EEE7] border border-[#245C43]/20 text-[#245C43] text-[13px] font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Workflow Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action CTA: >=48px Touch Target */}
                <div className="p-5 pt-4 border-t border-[#D9DDD4] flex items-center justify-between gap-3">
                  <TouchButton
                    variant="primary"
                    className="w-full flex-1"
                    onClick={() => {
                      if (onOpenWorkflow) {
                        onOpenWorkflow(recipe.slug);
                      } else if (onSelectRecipe) {
                        onSelectRecipe(recipe);
                      }
                    }}
                  >
                    <span>{recipe.hasWorkflow ? 'Open Workflow' : 'Generate Workflow'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </TouchButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
