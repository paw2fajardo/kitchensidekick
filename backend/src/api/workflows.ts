import { Hono } from 'hono';
import { IWorkflowRepository } from '../repository/types.js';
import { MealieClient } from '../mealie/client.js';
import { RecipeNormalizer } from '../normalizer/normalizer.js';
import { WorkflowGenerator } from '../workflow/generator.js';
import { randomUUID } from 'crypto';

export function createWorkflowsRouter(
  repo: IWorkflowRepository,
  mealieClient: MealieClient
) {
  const router = new Hono();

  /**
   * GET /api/workflows/:id
   * Retrieve full workflow graph by ID.
   */
  router.get('/:id', async (c) => {
    const id = c.req.param('id');
    const wf = await repo.getWorkflowById(id);
    if (!wf) {
      return c.json({ error: 'Workflow not found' }, 404);
    }
    return c.json(wf, 200);
  });

  /**
   * POST /api/workflows
   * Generate workflow from Mealie recipe slug.
   * Body: { slug: string }
   */
  router.post('/', async (c) => {
    try {
      const body = await c.req.json();
      const slug = body.slug;
      if (!slug || typeof slug !== 'string') {
        return c.json({ error: 'Field "slug" is required' }, 400);
      }

      // Check if workflow already exists for this recipe
      const mealieRecipe = await mealieClient.getRecipeBySlug(slug);
      const existing = await repo.getWorkflowByMealieId(mealieRecipe.id);
      if (existing) {
        return c.json(existing, 200);
      }

      // Normalize into RecipeAST
      const ast = RecipeNormalizer.normalize(mealieRecipe);

      // Deterministically generate proposal
      const proposal = WorkflowGenerator.generateProposal(ast);

      const workflowId = randomUUID();
      const workflowRecord = {
        id: workflowId,
        mealieRecipeId: proposal.mealieRecipeId,
        title: proposal.title,
        totalTasks: proposal.totalTasks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const phasesRecord: any[] = [];
      const tasksRecord: any[] = [];
      const prereqsRecord: any[] = [];
      const ingredientsRecord: any[] = [];

      // Map instruction ID to generated task ID for prerequisite links
      const instructionToTaskId = new Map<string, string>();

      for (const phase of proposal.phases) {
        const phaseId = randomUUID();
        phasesRecord.push({
          id: phaseId,
          workflowId,
          name: phase.name,
          sortOrder: phase.sortOrder,
          colorToken: phase.colorToken,
        });

        for (const task of phase.tasks) {
          const taskId = randomUUID();
          instructionToTaskId.set(task.mealieInstructionId, taskId);

          tasksRecord.push({
            id: taskId,
            phaseId,
            mealieInstructionId: task.mealieInstructionId,
            title: task.title,
            instruction: task.instruction,
            estimatedSeconds: task.estimatedSeconds,
            sortOrder: task.sortOrder,
          });

          for (const ingName of task.ingredientNames) {
            ingredientsRecord.push({
              id: randomUUID(),
              taskId,
              ingredientName: ingName,
              quantity: null,
              unit: null,
              preparationNote: null,
            });
          }
        }
      }

      // Link prerequisites
      for (const phase of proposal.phases) {
        for (const task of phase.tasks) {
          const taskId = instructionToTaskId.get(task.mealieInstructionId)!;
          for (const prereqInstId of task.prerequisiteInstructionIds) {
            const prereqTaskId = instructionToTaskId.get(prereqInstId);
            if (prereqTaskId) {
              prereqsRecord.push({
                id: randomUUID(),
                taskId,
                prerequisiteTaskId: prereqTaskId,
              });
            }
          }
        }
      }

      const created = await repo.createWorkflow(
        workflowRecord,
        phasesRecord,
        tasksRecord,
        prereqsRecord,
        ingredientsRecord
      );

      return c.json(created, 201);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to generate workflow' }, 500);
    }
  });

  /**
   * PUT /api/workflows/:id
   * Save user edits to workflow title, phases, or tasks.
   */
  router.put('/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();

      const existing = await repo.getWorkflowById(id);
      if (!existing) {
        return c.json({ error: 'Workflow not found' }, 404);
      }

      const updated = await repo.updateWorkflow(
        id,
        {
          title: body.title || existing.workflow.title,
          totalTasks: body.totalTasks || existing.workflow.totalTasks,
        },
        body.phases,
        body.tasks,
        body.prerequisites
      );

      return c.json(updated, 200);
    } catch (err: any) {
      return c.json({ error: err.message || 'Failed to update workflow' }, 500);
    }
  });

  /**
   * DELETE /api/workflows/:id
   */
  router.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const success = await repo.deleteWorkflow(id);
    if (!success) {
      return c.json({ error: 'Workflow not found' }, 404);
    }
    return c.json({ success: true }, 200);
  });

  return router;
}
