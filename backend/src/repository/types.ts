export type TaskStatus = 'not_started' | 'ready' | 'in_progress' | 'blocked' | 'completed';
export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface WorkflowRecord {
  id: string;
  mealieRecipeId: string;
  title: string;
  totalTasks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhaseRecord {
  id: string;
  workflowId: string;
  name: string;
  sortOrder: number;
  colorToken: string;
}

export interface TaskRecord {
  id: string;
  phaseId: string;
  mealieInstructionId?: string | null;
  title: string;
  instruction: string;
  estimatedSeconds?: number | null;
  sortOrder: number;
}

export interface PrerequisiteRecord {
  id: string;
  taskId: string;
  prerequisiteTaskId: string;
}

export interface IngredientMappingRecord {
  id: string;
  taskId: string;
  ingredientName: string;
  quantity?: string | null;
  unit?: string | null;
  preparationNote?: string | null;
}

export interface FullWorkflow {
  workflow: WorkflowRecord;
  phases: (PhaseRecord & {
    tasks: (TaskRecord & {
      prerequisites: string[]; // array of prerequisite task IDs
      ingredients: IngredientMappingRecord[];
    })[];
  })[];
}

export interface SessionRecord {
  id: string;
  workflowId: string;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date | null;
}

export interface TaskProgressRecord {
  id: string;
  sessionId: string;
  taskId: string;
  status: TaskStatus;
  completedAt?: Date | null;
}

export interface FullSessionView {
  session: SessionRecord;
  workflow: WorkflowRecord;
  phases: {
    id: string;
    name: string;
    sortOrder: number;
    colorToken: string;
    tasks: {
      id: string;
      title: string;
      instruction: string;
      estimatedSeconds: number | null;
      sortOrder: number;
      prerequisiteTaskIds: string[];
      status: TaskStatus;
      completedAt: Date | null;
      ingredients: {
        ingredientName: string;
        quantity: string | null;
        unit: string | null;
        preparationNote: string | null;
      }[];
    }[];
  }[];
  overallProgress: {
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  };
}

export interface TaskCompletionEvent {
  taskId: string;
  status: TaskStatus;
  completedAt?: string | Date | null;
}

export interface IWorkflowRepository {
  createWorkflow(workflow: WorkflowRecord, phases: PhaseRecord[], tasks: TaskRecord[], prereqs: PrerequisiteRecord[], ingredients: IngredientMappingRecord[]): Promise<FullWorkflow>;
  getWorkflowById(id: string): Promise<FullWorkflow | null>;
  getWorkflowByMealieId(mealieRecipeId: string): Promise<FullWorkflow | null>;
  updateWorkflow(id: string, updates: Partial<WorkflowRecord>, phases?: PhaseRecord[], tasks?: TaskRecord[], prereqs?: PrerequisiteRecord[]): Promise<FullWorkflow | null>;
  deleteWorkflow(id: string): Promise<boolean>;

  createSession(session: SessionRecord, progressList: TaskProgressRecord[]): Promise<SessionRecord>;
  getSessionById(id: string): Promise<SessionRecord | null>;
  getSessionProgress(sessionId: string): Promise<TaskProgressRecord[]>;
  updateTaskProgress(sessionId: string, taskId: string, status: TaskStatus, completedAt?: Date | null): Promise<TaskProgressRecord | null>;
  batchUpdateTaskProgress(sessionId: string, events: TaskCompletionEvent[]): Promise<TaskProgressRecord[]>;
}
