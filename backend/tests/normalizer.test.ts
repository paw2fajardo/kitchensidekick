import { describe, it, expect } from 'vitest';
import { RecipeNormalizer } from '../src/normalizer/normalizer.js';
import { canonicalSukiyakiMealieRecipe } from '../src/workflow/fixtures/sukiyaki.js';

describe('RecipeNormalizer (BE-02)', () => {
  it('normalizes Mealie recipe without mutating or losing instruction IDs', () => {
    const ast = RecipeNormalizer.normalize(canonicalSukiyakiMealieRecipe);

    expect(ast.mealieRecipeId).toBe('recipe-sukiyaki-001');
    expect(ast.title).toBe('Sukiyaki');
    expect(ast.totalTimeMinutes).toBe(45);
    expect(ast.ingredients.length).toBe(8);
    expect(ast.instructions.length).toBe(15);

    // Verify preservation of Mealie instruction IDs
    expect(ast.instructions[0].id).toBe('inst-prep-1');
    expect(ast.instructions[0].ingredientReferences).toEqual(['ing-1']);
    expect(ast.instructions[5].id).toBe('inst-sauce-1');
    expect(ast.instructions[9].id).toBe('inst-cook-1');
  });

  it('correctly parses durations and preserves null when unknown (no fabrication)', () => {
    expect(RecipeNormalizer.parseDurationMinutes('PT30M')).toBe(30);
    expect(RecipeNormalizer.parseDurationMinutes('PT1H15M')).toBe(75);
    expect(RecipeNormalizer.parseDurationMinutes('45 mins')).toBe(45);
    expect(RecipeNormalizer.parseDurationMinutes('')).toBeNull();
    expect(RecipeNormalizer.parseDurationMinutes(null)).toBeNull();
    expect(RecipeNormalizer.parseDurationMinutes('invalid')).toBeNull();
  });

  it('extracts instruction duration seconds when explicitly present in text', () => {
    expect(RecipeNormalizer.extractInstructionDurationSeconds('Simmer for 10 minutes')).toBe(600);
    expect(RecipeNormalizer.extractInstructionDurationSeconds('Wait for 30 seconds')).toBe(30);
    expect(RecipeNormalizer.extractInstructionDurationSeconds('Slice the beef thinly.')).toBeNull();
  });

  it('handles heterogeneous ingredient formats', () => {
    const rawIng = {
      food: { id: 'f-1', name: 'Soy Sauce' },
      unit: { id: 'u-1', name: 'ml' },
      quantity: 100,
      note: 'Dark variety',
      referenceId: 'ref-sauce',
    };

    const normalized = RecipeNormalizer.normalizeIngredient(rawIng, 0);
    expect(normalized.id).toBe('ref-sauce');
    expect(normalized.name).toBe('Soy Sauce');
    expect(normalized.unit).toBe('ml');
    expect(normalized.quantity).toBe('100');
    expect(normalized.preparationNote).toBe('Dark variety');
  });
});
