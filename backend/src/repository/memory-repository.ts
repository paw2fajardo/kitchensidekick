import {
  FullWorkflow,
  IWorkflowRepository,
  IngredientMappingRecord,
  PhaseRecord,
  PrerequisiteRecord,
  SessionRecord,
  TaskCompletionEvent,
  TaskProgressRecord,
  TaskRecord,
  TaskStatus,
  WorkflowRecord,
} from './types.js';

export class MemoryWorkflowRepository implements IWorkflowRepository {
  public workflows = new Map<string, WorkflowRecord>();
  public phases = new Map<string, PhaseRecord>();
  public tasks = new Map<string, TaskRecord>();
  public prerequisites = new Map<string, PrerequisiteRecord>();
  public ingredients = new Map<string, IngredientMappingRecord>();
  public sessions = new Map<string, SessionRecord>();
  public progress = new Map<string, TaskProgressRecord>();

  public async createWorkflow(
    workflow: WorkflowRecord,
    phases: PhaseRecord[],
    tasks: TaskRecord[],
    prereqs: PrerequisiteRecord[],
    ingredients: IngredientMappingRecord[]
  ): Promise<FullWorkflow> {
    this.workflows.set(workflow.id, { ...workflow });
    for (const p of phases) this.phases.set(p.id, { ...p });
    for (const t of tasks) this.tasks.set(t.id, { ...t });
    for (const r of prereqs) this.prerequisites.set(r.id, { ...r });
    for (const i of ingredients) this.ingredients.set(i.id, { ...i });

    const full = await this.getWorkflowById(workflow.id);
    return full!;
  }

  public async getWorkflowById(id: string): Promise<FullWorkflow | null> {
    const wf = this.workflows.get(id);
    if (!wf) return null;

    const wfPhases = Array.from(this.phases.values())
      .filter((p) => p.workflowId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const fullPhases = wfPhases.map((phase) => {
      const phaseTasks = Array.from(this.tasks.values())
        .filter((t) => t.phaseId === phase.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((task) => {
          const taskPrereqs = Array.from(this.prerequisites.values())
            .filter((pr) => pr.taskId === task.id)
            .map((pr) => pr.prerequisiteTaskId);

          const taskIngredients = Array.from(this.ingredients.values()).filter(
            (ing) => ing.taskId === task.id
          );

          return {
            ...task,
            prerequisites: taskPrereqs,
            ingredients: taskIngredients,
          };
        });

      return {
        ...phase,
        tasks: phaseTasks,
      };
    });

    return {
      workflow: { ...wf },
      phases: fullPhases,
    };
  }

  public async getWorkflowByMealieId(mealieRecipeId: string): Promise<FullWorkflow | null> {
    const wf = Array.from(this.workflows.values()).find(
      (w) => w.mealieRecipeId === mealieRecipeId
    );
    if (!wf) return null;
    return this.getWorkflowById(wf.id);
  }

  public async updateWorkflow(
    id: string,
    updates: Partial<WorkflowRecord>,
    phases?: PhaseRecord[],
    tasks?: TaskRecord[],
    prereqs?: PrerequisiteRecord[]
  ): Promise<FullWorkflow | null> {
    const existing = this.workflows.get(id);
    if (!existing) return null;

    this.workflows.set(id, {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    });

    if (phases) {
      // Clear old phases for this workflow
      const oldPhaseIds = Array.from(this.phases.values())
        .filter((p) => p.workflowId === id)
        .map((p) => p.id);
      for (const pid of oldPhaseIds) this.phases.delete(pid);
      for (const p of phases) this.phases.set(p.id, { ...p });
    }

    if (tasks) {
      // Clear tasks for those phases
      const currentPhaseIds = new Set(
        Array.from(this.phases.values())
          .filter((p) => p.workflowId === id)
          .map((p) => p.id)
      );
      const oldTaskIds = Array.from(this.tasks.values())
        .filter((t) => currentPhaseIds.has(t.phaseId))
        .map((t) => t.id);
      for (const tid of oldTaskIds) {
        this.tasks.delete(tid);
        // Clear related prereqs
        for (const [rid, r] of this.prerequisites.entries()) {
          if (r.taskId === tid || r.prerequisiteTaskId === tid) {
            this.prerequisites.delete(rid);
          }
        }
      }
      for (const t of tasks) this.tasks.set(t.id, { ...t });
    }

    if (prereqs) {
      for (const r of prereqs) this.prerequisites.set(r.id, { ...r });
    }

    return this.getWorkflowById(id);
  }

  public async deleteWorkflow(id: string): Promise<boolean> {
    if (!this.workflows.has(id)) return false;
    this.workflows.delete(id);

    // Cascades
    const phaseIds = Array.from(this.phases.values())
      .filter((p) => p.workflowId === id)
      .map((p) => p.id);
    for (const pid of phaseIds) this.phases.delete(pid);

    const taskIds = Array.from(this.tasks.values())
      .filter((t) => phaseIds.includes(t.phaseId))
      .map((t) => t.id);
    for (const tid of taskIds) {
      this.tasks.delete(tid);
      for (const [rid, r] of this.prerequisites.entries()) {
        if (r.taskId === tid || r.prerequisiteTaskId === tid) {
          this.prerequisites.delete(rid);
        }
      }
      for (const [iid, ing] of this.ingredients.entries()) {
        if (ing.taskId === tid) this.ingredients.delete(iid);
      }
    }

    const sessionIds = Array.from(this.sessions.values())
      .filter((s) => s.workflowId === id)
      .map((s) => s.id);
    for (const sid of sessionIds) {
      this.sessions.delete(sid);
      for (const [pid, prog] of this.progress.entries()) {
        if (prog.sessionId === sid) this.progress.delete(pid);
      }
    }

    return true;
  }

  public async createSession(
    session: SessionRecord,
    progressList: TaskProgressRecord[]
  ): Promise<SessionRecord> {
    this.sessions.set(session.id, { ...session });
    for (const p of progressList) {
      this.progress.set(p.id, { ...p });
    }
    return { ...session };
  }

  public async getSessionById(id: string): Promise<SessionRecord | null> {
    const s = this.sessions.get(id);
    return s ? { ...s } : null;
  }

  public async getSessionProgress(sessionId: string): Promise<TaskProgressRecord[]> {
    return Array.from(this.progress.values())
      .filter((p) => p.sessionId === sessionId)
      .map((p) => ({ ...p }));
  }

  public async updateTaskProgress(
    sessionId: string,
    taskId: string,
    status: TaskStatus,
    completedAt?: Date | null
  ): Promise<TaskProgressRecord | null> {
    const record = Array.from(this.progress.values()).find(
      (p) => p.sessionId === sessionId && p.taskId === taskId
    );
    if (!record) return null;

    const updated: TaskProgressRecord = {
      ...record,
      status,
      completedAt: status === 'completed' ? completedAt || new Date() : null,
    };
    this.progress.set(record.id, updated);
    return { ...updated };
  }

  public async batchUpdateTaskProgress(
    sessionId: string,
    events: TaskCompletionEvent[]
  ): Promise<TaskProgressRecord[]> {
    const results: TaskProgressRecord[] = [];
    for (const event of events) {
      const completedAt = event.completedAt ? new Date(event.completedAt) : null;
      const res = await this.updateTaskProgress(sessionId, event.taskId, event.status, completedAt);
      if (res) results.push(res);
    }
    return results;
  }
}
