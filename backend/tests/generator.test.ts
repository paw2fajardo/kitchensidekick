import { describe, it, expect } from 'vitest';
import { RecipeNormalizer } from '../src/normalizer/normalizer.js';
import { WorkflowGenerator } from '../src/workflow/generator.js';
import { canonicalSukiyakiMealieRecipe } from '../src/workflow/fixtures/sukiyaki.js';

describe('Deterministic Workflow Generator (BE-03)', () => {
  it('deterministically generates semantic phases for Sukiyaki (Preparation, Sauce / Seasoning, Active Cooking)', () => {
    const ast = RecipeNormalizer.normalize(canonicalSukiyakiMealieRecipe);
    const proposal = WorkflowGenerator.generateProposal(ast);

    expect(proposal.title).toBe('Sukiyaki');
    expect(proposal.phases.length).toBe(3);

    const [prepPhase, saucePhase, cookingPhase] = proposal.phases;

    expect(prepPhase.name).toBe('Preparation');
    expect(prepPhase.colorToken).toBe('#245C43');
    expect(prepPhase.tasks.length).toBe(5);

    expect(saucePhase.name).toBe('Sauce / Seasoning');
    expect(saucePhase.colorToken).toBe('#B17A3D');
    expect(saucePhase.tasks.length).toBe(4);

    expect(cookingPhase.name).toBe('Active Cooking');
    expect(cookingPhase.colorToken).toBe('#A65B45');
    expect(cookingPhase.tasks.length).toBe(6);
  });

  it('generates the canonical task count and wires prerequisites correctly', () => {
    const ast = RecipeNormalizer.normalize(canonicalSukiyakiMealieRecipe);
    const proposal = WorkflowGenerator.generateProposal(ast);

    const prep = proposal.phases.find(p => p.name === 'Preparation')!;
    const sauce = proposal.phases.find(p => p.name === 'Sauce / Seasoning')!;
    const cooking = proposal.phases.find(p => p.name === 'Active Cooking')!;

    // Arrange ingredients (last prep task) requires previous prep tasks
    const arrangeTask = prep.tasks.find(t => t.instruction.includes('Arrange'))!;
    expect(arrangeTask.prerequisiteInstructionIds).toEqual([
      'inst-prep-1',
      'inst-prep-2',
      'inst-prep-3',
      'inst-prep-4',
    ]);

    // Sauce mixing task requires earlier sauce ingredients
    const mixSauceTask = sauce.tasks.find(t => t.instruction.includes('Mix'))!;
    expect(mixSauceTask.prerequisiteInstructionIds).toEqual([
      'inst-sauce-1',
      'inst-sauce-2',
      'inst-sauce-3',
    ]);

    // Cooking "Add sauce" task requires sauce phase completion ('inst-sauce-4')
    const addSauceTask = cooking.tasks.find(t => t.instruction.includes('Add sauce'))!;
    expect(addSauceTask.prerequisiteInstructionIds).toContain('inst-sauce-4');

    // Cooking "Add vegetables" task requires prep completion ('inst-prep-5')
    const addVegTask = cooking.tasks.find(t => t.instruction.includes('Add vegetables'))!;
    expect(addVegTask.prerequisiteInstructionIds).toContain('inst-prep-5');

    // Cooking "Simmer and finish" requires preceding cooking step
    const finishTask = cooking.tasks.find(t => t.instruction.includes('Simmer and finish'))!;
    expect(finishTask.prerequisiteInstructionIds).toContain('inst-cook-5');
  });

  it('handles recipes without a sauce phase cleanly', () => {
    const simpleAst = {
      mealieRecipeId: 'simple-toast-1',
      slug: 'toast',
      title: 'Simple Buttered Toast',
      description: null,
      yield: '1 slice',
      totalTimeMinutes: 5,
      ingredients: [{ id: 'ing-1', name: 'Bread', quantity: '1', unit: 'slice', preparationNote: null, originalDisplay: '1 slice bread' }],
      instructions: [
        { id: 'inst-1', title: 'Slice bread', text: 'Slice bread carefully.', ingredientReferences: ['ing-1'], estimatedSeconds: 30, sortOrder: 1 },
        { id: 'inst-2', title: 'Toast', text: 'Toast in toaster oven.', ingredientReferences: [], estimatedSeconds: 120, sortOrder: 2 },
      ],
    };

    const proposal = WorkflowGenerator.generateProposal(simpleAst);
    expect(proposal.phases.length).toBe(2);
    expect(proposal.phases.map(p => p.name)).toEqual(['Preparation', 'Active Cooking']);
  });

  it('associates ingredients with corresponding tasks', () => {
    const ast = RecipeNormalizer.normalize(canonicalSukiyakiMealieRecipe);
    const proposal = WorkflowGenerator.generateProposal(ast);

    const prep = proposal.phases.find(p => p.name === 'Preparation')!;
    const sliceBeef = prep.tasks.find(t => t.instruction.includes('Slice beef'))!;
    expect(sliceBeef.ingredientNames).toContain('Beef');
  });
});
