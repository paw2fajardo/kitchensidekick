export interface NormalizedIngredient {
  id: string; // Mealie referenceId or generated UUID
  name: string;
  quantity: string | null;
  unit: string | null;
  preparationNote: string | null;
  originalDisplay: string;
}

export interface NormalizedInstruction {
  id: string; // Must preserve original Mealie instruction ID
  title: string | null;
  text: string;
  ingredientReferences: string[];
  estimatedSeconds: number | null;
  sortOrder: number;
}

export interface RecipeAST {
  mealieRecipeId: string;
  slug: string;
  title: string;
  description: string | null;
  yield: string | null;
  totalTimeMinutes: number | null;
  ingredients: NormalizedIngredient[];
  instructions: NormalizedInstruction[];
}
