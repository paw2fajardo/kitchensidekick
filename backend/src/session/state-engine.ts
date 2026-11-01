import {
  FullSessionView,
  FullWorkflow,
  TaskCompletionEvent,
  TaskProgressRecord,
  TaskStatus,
} from '../repository/types.js';

export interface ComputeStatusOptions {
  workflow: FullWorkflow;
  currentProgress: TaskProgressRecord[];
}

export class SessionStateEngine {
  /**
   * Computes reactive status for each task based on prerequisites.
   * Rules:
   * 1. If explicit status in progress is 'completed', it remains 'completed'.
   * 2. If explicit status is 'in_progress', it remains 'in_progress'.
   * 3. If any prerequisite task is NOT 'completed', status becomes 'blocked'.
   * 4. If all prerequisites are 'completed' (or no prerequisites exist), status becomes 'ready'.
   */
  public static computeTaskStatuses(options: ComputeStatusOptions): Map<string, TaskStatus> {
    const { workflow, currentProgress } = options;

    const progressMap = new Map<string, TaskProgressRecord>();
    for (const prog of currentProgress) {
      progressMap.set(prog.taskId, prog);
    }

    // Build prerequisite map: taskId -> prerequisiteTaskIds[]
    const prereqMap = new Map<string, string[]>();
    for (const phase of workflow.phases) {
      for (const task of phase.tasks) {
        prereqMap.set(task.id, task.prerequisites);
      }
    }

    const computedStatuses = new Map<string, TaskStatus>();

    // Initial pass: mark explicitly completed and in_progress tasks
    for (const phase of workflow.phases) {
      for (const task of phase.tasks) {
        const prog = progressMap.get(task.id);
        if (prog && prog.status === 'completed') {
          computedStatuses.set(task.id, 'completed');
        } else if (prog && prog.status === 'in_progress') {
          computedStatuses.set(task.id, 'in_progress');
        }
      }
    }

    // Secondary pass: compute 'blocked' vs 'ready' for tasks not completed or in-progress
    for (const phase of workflow.phases) {
      for (const task of phase.tasks) {
        if (computedStatuses.has(task.id)) {
          continue; // Already completed or in-progress
        }

        const prereqs = prereqMap.get(task.id) || [];
        if (prereqs.length === 0) {
          computedStatuses.set(task.id, 'ready');
        } else {
          // Check if all prerequisites are completed
          const allCompleted = prereqs.every(
            (prereqId) => computedStatuses.get(prereqId) === 'completed'
          );
          computedStatuses.set(task.id, allCompleted ? 'ready' : 'blocked');
        }
      }
    }

    return computedStatuses;
  }

  /**
   * Build complete FullSessionView including calculated progress and status badges.
   */
  public static buildSessionView(
    session: any,
    workflow: FullWorkflow,
    progressList: TaskProgressRecord[]
  ): FullSessionView {
    const computedStatuses = this.computeTaskStatuses({
      workflow,
      currentProgress: progressList,
    });

    const progressByTaskId = new Map<string, TaskProgressRecord>();
    for (const p of progressList) {
      progressByTaskId.set(p.taskId, p);
    }

    let totalTasks = 0;
    let completedTasks = 0;

    const phasesView = workflow.phases.map((phase) => {
      const tasksView = phase.tasks.map((task) => {
        totalTasks++;
        const status = computedStatuses.get(task.id) || 'not_started';
        if (status === 'completed') {
          completedTasks++;
        }

        const prog = progressByTaskId.get(task.id);

        return {
          id: task.id,
          title: task.title,
          instruction: task.instruction,
          estimatedSeconds: task.estimatedSeconds ?? null,
          sortOrder: task.sortOrder,
          prerequisiteTaskIds: task.prerequisites,
          status,
          completedAt: prog?.completedAt ?? null,
          ingredients: task.ingredients.map((ing) => ({
            ingredientName: ing.ingredientName,
            quantity: ing.quantity ?? null,
            unit: ing.unit ?? null,
            preparationNote: ing.preparationNote ?? null,
          })),
        };
      });

      return {
        id: phase.id,
        name: phase.name,
        sortOrder: phase.sortOrder,
        colorToken: phase.colorToken,
        tasks: tasksView,
      };
    });

    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      session,
      workflow: workflow.workflow,
      phases: phasesView,
      overallProgress: {
        totalTasks,
        completedTasks,
        percentage,
      },
    };
  }

  /**
   * BE-07: Offline Event-Merge Reconciler
   * Reconciles offline events idempotently and avoids race condition regressions:
   * - Completing a task is monotonic: if already marked completed earlier, later completedAt doesn't undo it.
   * - If an event has a newer completedAt timestamp, it wins.
   * - Never reverts a 'completed' task to 'ready' or 'blocked' unless explicitly forced with a newer event timestamp.
   */
  public static reconcileEvents(
    existingProgress: TaskProgressRecord[],
    incomingEvents: TaskCompletionEvent[]
  ): TaskCompletionEvent[] {
    const existingMap = new Map<string, TaskProgressRecord>();
    for (const p of existingProgress) {
      existingMap.set(p.taskId, p);
    }

    // Sort incoming events chronologically if timestamps provided
    const sortedEvents = [...incomingEvents].sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeA - timeB;
    });

    const reconciled: TaskCompletionEvent[] = [];

    for (const evt of sortedEvents) {
      const current = existingMap.get(evt.taskId);
      if (!current) {
        // New task progress record
        reconciled.push(evt);
        continue;
      }

      // Check monotonicity
      if (current.status === 'completed' && evt.status !== 'completed') {
        const currentTime = current.completedAt ? new Date(current.completedAt).getTime() : 0;
        const incomingTime = evt.completedAt ? new Date(evt.completedAt).getTime() : 0;
        // Only allow un-completing if incoming event timestamp is strictly newer
        if (incomingTime > currentTime) {
          reconciled.push(evt);
        }
      } else {
        reconciled.push(evt);
      }
    }

    return reconciled;
  }
}
