import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './sessionStore';
import { useTimerStore } from './timerStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearSession();
  });

  it('initializes a cooking session with pending task states', () => {
    useSessionStore.getState().initSession({
      sessionId: 'session-123',
      workflowId: 'workflow-456',
      recipeTitle: 'Sukiyaki',
      initialTaskIds: ['task-1', 'task-2'],
    });

    const session = useSessionStore.getState().currentSession;
    expect(session).not.toBeNull();
    expect(session?.sessionId).toBe('session-123');
    expect(session?.recipeTitle).toBe('Sukiyaki');
    expect(session?.activeTaskId).toBe('task-1');
    expect(session?.taskStates['task-1']?.status).toBe('pending');
    expect(session?.taskStates['task-2']?.status).toBe('pending');
  });

  it('updates task status and records timestamps', () => {
    useSessionStore.getState().initSession({
      sessionId: 'session-123',
      workflowId: 'workflow-456',
      recipeTitle: 'Sukiyaki',
      initialTaskIds: ['task-1'],
    });

    useSessionStore.getState().updateTaskStatus('task-1', 'in_progress');
    let task = useSessionStore.getState().currentSession?.taskStates['task-1'];
    expect(task?.status).toBe('in_progress');
    expect(task?.startedAt).toBeTruthy();
    expect(task?.completedAt).toBeNull();

    useSessionStore.getState().completeTask('task-1');
    task = useSessionStore.getState().currentSession?.taskStates['task-1'];
    expect(task?.status).toBe('completed');
    expect(task?.completedAt).toBeTruthy();
  });
});

describe('useTimerStore', () => {
  beforeEach(() => {
    useTimerStore.getState().clearTimer('timer-1');
  });

  it('manages timer countdown, pausing, and extension', () => {
    useTimerStore.getState().setTimer({
      id: 'timer-1',
      taskId: 'task-1',
      stageName: 'Side A Sear',
      durationSeconds: 120,
      remainingSeconds: 120,
      isRunning: false,
      isPaused: false,
      isCompleted: false,
      isOvertime: false,
      totalStages: 2,
      currentStageIndex: 1,
    });

    useTimerStore.getState().startTimer('timer-1');
    expect(useTimerStore.getState().activeTimers['timer-1']?.isRunning).toBe(true);

    useTimerStore.getState().tickTimer('timer-1');
    expect(useTimerStore.getState().activeTimers['timer-1']?.remainingSeconds).toBe(119);

    useTimerStore.getState().extendTimer('timer-1', 30);
    expect(useTimerStore.getState().activeTimers['timer-1']?.remainingSeconds).toBe(149);

    useTimerStore.getState().pauseTimer('timer-1');
    expect(useTimerStore.getState().activeTimers['timer-1']?.isPaused).toBe(true);
    expect(useTimerStore.getState().activeTimers['timer-1']?.isRunning).toBe(false);
  });
});
