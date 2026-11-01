import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Clock,
  Users,
  Sparkles,
  ChefHat,
  AlertCircle,
  ArrowRight,
  UtensilsCrossed,
  X,
  Fish,
  Flame,
  Leaf,
  Drumstick,
} from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';

export type ProteinCategory = 'all' | 'beef' | 'pork' | 'chicken' | 'seafood' | 'vegetarian';

export interface RecipeSummaryItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  recipeYield?: string | null;
  totalTime?: string | null;
  hasWorkflow?: boolean;
  category?: ProteinCategory;
  tags?: string[];
}

export interface CategoryTabConfig {
  id: ProteinCategory;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

export const CATEGORY_TABS: CategoryTabConfig[] = [
  { id: 'all', label: 'All Recipes', accentColor: '#245C43' },
  { id: 'beef', label: 'Beef', icon: Flame, accentColor: '#A65B45' },
  { id: 'pork', label: 'Pork', icon: UtensilsCrossed, accentColor: '#B17A3D' },
  { id: 'chicken', label: 'Chicken', icon: Drumstick, accentColor: '#D97706' },
  { id: 'seafood', label: 'Fish & Seafood', icon: Fish, accentColor: '#356B8C' },
  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, accentColor: '#537B60' },
];

/**
 * Heuristically detects the primary protein/dietary category of a recipe
 * from its title, description, or tags.
 */
export function detectProteinCategory(recipe: {
  name?: string;
  description?: string | null;
  tags?: string[];
}): ProteinCategory {
  const text = `${recipe.name || ''} ${recipe.description || ''} ${(recipe.tags || []).join(' ')}`.toLowerCase();

  // Seafood / Fish check
  if (
    text.includes('salmon') ||
    text.includes('fish') ||
    text.includes('tuna') ||
    text.includes('cod') ||
    text.includes('shrimp') ||
    text.includes('prawn') ||
    text.includes('seafood') ||
    text.includes('scallop') ||
    text.includes('dashi') ||
    text.includes('sea bass') ||
    text.includes('mackerel') ||
    text.includes('crab')
  ) {
    return 'seafood';
  }

  // Pork check
  if (
    text.includes('pork') ||
    text.includes('bacon') ||
    text.includes('tonkatsu') ||
    text.includes('carnitas') ||
    text.includes('prosciutto') ||
    text.includes('ham') ||
    text.includes('ribs') ||
    text.includes('pancetta') ||
    text.includes('chorizo')
  ) {
    return 'pork';
  }

  // Chicken check
  if (
    text.includes('chicken') ||
    text.includes('poultry') ||
    text.includes('turkey') ||
    text.includes('wings') ||
    text.includes('thigh') ||
    text.includes('breast') ||
    text.includes('karaage') ||
    text.includes('yakitori')
  ) {
    return 'chicken';
  }

  // Beef check
  if (
    text.includes('beef') ||
    text.includes('steak') ||
    text.includes('sukiyaki') ||
    text.includes('wagyu') ||
    text.includes('ribeye') ||
    text.includes('tallow') ||
    text.includes('brisket') ||
    text.includes('meatball') ||
    text.includes('short rib') ||
    text.includes('chuck') ||
    text.includes('bolognese')
  ) {
    return 'beef';
  }

  // Vegetarian check
  if (
    text.includes('tofu') ||
    text.includes('vegetable') ||
    text.includes('vegetarian') ||
    text.includes('vegan') ||
    text.includes('salad') ||
    text.includes('mushroom') ||
    text.includes('noodle') ||
    text.includes('chawanmushi') ||
    text.includes('warishita') ||
    text.includes('sauce')
  ) {
    return 'vegetarian';
  }

  return 'beef'; // default fallback
}

// Canonical curated recipes with guaranteed protein coverage for kitchen tablet countertop exploration
export const CANONICAL_RECIPES: RecipeSummaryItem[] = [
  {
    id: 'sukiyaki-kanto-001',
    slug: 'kanto-style-sukiyaki',
    name: 'Kanto-Style Sukiyaki (Simmered Beef Hot Pot)',
    description: 'Classic Tokyo-style sukiyaki simmered in rich warishita broth with thinly sliced wagyu ribeye, shiitake mushrooms, grilled yakidofu, and shirataki noodles.',
    totalTime: '45 mins',
    recipeYield: '4 servings',
    hasWorkflow: true,
    category: 'beef',
  },
  {
    id: 'sukiyaki-kansai-002',
    slug: 'kansai-style-sukiyaki',
    name: 'Kansai-Style Sukiyaki (Pan-Seared Beef)',
    description: 'Western Japan style where beef ribeye is seared first with crystal sugar and dark soy directly in beef tallow before vegetables are introduced.',
    totalTime: '35 mins',
    recipeYield: '4 servings',
    hasWorkflow: true,
    category: 'beef',
  },
  {
    id: 'pork-tonkatsu-003',
    slug: 'crispy-pork-katsu',
    name: 'Crispy Panko Pork Tonkatsu',
    description: 'Tender pork loin cutlets breaded in delicate Japanese panko flakes, fried to a crisp golden finish and served with shredded cabbage and sesame katsu glaze.',
    totalTime: '30 mins',
    recipeYield: '2 servings',
    hasWorkflow: true,
    category: 'pork',
  },
  {
    id: 'buta-kakuni-004',
    slug: 'slow-braised-pork-belly',
    name: 'Buta Kakuni (Slow-Braised Pork Belly)',
    description: 'Melt-in-your-mouth pork belly cubes braised with ginger, scallions, sake, and dark brown sugar until glazed and tender.',
    totalTime: '60 mins',
    recipeYield: '4 servings',
    hasWorkflow: false,
    category: 'pork',
  },
  {
    id: 'chicken-karaage-005',
    slug: 'crispy-ginger-chicken-karaage',
    name: 'Crispy Ginger Chicken Karaage',
    description: 'Juicy chicken thighs marinated in freshly grated ginger, garlic, and soy sauce, dusted in potato starch for a featherlight double-fried crunch.',
    totalTime: '25 mins',
    recipeYield: '3 servings',
    hasWorkflow: true,
    category: 'chicken',
  },
  {
    id: 'chicken-teriyaki-006',
    slug: 'skillet-chicken-teriyaki',
    name: 'Glazed Skillet Chicken Teriyaki',
    description: 'Pan-seared skin-on chicken thighs simmered in a glossy reduced tare glaze of hon mirin, sake, and tamari soy.',
    totalTime: '20 mins',
    recipeYield: '2 servings',
    hasWorkflow: false,
    category: 'chicken',
  },
  {
    id: 'salmon-miso-007',
    slug: 'miso-glazed-king-salmon',
    name: 'Saikyo Miso-Glazed King Salmon',
    description: 'Fresh king salmon fillets broiled with sweet white Kyoto miso, mirin, and toasted sesame until caramelized on top.',
    totalTime: '20 mins',
    recipeYield: '2 servings',
    hasWorkflow: true,
    category: 'seafood',
  },
  {
    id: 'sea-bass-steamed-008',
    slug: 'ginger-scallion-steamed-sea-bass',
    name: 'Ginger & Scallion Steamed Sea Bass',
    description: 'Delicate white sea bass fillets gently steamed with aromatics and dressed with sizzling sesame oil and premium light soy.',
    totalTime: '18 mins',
    recipeYield: '2 servings',
    hasWorkflow: false,
    category: 'seafood',
  },
  {
    id: 'tofu-steak-009',
    slug: 'crispy-tofu-steak-mushroom-sauce',
    name: 'Seared Tofu Steak with Mushroom Demi-Glace',
    description: 'Thick cut organic firm tofu pan-seared to a golden crisp, blanketed with sauteed maitake and shimeji mushrooms in savory dashi broth.',
    totalTime: '25 mins',
    recipeYield: '2 servings',
    hasWorkflow: true,
    category: 'vegetarian',
  },
  {
    id: 'warishita-base-010',
    slug: 'traditional-warishita-sauce',
    name: 'Authentic Sukiyaki Warishita Sauce Base',
    description: 'Balanced sweet-savory reduction of sake, mirin, Japanese dark soy sauce, and organic cane sugar for hot pot bases.',
    totalTime: '15 mins',
    recipeYield: '600 ml',
    hasWorkflow: true,
    category: 'vegetarian',
  },
];

export interface RecipeLibraryProps {
  onSelectRecipe?: (recipe: RecipeSummaryItem) => void;
  onOpenWorkflow?: (recipeSlug: string) => void;
}

type FilterMode = 'all' | 'ready' | 'quick';

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  onSelectRecipe,
  onOpenWorkflow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProteinCategory>('all');
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');

  // TanStack Query fetching from backend /api/recipes with fallback
  const { data: rawRecipes = CANONICAL_RECIPES, isLoading, isError } = useQuery<RecipeSummaryItem[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/recipes');
        if (!response.ok) {
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
            const name = String(item.name || 'Untitled Recipe');
            const description = typeof item.description === 'string' ? item.description : null;
            const category = (item.category as ProteinCategory) || detectProteinCategory({ name, description });

            return {
              id,
              slug: String(item.slug || id),
              name,
              description,
              image,
              recipeYield: typeof item.recipeYield === 'string' ? item.recipeYield : null,
              totalTime: typeof item.totalTime === 'string' ? item.totalTime : null,
              hasWorkflow: Boolean(item.hasWorkflow),
              category,
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

  // Calculate dynamic category item counts for glanceable pill badges
  const categoryCounts = useMemo(() => {
    const counts: Record<ProteinCategory, number> = {
      all: rawRecipes.length,
      beef: 0,
      pork: 0,
      chicken: 0,
      seafood: 0,
      vegetarian: 0,
    };
    rawRecipes.forEach((r) => {
      const cat = r.category || detectProteinCategory(r);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });
    return counts;
  }, [rawRecipes]);

  // Combined Filtering: Category + Filter Mode (ready/quick) + Text Search
  const filteredRecipes = useMemo(() => {
    let result = rawRecipes;

    // 1. Protein Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => {
        const cat = r.category || detectProteinCategory(r);
        return cat === selectedCategory;
      });
    }

    // 2. Ready / Quick Chips
    if (activeFilter === 'ready') {
      result = result.filter((r) => r.hasWorkflow);
    } else if (activeFilter === 'quick') {
      result = result.filter((r) => {
        if (!r.totalTime) return false;
        const match = r.totalTime.match(/(\d+)/);
        return match ? parseInt(match[1], 10) <= 30 : false;
      });
    }

    // 3. Search text query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [rawRecipes, selectedCategory, activeFilter, searchQuery]);

  return (
    <div id="recipe-library-container" className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. Header Section: Title + Catalog Count Badge
      ────────────────────────────────────────────────────────────── */}
      <div id="recipe-library-header" className="p-4 md:p-6 lg:p-8 pb-4 md:pb-5 border-b border-[#D9DDD4] bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 id="recipe-library-title" className="text-[24px] md:text-[28px] font-bold text-[#20251F] tracking-tight">
              Recipe Library
            </h2>
            <p id="recipe-library-subtitle" className="text-[14px] md:text-[16px] text-[#5F675F] mt-0.5">
              Select a dish to launch step-by-step parallel cooking orchestration.
            </p>
          </div>
          <div
            id="recipe-catalog-count-badge"
            className="self-start md:self-auto px-3.5 py-1.5 rounded-[8px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#5F675F] text-[13px] font-semibold flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4 text-[#245C43]" />
            <span>{filteredRecipes.length} shown of {rawRecipes.length} recipes</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. Category Filter Bar: Kitchen Touch Pills (>=48px Touch Targets)
            Categorized by Protein: Beef, Pork, Chicken, Fish/Seafood, Vegetarian
        ────────────────────────────────────────────────────────────── */}
        <div className="mb-4">
          <label className="block text-[12px] font-bold uppercase tracking-wider text-[#5F675F] mb-2">
            Filter by Protein & Dietary
          </label>
          <div
            id="protein-category-tabs"
            role="tablist"
            aria-label="Filter recipes by category"
            className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none"
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              const count = categoryCounts[tab.id];
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  id={`cat-pill-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(tab.id)}
                  type="button"
                  className={`min-h-[48px] px-4 py-2.5 rounded-[10px] text-[15px] font-semibold transition-all shrink-0 inline-flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#245C43] text-[#FFFFFF] border-[#245C43] shadow-sm'
                      : 'bg-[#F5F5F0] hover:bg-[#ECEDE7] text-[#20251F] border-[#D9DDD4]'
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FFFFFF]' : 'text-[#5F675F]'}`} />}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-0.5 px-2 py-0.5 rounded-full text-[12px] font-bold ${
                      isSelected ? 'bg-[#FFFFFF]/25 text-[#FFFFFF]' : 'bg-[#ECEDE7] text-[#5F675F]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. Search & Quick Filters Ribbon (>=48px touch targets)
        ────────────────────────────────────────────────────────────── */}
        <div id="recipe-library-search-ribbon" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5F675F]">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="recipe-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, or techniques..."
              aria-label="Search recipes"
              className="w-full min-h-[48px] pl-11 pr-10 py-2.5 rounded-[10px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[16px] placeholder-[#8E968E] focus:outline-none focus:ring-2 focus:ring-[#245C43] focus:bg-[#FFFFFF] transition-all"
            />
            {searchQuery && (
              <button
                id="btn-clear-search"
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5F675F] hover:text-[#20251F]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Workflow & Duration Filters */}
          <div id="filter-chips-group" className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="filter-chip-all"
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`min-h-[48px] px-4 rounded-[10px] text-[14px] font-semibold transition-colors shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-[#20251F] text-[#FFFFFF]'
                  : 'bg-[#F5F5F0] hover:bg-[#ECEDE7] text-[#5F675F] border border-[#D9DDD4]'
              }`}
            >
              All Types
            </button>
            <button
              id="filter-chip-ready"
              type="button"
              onClick={() => setActiveFilter('ready')}
              className={`min-h-[48px] px-4 rounded-[10px] text-[14px] font-semibold transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                activeFilter === 'ready'
                  ? 'bg-[#20251F] text-[#FFFFFF]'
                  : 'bg-[#F5F5F0] hover:bg-[#ECEDE7] text-[#5F675F] border border-[#D9DDD4]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              Workflow Ready
            </button>
            <button
              id="filter-chip-quick"
              type="button"
              onClick={() => setActiveFilter('quick')}
              className={`min-h-[48px] px-4 rounded-[10px] text-[14px] font-semibold transition-colors shrink-0 inline-flex items-center gap-1.5 ${
                activeFilter === 'quick'
                  ? 'bg-[#20251F] text-[#FFFFFF]'
                  : 'bg-[#F5F5F0] hover:bg-[#ECEDE7] text-[#5F675F] border border-[#D9DDD4]'
              }`}
            >
              <Clock className="w-4 h-4" />
              &le; 30 mins
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Main Recipe Grid / Content Area
      ────────────────────────────────────────────────────────────── */}
      <div id="recipe-library-content" className="p-4 md:p-6 lg:p-8 flex-1">
        {isLoading ? (
          <div id="recipes-loading-indicator" className="flex flex-col items-center justify-center min-h-[280px] text-[#5F675F] text-[16px] gap-3">
            <ChefHat className="w-8 h-8 text-[#5F675F]" />
            <span>Loading recipe catalog...</span>
          </div>
        ) : isError ? (
          <div id="recipes-error-banner" className="p-4 rounded-[10px] bg-[#FDF4E7] border border-[#D9DDD4] text-[#A86416] flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-[15px]">Could not reach remote recipe server. Showing local kitchen library.</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div id="recipes-empty-state" className="text-center py-16 px-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F0] border border-[#D9DDD4] flex items-center justify-center mx-auto mb-4 text-[#8E968E]">
              <UtensilsCrossed className="w-8 h-8 text-[#5F675F]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#20251F] mb-1.5">
              No recipes found
            </h3>
            <p className="text-[15px] text-[#5F675F] leading-relaxed mb-6">
              {searchQuery
                ? `No matching recipes for "${searchQuery}" in ${selectedCategory === 'all' ? 'the catalog' : selectedCategory}.`
                : `There are currently no recipes under the "${selectedCategory}" category.`}
            </p>
            <button
              id="btn-reset-filters"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="min-h-[48px] px-6 py-2.5 rounded-[10px] bg-[#245C43] text-[#FFFFFF] font-semibold text-[15px] hover:bg-[#194A35] transition-colors"
            >
              Show All Recipes
            </button>
          </div>
        ) : (
          <div id="recipe-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const cat = recipe.category || detectProteinCategory(recipe);
              const catConfig = CATEGORY_TABS.find((t) => t.id === cat);

              return (
                <div
                  key={recipe.id}
                  id={`recipe-card-${recipe.slug}`}
                  className="rounded-[14px] border border-[#D9DDD4] bg-[#FFFFFF] overflow-hidden flex flex-col justify-between hover:border-[#8E968E] transition-all hover:shadow-xs group"
                >
                  <div>
                    {/* Hero Image or Kitchen Silhouette Fallback */}
                    {recipe.image ? (
                      <div className="w-full h-44 bg-[#F5F5F0] overflow-hidden border-b border-[#D9DDD4] relative">
                        <img
                          id={`recipe-img-${recipe.slug}`}
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLElement).parentElement?.classList.add('hidden');
                          }}
                        />
                        {/* Steady-state Category Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-[6px] bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#D9DDD4] text-[#20251F] text-[12px] font-bold shadow-xs flex items-center gap-1.5">
                          {catConfig?.icon && <catConfig.icon className="w-3.5 h-3.5 text-[#245C43]" />}
                          <span>{catConfig?.label || cat}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-[#F5F5F0] border-b border-[#D9DDD4] flex items-center justify-between px-5 text-[#8E968E]">
                        <div className="flex items-center gap-2">
                          {catConfig?.icon ? (
                            <catConfig.icon className="w-6 h-6 text-[#5F675F]" />
                          ) : (
                            <UtensilsCrossed className="w-6 h-6 text-[#5F675F]" />
                          )}
                          <span className="text-[13px] font-semibold text-[#5F675F] uppercase tracking-wider">
                            {catConfig?.label || cat}
                          </span>
                        </div>
                        {recipe.hasWorkflow && (
                          <span className="px-2.5 py-1 rounded-[6px] bg-[#E4EEE7] border border-[#245C43]/20 text-[#245C43] text-[12px] font-bold inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Workflow Ready
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5 pb-0">
                      <h3
                        id={`recipe-title-${recipe.slug}`}
                        className="text-[19px] md:text-[21px] font-bold text-[#20251F] leading-snug line-clamp-2 mb-2 group-hover:text-[#245C43] transition-colors"
                      >
                        {recipe.name}
                      </h3>

                      {recipe.description && (
                        <p
                          id={`recipe-desc-${recipe.slug}`}
                          className="text-[14px] md:text-[15px] text-[#5F675F] line-clamp-2 mb-4 leading-relaxed"
                        >
                          {recipe.description}
                        </p>
                      )}

                      {/* Metadata Chips: Glanceable at 3-4 feet */}
                      <div id={`recipe-meta-${recipe.slug}`} className="flex flex-wrap items-center gap-2 mb-5">
                        {recipe.totalTime && (
                          <span
                            id={`chip-time-${recipe.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[13px] font-semibold"
                          >
                            <Clock className="w-3.5 h-3.5 text-[#5F675F]" />
                            {recipe.totalTime}
                          </span>
                        )}
                        {recipe.recipeYield && (
                          <span
                            id={`chip-yield-${recipe.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[13px] font-semibold"
                          >
                            <Users className="w-3.5 h-3.5 text-[#5F675F]" />
                            {recipe.recipeYield}
                          </span>
                        )}
                        {recipe.image && recipe.hasWorkflow && (
                          <span
                            id={`chip-workflow-${recipe.slug}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#E4EEE7] border border-[#245C43]/20 text-[#245C43] text-[12px] font-bold"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Workflow Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action CTA: >=48px Touch Target with zero nested cards */}
                  <div className="p-5 pt-3 border-t border-[#D9DDD4] flex items-center justify-between gap-3 bg-[#FFFFFF]">
                    <TouchButton
                      id={`btn-open-recipe-${recipe.slug}`}
                      variant="primary"
                      className="w-full flex-1 min-h-[48px] text-[16px] font-bold"
                      onClick={() => {
                        if (onOpenWorkflow) {
                          onOpenWorkflow(recipe.slug);
                        } else if (onSelectRecipe) {
                          onSelectRecipe(recipe);
                        }
                      }}
                    >
                      <span>{recipe.hasWorkflow ? 'Open Cooking Workflow' : 'Generate Workflow'}</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </TouchButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
