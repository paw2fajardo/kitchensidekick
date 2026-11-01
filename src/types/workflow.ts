export * from '../../backend/src/workflow/types';
export * from '../../backend/src/normalizer/types';

// Client session and store specific interfaces extending backend contracts
export type ClientTaskStatus = 'pending' | 'ready' | 'in_progress' | 'blocked' | 'completed';

export interface TaskState {
  taskId: string;
  status: ClientTaskStatus;
  startedAt: string | null;
  completedAt: string | null;
  notes?: string;
}

export interface CookingSessionState {
  sessionId: string;
  workflowId: string;
  recipeTitle: string;
  startedAt: string;
  completedAt: string | null;
  activeTaskId: string | null;
  taskStates: Record<string, TaskState>;
}

export interface StageTimer {
  id: string;
  taskId: string;
  stageName: string;
  durationSeconds: number;
  remainingSeconds: number; // Positive when counting down; negative when counting up in overtime
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isOvertime: boolean;
  totalStages: number;
  currentStageIndex: number;
}
