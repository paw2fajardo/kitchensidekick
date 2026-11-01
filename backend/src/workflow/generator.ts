import { RecipeAST, NormalizedInstruction } from '../normalizer/types.js';
import { RecipeWorkflowProposal, WorkflowPhaseProposal, WorkflowTaskProposal } from './types.js';

export class WorkflowGenerator {
  // Phase color tokens matching DESIGN.md
  private static readonly COLOR_TOKENS: Record<string, string> = {
    'Preparation': '#245C43',          // Hunter Green (or Prep)
    'Prep': '#245C43',
    'Sauce / Seasoning': '#B17A3D',    // Warm Ochre (or Sauce)
    'Sauce': '#B17A3D',
    'Active Cooking': '#A65B45',       // Terracotta / Crimson (or Cooking)
    'Cooking': '#A65B45',
    'Finishing / Plating': '#287A4B',  // Forest Green
    'Finishing': '#287A4B',
  };

  /**
   * Determine the most suitable semantic phase for an instruction based on keywords.
   */
  public static classifyPhase(
    instructionText: string,
    instructionTitle?: string | null
  ): 'Preparation' | 'Sauce / Seasoning' | 'Active Cooking' | 'Finishing / Plating' {
    const text = `${instructionTitle || ''} ${instructionText}`.toLowerCase();

    // Check Finishing / Plating
    const finishingKeywords = [
      'garnish', 'plate', 'serve', 'dish up', 'sprinkle over', 'drizzle over', 'transfer to plate'
    ];
    if (finishingKeywords.some((kw) => text.includes(kw)) && !text.includes('pot') && !text.includes('simmer')) {
      return 'Finishing / Plating';
    }

    // Check Active Cooking phase (especially actions happening in pan/pot or heat operations)
    const cookingKeywords = [
      'heat', 'cook', 'sear', 'fry', 'saute', 'sauté', 'simmer', 'boil', 'bake',
      'roast', 'grill', 'brown', 'pot', 'pan', 'skillet', 'oven', 'finish',
      'add sauce over', 'pour sauce over', 'add sauce to pot',
    ];
    if (cookingKeywords.some((kw) => text.includes(kw))) {
      return 'Active Cooking';
    }

    // Check Sauce / Seasoning phase: if it mentions sauce or sauce components/mixing (and not cooking pot/pan)
    const sauceKeywords = ['sauce', 'mirin', 'soy sauce', 'sugar', 'dressing', 'marinade', 'whisk', 'dissolve', 'combine soy'];
    if (sauceKeywords.some((kw) => text.includes(kw))) {
      return 'Sauce / Seasoning';
    }

    // Default to Preparation
    return 'Preparation';
  }

  /**
   * Create a concise human-readable task title from the instruction.
   */
  public static deriveTaskTitle(inst: NormalizedInstruction): string {
    if (inst.title && inst.title.trim()) {
      return inst.title.trim();
    }
    const clean = inst.text.trim();
    const firstSentence = clean.split(/[.\n]/)[0].trim();
    if (firstSentence.length <= 40) {
      return firstSentence;
    }
    // Truncate cleanly
    return `${firstSentence.substring(0, 37)}...`;
  }

  /**
   * Propose workflow phases, task groupings, and deterministic prerequisites.
   */
  public static generateProposal(ast: RecipeAST): RecipeWorkflowProposal {
    // 1. Group instructions into phases
    const prepTasks: WorkflowTaskProposal[] = [];
    const sauceTasks: WorkflowTaskProposal[] = [];
    const cookingTasks: WorkflowTaskProposal[] = [];
    const finishingTasks: WorkflowTaskProposal[] = [];

    // Map ingredients by ID and Name for lookup
    const ingredientMap = new Map<string, string>();
    for (const ing of ast.ingredients) {
      ingredientMap.set(ing.id, ing.name);
    }

    // We will track the final tasks of each phase to wire prerequisites
    for (const inst of ast.instructions) {
      const phase = this.classifyPhase(inst.text, inst.title);
      const title = this.deriveTaskTitle(inst);

      // Resolve ingredient names
      const ingredientNames: string[] = [];
      for (const ref of inst.ingredientReferences) {
        const found = ingredientMap.get(ref);
        if (found) {
          ingredientNames.push(found);
        }
      }

      // Also match ingredient names found in text
      for (const ing of ast.ingredients) {
        if (!ingredientNames.includes(ing.name) && inst.text.toLowerCase().includes(ing.name.toLowerCase())) {
          ingredientNames.push(ing.name);
        }
      }

      const task: WorkflowTaskProposal = {
        mealieInstructionId: inst.id,
        title,
        instruction: inst.text,
        estimatedSeconds: inst.estimatedSeconds,
        sortOrder: inst.sortOrder,
        prerequisiteInstructionIds: [],
        ingredientNames,
      };

      if (phase === 'Preparation') {
        prepTasks.push(task);
      } else if (phase === 'Sauce / Seasoning') {
        sauceTasks.push(task);
      } else if (phase === 'Active Cooking') {
        cookingTasks.push(task);
      } else {
        finishingTasks.push(task);
      }
    }

    // Deterministic prerequisite wiring:
    // 1. Within Prep: Arranging tasks or final prep tasks depend on earlier slicing/cutting tasks.
    for (let i = 0; i < prepTasks.length; i++) {
      const task = prepTasks[i];
      if (task.instruction.toLowerCase().includes('arrange') || (i === prepTasks.length - 1 && prepTasks.length > 1)) {
        // Depends on all previous prep tasks
        task.prerequisiteInstructionIds = prepTasks.slice(0, i).map(t => t.mealieInstructionId);
      }
    }

    // 2. Within Sauce: Mixing/dissolving depends on combining earlier ingredients
    for (let i = 0; i < sauceTasks.length; i++) {
      const task = sauceTasks[i];
      if (task.instruction.toLowerCase().includes('mix') || task.instruction.toLowerCase().includes('whisk') || (i === sauceTasks.length - 1 && sauceTasks.length > 1)) {
        task.prerequisiteInstructionIds = sauceTasks.slice(0, i).map(t => t.mealieInstructionId);
      }
    }

    // 3. Cooking Phase:
    // - Cooking tasks that use ingredients prepared in Prep or Sauce depend on them.
    // - The initial heating/pot step is prerequisite for cooking beef or sauteing.
    // - "Add sauce" depends on the final sauce task (if sauce phase exists).
    // - "Simmer and finish" depends on earlier cooking steps.
    const lastPrepTaskId = prepTasks.length > 0 ? prepTasks[prepTasks.length - 1].mealieInstructionId : null;
    const lastSauceTaskId = sauceTasks.length > 0 ? sauceTasks[sauceTasks.length - 1].mealieInstructionId : null;

    for (let i = 0; i < cookingTasks.length; i++) {
      const task = cookingTasks[i];
      const lower = task.instruction.toLowerCase();

      if (i > 0) {
        // Cooking pot heating is prerequisite for subsequent cooking
        const heatTask = cookingTasks[0];
        if (i === 1) {
          task.prerequisiteInstructionIds.push(heatTask.mealieInstructionId);
        }
      }

      if (lower.includes('add sauce') || lower.includes('pour sauce')) {
        if (lastSauceTaskId && !task.prerequisiteInstructionIds.includes(lastSauceTaskId)) {
          task.prerequisiteInstructionIds.push(lastSauceTaskId);
        }
      }

      if (lower.includes('add vegetable') || lower.includes('add tofu') || lower.includes('cook beef')) {
        if (lastPrepTaskId && !task.prerequisiteInstructionIds.includes(lastPrepTaskId)) {
          task.prerequisiteInstructionIds.push(lastPrepTaskId);
        }
      }

      if (lower.includes('simmer') || lower.includes('finish') || i === cookingTasks.length - 1) {
        // Final finish depends on immediate preceding cooking step
        if (i > 0) {
          const prevTask = cookingTasks[i - 1];
          if (!task.prerequisiteInstructionIds.includes(prevTask.mealieInstructionId)) {
            task.prerequisiteInstructionIds.push(prevTask.mealieInstructionId);
          }
        }
      }
    }

    // 4. Finishing / Plating Phase:
    // Finishing tasks depend on the last cooking task (or last prep task if no cooking)
    const lastCookingTaskId = cookingTasks.length > 0
      ? cookingTasks[cookingTasks.length - 1].mealieInstructionId
      : lastPrepTaskId;
    for (const task of finishingTasks) {
      if (lastCookingTaskId && !task.prerequisiteInstructionIds.includes(lastCookingTaskId)) {
        task.prerequisiteInstructionIds.push(lastCookingTaskId);
      }
    }

    // Build phases list dynamically (omits empty phases such as Sauce when absent)
    const phases: WorkflowPhaseProposal[] = [];
    let phaseOrder = 1;

    if (prepTasks.length > 0) {
      phases.push({
        name: 'Preparation',
        sortOrder: phaseOrder++,
        colorToken: this.COLOR_TOKENS['Preparation'],
        tasks: prepTasks,
      });
    }

    if (sauceTasks.length > 0) {
      phases.push({
        name: 'Sauce / Seasoning',
        sortOrder: phaseOrder++,
        colorToken: this.COLOR_TOKENS['Sauce / Seasoning'],
        tasks: sauceTasks,
      });
    }

    if (cookingTasks.length > 0) {
      phases.push({
        name: 'Active Cooking',
        sortOrder: phaseOrder++,
        colorToken: this.COLOR_TOKENS['Active Cooking'],
        tasks: cookingTasks,
      });
    }

    if (finishingTasks.length > 0) {
      phases.push({
        name: 'Finishing / Plating',
        sortOrder: phaseOrder++,
        colorToken: this.COLOR_TOKENS['Finishing / Plating'],
        tasks: finishingTasks,
      });
    }

    const totalTasks = prepTasks.length + sauceTasks.length + cookingTasks.length + finishingTasks.length;

    return {
      mealieRecipeId: ast.mealieRecipeId,
      title: ast.title,
      totalTasks,
      phases,
    };
  }
}
