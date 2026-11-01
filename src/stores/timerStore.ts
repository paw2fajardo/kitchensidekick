import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StageTimer } from '../types/workflow';

interface TimerStoreState {
  activeTimers: Record<string, StageTimer>;
  // Actions
  setTimer: (timer: StageTimer) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  tickTimer: (id: string) => void;
  extendTimer: (id: string, additionalSeconds: number) => void;
  resetTimer: (id: string) => void;
  advanceStage: (id: string, nextStageName: string, nextDurationSeconds: number) => void;
  clearTimer: (id: string) => void;
  clearAllTimers: () => void;
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    (set, get) => ({
      activeTimers: {},

      setTimer: (timer) => {
        set({
          activeTimers: {
            ...get().activeTimers,
            [timer.id]: timer,
          },
        });
      },

      startTimer: (id) => {
        const timer = get().activeTimers[id];
        if (!timer) return;
        set({
          activeTimers: {
            ...get().activeTimers,
            [id]: {
              ...timer,
              isRunning: true,
              isPaused: false,
            },
          },
        });
      },

      pauseTimer: (id) => {
        const timer = get().activeTimers[id];
        if (!timer) return;
        set({
          activeTimers: {
            ...get().activeTimers,
            [id]: {
              ...timer,
              isRunning: false,
              isPaused: true,
            },
          },
        });
      },

      tickTimer: (id) => {
        const timer = get().activeTimers[id];
        if (!timer || !timer.isRunning || timer.isPaused) return;

        // When reaching 00:00 or beyond, transition to overtime counting up
        if (timer.remainingSeconds <= 0) {
          set({
            activeTimers: {
              ...get().activeTimers,
              [id]: {
                ...timer,
                remainingSeconds: timer.remainingSeconds - 1, // -1, -2, -3... (overtime seconds)
                isCompleted: true,
                isOvertime: true,
              },
            },
          });
        } else if (timer.remainingSeconds === 1) {
          set({
            activeTimers: {
              ...get().activeTimers,
              [id]: {
                ...timer,
                remainingSeconds: 0,
                isCompleted: true,
                isOvertime: true,
              },
            },
          });
        } else {
          set({
            activeTimers: {
              ...get().activeTimers,
              [id]: {
                ...timer,
                remainingSeconds: timer.remainingSeconds - 1,
              },
            },
          });
        }
      },

      extendTimer: (id, additionalSeconds) => {
        const timer = get().activeTimers[id];
        if (!timer) return;
        set({
          activeTimers: {
            ...get().activeTimers,
            [id]: {
              ...timer,
              durationSeconds: timer.durationSeconds + additionalSeconds,
              remainingSeconds: Math.max(0, timer.remainingSeconds) + additionalSeconds,
              isCompleted: false,
              isOvertime: false,
            },
          },
        });
      },

      resetTimer: (id) => {
        const timer = get().activeTimers[id];
        if (!timer) return;
        set({
          activeTimers: {
            ...get().activeTimers,
            [id]: {
              ...timer,
              remainingSeconds: timer.durationSeconds,
              isRunning: false,
              isPaused: false,
              isCompleted: false,
              isOvertime: false,
            },
          },
        });
      },

      advanceStage: (id, nextStageName, nextDurationSeconds) => {
        const timer = get().activeTimers[id];
        if (!timer) return;
        set({
          activeTimers: {
            ...get().activeTimers,
            [id]: {
              ...timer,
              stageName: nextStageName,
              durationSeconds: nextDurationSeconds,
              remainingSeconds: nextDurationSeconds,
              currentStageIndex: timer.currentStageIndex + 1,
              isRunning: false,
              isPaused: false,
              isCompleted: false,
            },
          },
        });
      },

      clearTimer: (id) => {
        const current = { ...get().activeTimers };
        delete current[id];
        set({ activeTimers: current });
      },

      clearAllTimers: () => {
        set({ activeTimers: {} });
      },
    }),
    {
      name: 'kitchensidekick_active_timers',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
