import { MealieIngredient, MealieInstruction, MealieRecipe } from '../mealie/types.js';
import { NormalizedIngredient, NormalizedInstruction, RecipeAST } from './types.js';

export class RecipeNormalizer {
  /**
   * Parse an ISO 8601 duration or standard minutes string into an integer minute count.
   * Universal constraint: Never fabricate values. If unparsable, return null.
   */
  public static parseDurationMinutes(timeStr?: string | null): number | null {
    if (!timeStr || !timeStr.trim()) {
      return null;
    }
    const clean = timeStr.trim();

    // Check ISO 8601 duration e.g. PT30M, PT1H15M
    const isoMatch = clean.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
    if (isoMatch) {
      const hours = parseInt(isoMatch[1] || '0', 10);
      const minutes = parseInt(isoMatch[2] || '0', 10);
      const seconds = parseInt(isoMatch[3] || '0', 10);
      return hours * 60 + minutes + Math.round(seconds / 60);
    }

    // Check plain integer or "X mins"
    const textMatch = clean.match(/^(\d+)\s*(?:min|mins|minutes)?$/i);
    if (textMatch) {
      return parseInt(textMatch[1], 10);
    }

    return null;
  }

  /**
   * Extract duration in seconds if instruction text explicitly mentions it (e.g. "simmer for 10 minutes").
   */
  public static extractInstructionDurationSeconds(text: string): number | null {
    if (!text) return null;

    // Pattern: "for 10 minutes", "5-7 minutes", "30 seconds"
    const secMatch = text.match(/(?:for\s+)?(\d+)\s*(?:sec|secs|seconds)\b/i);
    if (secMatch) {
      return parseInt(secMatch[1], 10);
    }

    const minMatch = text.match(/(?:for\s+)?(\d+)(?:\s*-\s*\d+)?\s*(?:min|mins|minutes|minute)\b/i);
    if (minMatch) {
      return parseInt(minMatch[1], 10) * 60;
    }

    return null;
  }

  public static normalizeIngredient(ing: MealieIngredient, index: number): NormalizedIngredient {
    const rawDisplay = (ing.display || ing.note || ing.title || '').trim();
    
    let name = '';
    if (typeof ing.food === 'string') {
      name = ing.food;
    } else if (ing.food && typeof ing.food === 'object' && ing.food.name) {
      name = ing.food.name;
    } else if (ing.title) {
      name = ing.title;
    } else if (rawDisplay) {
      name = rawDisplay;
    } else {
      name = `Ingredient ${index + 1}`;
    }

    let unit: string | null = null;
    if (typeof ing.unit === 'string') {
      unit = ing.unit;
    } else if (ing.unit && typeof ing.unit === 'object' && ing.unit.name) {
      unit = ing.unit.name;
    }

    let quantity: string | null = null;
    if (ing.quantity !== undefined && ing.quantity !== null) {
      quantity = String(ing.quantity);
    }

    const preparationNote = ing.note ? ing.note.trim() : null;
    const id = ing.referenceId || ing.id || `ing-${index + 1}`;

    return {
      id,
      name: name.trim(),
      quantity,
      unit,
      preparationNote,
      originalDisplay: rawDisplay || name,
    };
  }

  public static normalizeInstruction(inst: MealieInstruction, index: number): NormalizedInstruction {
    const originalId = inst.id || `inst-${index + 1}`;
    const text = (inst.text || '').trim();
    const title = inst.title ? inst.title.trim() : null;
    const ingredientReferences = Array.isArray(inst.ingredientReferences) ? inst.ingredientReferences : [];
    const estimatedSeconds = this.extractInstructionDurationSeconds(text);

    return {
      id: originalId,
      title,
      text,
      ingredientReferences,
      estimatedSeconds,
      sortOrder: index + 1,
    };
  }

  public static normalize(recipe: MealieRecipe): RecipeAST {
    const totalTimeMinutes = this.parseDurationMinutes(recipe.totalTime);

    const ingredients: NormalizedIngredient[] = (recipe.recipeIngredient || []).map((ing, idx) =>
      this.normalizeIngredient(ing, idx)
    );

    const instructions: NormalizedInstruction[] = (recipe.recipeInstructions || []).map((inst, idx) =>
      this.normalizeInstruction(inst, idx)
    );

    return {
      mealieRecipeId: recipe.id,
      slug: recipe.slug,
      title: recipe.name.trim(),
      description: recipe.description ? recipe.description.trim() : null,
      yield: recipe.recipeYield ? recipe.recipeYield.trim() : null,
      totalTimeMinutes,
      ingredients,
      instructions,
    };
  }
}
