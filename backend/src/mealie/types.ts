export interface MealieCategoryItem {
  id?: string;
  name?: string;
  slug?: string;
  groupId?: string;
}

export interface MealieTagItem {
  id?: string;
  name?: string;
  slug?: string;
  groupId?: string;
}

export interface MealieIngredient {
  id?: string;
  title?: string | null;
  note?: string | null;
  unit?: {
    id?: string;
    name?: string;
    fraction?: boolean;
    abbreviation?: string;
  } | string | null;
  food?: {
    id?: string;
    name?: string;
    description?: string;
  } | string | null;
  quantity?: number | string | null;
  display?: string | null;
  referenceId?: string | null;
}

export interface MealieInstruction {
  id: string;
  title?: string | null;
  text: string;
  ingredientReferences?: string[];
}

export interface MealieRecipe {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  recipeYield?: string | null;
  totalTime?: string | null;
  prepTime?: string | null;
  performTime?: string | null;
  recipeCategory?: MealieCategoryItem[];
  tags?: MealieTagItem[];
  recipeIngredient?: MealieIngredient[];
  recipeInstructions?: MealieInstruction[];
  orgURL?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealieRecipeSummary {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  totalTime?: string | null;
  recipeYield?: string | null;
  recipeCategory?: MealieCategoryItem[];
  tags?: MealieTagItem[];
}

export interface MealiePaginationResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: T[];
}

export interface MealieClientConfig {
  baseUrl: string;
  apiToken?: string;
  timeoutMs?: number;
}
