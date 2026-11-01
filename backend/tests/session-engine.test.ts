import { describe, it, expect } from 'vitest';
import { SessionStateEngine } from '../src/session/state-engine.js';
import { FullWorkflow, TaskProgressRecord } from '../src/repository/types.js';

describe('SessionStateEngine (BE-06 & BE-07)', () => {
  const dummyWorkflow: FullWorkflow = {
    workflow: {
      id: 'wf-1',
      mealieRecipeId: 'rec-1',
      title: 'Sukiyaki',
      totalTasks: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    phases: [
      {
        id: 'phase-1',
        workflowId: 'wf-1',
        name: 'Prep',
        sortOrder: 1,
        colorToken: '#245C43',
        tasks: [
          {
            id: 'task-prep-1',
            phaseId: 'phase-1',
            title: 'Slice Beef',
            instruction: 'Slice beef',
            sortOrder: 1,
            prerequisites: [],
            ingredients: [],
          },
          {
            id: 'task-prep-2',
            phaseId: 'phase-1',
            title: 'Cut Cabbage',
            instruction: 'Cut cabbage',
            sortOrder: 2,
            prerequisites: ['task-prep-1'],
            ingredients: [],
          },
          {
            id: 'task-cook-1',
            phaseId: 'phase-1',
            title: 'Cook in pot',
            instruction: 'Cook in pot',
            sortOrder: 3,
            prerequisites: ['task-prep-2'],
            ingredients: [],
          },
        ],
      },
    ],
  };

  it('calculates initial task states: tasks without prereqs are Ready, others Blocked', () => {
    const progress: TaskProgressRecord[] = [
      { id: 'p1', sessionId: 's1', taskId: 'task-prep-1', status: 'not_started' },
      { id: 'p2', sessionId: 's1', taskId: 'task-prep-2', status: 'not_started' },
      { id: 'p3', sessionId: 's1', taskId: 'task-cook-1', status: 'not_started' },
    ];

    const statuses = SessionStateEngine.computeTaskStatuses({
      workflow: dummyWorkflow,
      currentProgress: progress,
    });

    expect(statuses.get('task-prep-1')).toBe('ready');
    expect(statuses.get('task-prep-2')).toBe('blocked');
    expect(statuses.get('task-cook-1')).toBe('blocked');
  });

  it('unblocks dependent task when prerequisite completes, and re-locks on rollback', () => {
    // 1. Initially completed -> downstream unblocked
    const progress: TaskProgressRecord[] = [
      { id: 'p1', sessionId: 's1', taskId: 'task-prep-1', status: 'completed', completedAt: new Date() },
      { id: 'p2', sessionId: 's1', taskId: 'task-prep-2', status: 'not_started' },
      { id: 'p3', sessionId: 's1', taskId: 'task-cook-1', status: 'not_started' },
    ];

    const statuses = SessionStateEngine.computeTaskStatuses({
      workflow: dummyWorkflow,
      currentProgress: progress,
    });

    expect(statuses.get('task-prep-1')).toBe('completed');
    expect(statuses.get('task-prep-2')).toBe('ready'); // Unblocked!
    expect(statuses.get('task-cook-1')).toBe('blocked');

    // 2. Rollback task-prep-1 back to 'ready' -> downstream task-prep-2 should re-lock to 'blocked'
    const rolledBackProgress: TaskProgressRecord[] = [
      { id: 'p1', sessionId: 's1', taskId: 'task-prep-1', status: 'ready', completedAt: null },
      { id: 'p2', sessionId: 's1', taskId: 'task-prep-2', status: 'not_started' },
      { id: 'p3', sessionId: 's1', taskId: 'task-cook-1', status: 'not_started' },
    ];

    const rolledBackStatuses = SessionStateEngine.computeTaskStatuses({
      workflow: dummyWorkflow,
      currentProgress: rolledBackProgress,
    });

    expect(rolledBackStatuses.get('task-prep-1')).toBe('ready');
    expect(rolledBackStatuses.get('task-prep-2')).toBe('blocked'); // Re-locked!
    expect(rolledBackStatuses.get('task-cook-1')).toBe('blocked');
  });

  it('BE-07: reconciles offline events idempotently and preserves newer timestamps', () => {
    const now = new Date();
    const older = new Date(now.getTime() - 10000);
    const existingProgress: TaskProgressRecord[] = [
      { id: 'p1', sessionId: 's1', taskId: 'task-prep-1', status: 'completed', completedAt: now },
    ];

    // Attempting to revert 'completed' with an older event should be ignored
    const staleEvent = [
      { taskId: 'task-prep-1', status: 'ready' as const, completedAt: older.toISOString() },
    ];

    const reconciled = SessionStateEngine.reconcileEvents(existingProgress, staleEvent);
    expect(reconciled.length).toBe(0); // rejected older regression

    // Valid forward progress event
    const forwardEvent = [
      { taskId: 'task-prep-2', status: 'completed' as const, completedAt: now.toISOString() },
    ];
    const reconciled2 = SessionStateEngine.reconcileEvents(existingProgress, forwardEvent);
    expect(reconciled2.length).toBe(1);
    expect(reconciled2[0].taskId).toBe('task-prep-2');
  });
});
