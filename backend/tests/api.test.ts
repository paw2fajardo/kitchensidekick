import { describe, it, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { MemoryWorkflowRepository } from '../src/repository/memory-repository.js';
import { canonicalSukiyakiMealieRecipe } from '../src/workflow/fixtures/sukiyaki.js';

describe('Workflow & Session API Integration (BE-05 & BE-06)', () => {
  const mockMealieClient = {
    getRecipes: vi.fn().mockResolvedValue({
      page: 1,
      per_page: 50,
      total: 1,
      total_pages: 1,
      items: [
        {
          id: 'test-recipe-1',
          slug: 'sukiyaki',
          name: 'Sukiyaki',
          description: 'Delicious hot pot',
          image: null,
          totalTime: 'PT45M',
          recipeYield: '4 servings',
        },
      ],
    }),
    getRecipeBySlug: vi.fn().mockImplementation(async (slug: string) => {
      if (slug === 'sukiyaki') {
        return canonicalSukiyakiMealieRecipe;
      }
      throw new Error('Not found');
    }),
  } as any;

  it('fetches recipes from Mealie (GET /api/recipes)', async () => {
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: mockMealieClient });

    const res = await app.request('/api/recipes');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items.length).toBe(1);
    expect(data.items[0].slug).toBe('sukiyaki');
  });

  it('falls back to canonical Sukiyaki fixture when Mealie is unreachable (GET /api/recipes)', async () => {
    const failingMealieClient = {
      getRecipes: vi.fn().mockRejectedValue(new Error('Network error')),
    } as any;
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: failingMealieClient });

    const res = await app.request('/api/recipes');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items.length).toBe(1);
    expect(data.items[0].name).toBe('Sukiyaki');
    expect(data.items[0].slug).toBe('sukiyaki');
  });

  it('generates a workflow from recipe slug (POST /api/workflows)', async () => {
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: mockMealieClient });

    const res = await app.request('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'sukiyaki' }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.workflow.title).toBe('Sukiyaki');
    expect(data.phases.length).toBe(3);
    expect(data.phases[0].name).toBe('Preparation');
    expect(data.phases[1].name).toBe('Sauce / Seasoning');
    expect(data.phases[2].name).toBe('Active Cooking');
  });

  it('retrieves an existing workflow (GET /api/workflows/:id)', async () => {
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: mockMealieClient });

    // Generate workflow first
    const genRes = await app.request('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'sukiyaki' }),
    });
    const created = await genRes.json();
    const workflowId = created.workflow.id;

    // Fetch by id
    const res = await app.request(`/api/workflows/${workflowId}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.workflow.id).toBe(workflowId);
    expect(data.workflow.title).toBe('Sukiyaki');
  });

  it('manages cooking session lifecycle and reactive task states (BE-06)', async () => {
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: mockMealieClient });

    // 1. Generate workflow
    const genRes = await app.request('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'sukiyaki' }),
    });
    const { workflow } = await genRes.json();

    // 2. Start cooking session (POST /api/sessions)
    const sessionRes = await app.request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: workflow.id }),
    });
    expect(sessionRes.status).toBe(201);
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.session.id;

    expect(sessionData.session.status).toBe('active');
    expect(sessionData.overallProgress.totalTasks).toBe(15);
    expect(sessionData.overallProgress.completedTasks).toBe(0);

    // Initial prep task 1 should be 'ready', while tasks with prerequisites like arrange or add sauce are 'blocked'
    const prepPhase = sessionData.phases.find((p: any) => p.name === 'Preparation');
    const firstTask = prepPhase.tasks[0];
    const arrangeTask = prepPhase.tasks[4];
    expect(firstTask.status).toBe('ready');
    expect(arrangeTask.status).toBe('blocked');

    // 3. Complete first task (PATCH /api/sessions/:id/tasks/:taskId)
    const patchRes = await app.request(`/api/sessions/${sessionId}/tasks/${firstTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    expect(patchRes.status).toBe(200);
    const updatedView = await patchRes.json();
    expect(updatedView.overallProgress.completedTasks).toBe(1);

    const updatedFirstTask = updatedView.phases[0].tasks[0];
    expect(updatedFirstTask.status).toBe('completed');

    // 4. Test Step Rollback / Undo: revert first task back to 'ready'
    const undoRes = await app.request(`/api/sessions/${sessionId}/tasks/${firstTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ready' }),
    });
    expect(undoRes.status).toBe(200);
    const undoneView = await undoRes.json();
    expect(undoneView.overallProgress.completedTasks).toBe(0);
    expect(undoneView.phases[0].tasks[0].status).toBe('ready');
    expect(undoneView.phases[0].tasks[0].completedAt).toBeNull();
  });

  it('reconciles offline sync events (POST /api/sessions/:id/sync)', async () => {
    const repo = new MemoryWorkflowRepository();
    const app = createApp({ repository: repo, mealieClient: mockMealieClient });

    const genRes = await app.request('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'sukiyaki' }),
    });
    const { workflow, phases } = await genRes.json();
    const sessionRes = await app.request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: workflow.id }),
    });
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.session.id;

    const task1 = phases[0].tasks[0];
    const task2 = phases[0].tasks[1];

    const syncRes = await app.request(`/api/sessions/${sessionId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          { taskId: task1.id, status: 'completed', completedAt: new Date().toISOString() },
          { taskId: task2.id, status: 'completed', completedAt: new Date().toISOString() },
        ],
      }),
    });

    expect(syncRes.status).toBe(200);
    const syncData = await syncRes.json();
    expect(syncData.overallProgress.completedTasks).toBe(2);
  });
});
