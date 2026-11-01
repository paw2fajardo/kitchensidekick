import { Hono } from 'hono';
import { IWorkflowRepository, TaskCompletionEvent, TaskStatus } from '../repository/types.js';
import { SessionStateEngine } from '../session/state-engine.js';
import { randomUUID } from 'crypto';

export function createSessionsRouter(repo: IWorkflowRepository) {
  const router = new Hono();

  /**
   * POST /api/sessions
   * Start a cooking session for a workflow.
   * Body: { workflowId: string }
   */
  router.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const workflowId = body.workflowId;
      if (!workflowId) {
        return c.json({ error: 'Field "workflowId" is required' }, 400);
      }

      const workflow = await repo.getWorkflowById(workflowId);
      if (!workflow) {
        return c.json({ error: 'Workflow not found' }, 404);
      }

      const sessionId = randomUUID();
      const sessionRecord = {
        id: sessionId,
        workflowId,
        status: 'active' as const,
        startedAt: new Date(),
        completedAt: null,
      };

      // Initialize all tasks with not_started
      const progressRecords: any[] = [];
      for (const phase of workflow.phases) {
        for (const task of phase.tasks) {
          progressRecords.push({
            id: randomUUID(),
            sessionId,
            taskId: task.id,
            status: 'not_started' as const,
            completedAt: null,
          });
        }
      }

      await repo.createSession(sessionRecord, progressRecords);

      const view = SessionStateEngine.buildSessionView(
        sessionRecord,
        workflow,
        progressRecords
      );

      return c.json(view, 201);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to start session' }, 500);
    }
  });

  /**
   * GET /api/sessions/:id
   * Retrieve session with reactive graph status calculation (Ready, Blocked, etc.)
   */
  router.get('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const session = await repo.getSessionById(id);
      if (!session) {
        return c.json({ error: 'Session not found' }, 404);
      }

      const workflow = await repo.getWorkflowById(session.workflowId);
      if (!workflow) {
        return c.json({ error: 'Workflow for session not found' }, 500);
      }

      const progressList = await repo.getSessionProgress(id);

      const view = SessionStateEngine.buildSessionView(
        session,
        workflow,
        progressList
      );

      return c.json(view, 200);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to get session' }, 500);
    }
  });

  /**
   * PATCH /api/sessions/:id/tasks/:taskId
   * Update individual task status (toggle ready, in_progress, completed).
   * Body: { status: 'ready' | 'in_progress' | 'completed' | 'not_started' }
   */
  router.patch('/:id/tasks/:taskId', async (c) => {
    try {
      const sessionId = c.req.param('id');
      const taskId = c.req.param('taskId');
      const body = await c.req.json();
      const status: TaskStatus = body.status;

      if (!status) {
        return c.json({ error: 'Field "status" is required' }, 400);
      }

      const session = await repo.getSessionById(sessionId);
      if (!session) {
        return c.json({ error: 'Session not found' }, 404);
      }

      const workflow = await repo.getWorkflowById(session.workflowId);
      if (!workflow) {
        return c.json({ error: 'Workflow not found' }, 500);
      }

      const completedAt = status === 'completed' ? new Date() : null;
      await repo.updateTaskProgress(sessionId, taskId, status, completedAt);

      const progressList = await repo.getSessionProgress(sessionId);
      const view = SessionStateEngine.buildSessionView(
        session,
        workflow,
        progressList
      );

      return c.json(view, 200);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to update task progress' }, 500);
    }
  });

  /**
   * POST /api/sessions/:id/sync (BE-07)
   * Reconcile batch offline events idempotently.
   * Body: { events: Array<{ taskId: string, status: TaskStatus, completedAt?: string }> }
   */
  router.post('/:id/sync', async (c) => {
    try {
      const sessionId = c.req.param('id');
      const body = await c.req.json();
      const events: TaskCompletionEvent[] = body.events;

      if (!Array.isArray(events)) {
        return c.json({ error: 'Field "events" must be an array' }, 400);
      }

      const session = await repo.getSessionById(sessionId);
      if (!session) {
        return c.json({ error: 'Session not found' }, 404);
      }

      const workflow = await repo.getWorkflowById(session.workflowId);
      if (!workflow) {
        return c.json({ error: 'Workflow not found' }, 500);
      }

      const currentProgress = await repo.getSessionProgress(sessionId);
      const reconciled = SessionStateEngine.reconcileEvents(currentProgress, events);

      await repo.batchUpdateTaskProgress(sessionId, reconciled);

      const updatedProgress = await repo.getSessionProgress(sessionId);
      const view = SessionStateEngine.buildSessionView(
        session,
        workflow,
        updatedProgress
      );

      return c.json(view, 200);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to sync offline events' }, 500);
    }
  });

  return router;
}
