export interface WorkflowTaskProposal {
  mealieInstructionId: string;
  title: string;
  instruction: string;
  estimatedSeconds: number | null;
  sortOrder: number;
  prerequisiteInstructionIds: string[];
  ingredientNames: string[];
}

export interface WorkflowPhaseProposal {
  name: 'Prep' | 'Sauce' | 'Cooking' | string;
  sortOrder: number;
  colorToken: string;
  tasks: WorkflowTaskProposal[];
}

export interface RecipeWorkflowProposal {
  mealieRecipeId: string;
  title: string;
  totalTasks: number;
  phases: WorkflowPhaseProposal[];
}
