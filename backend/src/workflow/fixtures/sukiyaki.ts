import { MealieRecipe } from '../../mealie/types.js';

export const canonicalSukiyakiMealieRecipe: MealieRecipe = {
  id: 'recipe-sukiyaki-001',
  slug: 'sukiyaki',
  name: 'Sukiyaki',
  description: 'Classic Japanese hot pot with thinly sliced beef, vegetables, tofu, and savory-sweet sauce.',
  recipeYield: '4 servings',
  totalTime: 'PT45M',
  recipeCategory: [
    { id: 'cat-main', name: 'Main Course', slug: 'main-course' },
    { id: 'cat-dinner', name: 'Dinner', slug: 'dinner' },
  ],
  tags: [
    { id: 'tag-beef', name: 'Beef', slug: 'beef' },
    { id: 'tag-washoku', name: 'Washoku', slug: 'washoku' },
    { id: 'tag-nabe', name: 'Nabe', slug: 'nabe' },
  ],
  recipeIngredient: [
    { referenceId: 'ing-1', title: 'Beef', quantity: '400', unit: 'g', note: 'Thinly sliced ribeye or chuck' },
    { referenceId: 'ing-2', title: 'Napa Cabbage', quantity: '1/2', unit: 'head', note: 'Cut into bite-sized pieces' },
    { referenceId: 'ing-3', title: 'Shiitake Mushrooms', quantity: '8', unit: 'pieces', note: 'Stems removed, caps sliced' },
    { referenceId: 'ing-4', title: 'Tofu', quantity: '1', unit: 'block', note: 'Firm tofu, cut into cubes and lightly seared' },
    { referenceId: 'ing-5', title: 'Soy Sauce', quantity: '100', unit: 'ml', note: 'Japanese dark soy sauce' },
    { referenceId: 'ing-6', title: 'Mirin', quantity: '100', unit: 'ml', note: 'Sweet cooking wine' },
    { referenceId: 'ing-7', title: 'Sugar', quantity: '3', unit: 'tbsp', note: 'Granulated sugar' },
    { referenceId: 'ing-8', title: 'Cooking Oil or Beef Tallow', quantity: '1', unit: 'tbsp', note: 'For pot' },
  ],
  recipeInstructions: [
    // Prep Phase (5 tasks)
    { id: 'inst-prep-1', text: 'Slice beef.', ingredientReferences: ['ing-1'] },
    { id: 'inst-prep-2', text: 'Cut napa cabbage.', ingredientReferences: ['ing-2'] },
    { id: 'inst-prep-3', text: 'Slice shiitake mushrooms.', ingredientReferences: ['ing-3'] },
    { id: 'inst-prep-4', text: 'Prepare tofu.', ingredientReferences: ['ing-4'] },
    { id: 'inst-prep-5', text: 'Arrange ingredients on serving platter.', ingredientReferences: ['ing-1', 'ing-2', 'ing-3', 'ing-4'] },
    
    // Sauce Phase (4 tasks)
    { id: 'inst-sauce-1', text: 'Combine soy sauce in bowl.', ingredientReferences: ['ing-5'] },
    { id: 'inst-sauce-2', text: 'Add mirin.', ingredientReferences: ['ing-6'] },
    { id: 'inst-sauce-3', text: 'Add sugar.', ingredientReferences: ['ing-7'] },
    { id: 'inst-sauce-4', text: 'Mix until dissolved.', ingredientReferences: ['ing-5', 'ing-6', 'ing-7'] },

    // Cooking Phase (6 tasks)
    { id: 'inst-cook-1', text: 'Heat the cooking pot with oil or tallow.', ingredientReferences: ['ing-8'] },
    { id: 'inst-cook-2', text: 'Cook beef until lightly browned.', ingredientReferences: ['ing-1'] },
    { id: 'inst-cook-3', text: 'Add vegetables to pot.', ingredientReferences: ['ing-2', 'ing-3'] },
    { id: 'inst-cook-4', text: 'Add tofu to pot.', ingredientReferences: ['ing-4'] },
    { id: 'inst-cook-5', text: 'Add sauce over beef and vegetables.', ingredientReferences: ['ing-5', 'ing-6', 'ing-7'] },
    { id: 'inst-cook-6', text: 'Simmer and finish.', ingredientReferences: [] },
  ],
};
