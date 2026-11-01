import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ClientTaskStatus, CookingSessionState, TaskState } from '../types/workflow';

interface SessionStoreState {
  currentSession: CookingSessionState | null;
  lastCompletedTask: { taskId: string; previousStatus: ClientTaskStatus } | null;
  // Actions
  initSession: (session: {
    sessionId: string;
    workflowId: string;
    recipeTitle: string;
    initialTaskIds: string[];
  }) => void;
  setActiveTask: (taskId: string | null) => void;
  updateTaskStatus: (taskId: string, status: ClientTaskStatus) => void;
  completeTask: (taskId: string) => void;
  undoLastComplete: () => void;
  clearUndo: () => void;
  completeSession: () => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStoreState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      lastCompletedTask: null,

      initSession: ({ sessionId, workflowId, recipeTitle, initialTaskIds }) => {
        const initialTaskStates: Record<string, TaskState> = {};
        initialTaskIds.forEach((id) => {
          initialTaskStates[id] = {
            taskId: id,
            status: 'pending',
            startedAt: null,
            completedAt: null,
          };
        });

        set({
          currentSession: {
            sessionId,
            workflowId,
            recipeTitle,
            startedAt: new Date().toISOString(),
            completedAt: null,
            activeTaskId: initialTaskIds[0] ?? null,
            taskStates: initialTaskStates,
          },
        });
      },

      setActiveTask: (taskId) => {
        const session = get().currentSession;
        if (!session) return;
        set({
          currentSession: {
            ...session,
            activeTaskId: taskId,
          },
        });
      },

      updateTaskStatus: (taskId, status) => {
        const session = get().currentSession;
        if (!session) return;
        const currentTask = session.taskStates[taskId] || {
          taskId,
          status: 'pending',
          startedAt: null,
          completedAt: null,
        };

        const startedAt = status === 'in_progress' && !currentTask.startedAt 
          ? new Date().toISOString() 
          : currentTask.startedAt;
        const completedAt = status === 'completed' 
          ? new Date().toISOString() 
          : null;

        set({
          currentSession: {
            ...session,
            taskStates: {
              ...session.taskStates,
              [taskId]: {
                ...currentTask,
                status,
                startedAt,
                completedAt,
              },
            },
          },
        });
      },

      completeTask: (taskId) => {
        const session = get().currentSession;
        if (!session) return;
        const prevStatus = session.taskStates[taskId]?.status || 'pending';
        set({ lastCompletedTask: { taskId, previousStatus: prevStatus } });
        get().updateTaskStatus(taskId, 'completed');
      },

      undoLastComplete: () => {
        const last = get().lastCompletedTask;
        if (!last) return;
        get().updateTaskStatus(last.taskId, last.previousStatus);
        set({ lastCompletedTask: null });
      },

      clearUndo: () => {
        set({ lastCompletedTask: null });
      },

      completeSession: () => {
        const session = get().currentSession;
        if (!session) return;
        set({
          currentSession: {
            ...session,
            completedAt: new Date().toISOString(),
          },
        });
      },

      clearSession: () => {
        set({ currentSession: null });
      },
    }),
    {
      name: 'kitchensidekick_cooking_session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
