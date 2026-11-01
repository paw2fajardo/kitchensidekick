import { describe, it, expect } from 'vitest';
import {
  recipeWorkflows,
  workflowPhases,
  workflowTasks,
  taskPrerequisites,
  ingredientMappings,
  cookingSessions,
  taskProgress,
} from '../src/db/schema.js';
import { getTableColumns } from 'drizzle-orm';

describe('Database & Persistence Schema (BE-04)', () => {
  it('defines recipe_workflows table with all required fields', () => {
    const columns = getTableColumns(recipeWorkflows);
    expect(columns.id).toBeDefined();
    expect(columns.mealieRecipeId).toBeDefined();
    expect(columns.title).toBeDefined();
    expect(columns.totalTasks).toBeDefined();
    expect(columns.createdAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });

  it('defines workflow_phases table with all required fields', () => {
    const columns = getTableColumns(workflowPhases);
    expect(columns.id).toBeDefined();
    expect(columns.workflowId).toBeDefined();
    expect(columns.name).toBeDefined();
    expect(columns.sortOrder).toBeDefined();
    expect(columns.colorToken).toBeDefined();
  });

  it('defines workflow_tasks table with all required fields', () => {
    const columns = getTableColumns(workflowTasks);
    expect(columns.id).toBeDefined();
    expect(columns.phaseId).toBeDefined();
    expect(columns.mealieInstructionId).toBeDefined();
    expect(columns.title).toBeDefined();
    expect(columns.instruction).toBeDefined();
    expect(columns.estimatedSeconds).toBeDefined();
    expect(columns.sortOrder).toBeDefined();
  });

  it('defines task_prerequisites table with foreign keys', () => {
    const columns = getTableColumns(taskPrerequisites);
    expect(columns.id).toBeDefined();
    expect(columns.taskId).toBeDefined();
    expect(columns.prerequisiteTaskId).toBeDefined();
  });

  it('defines ingredient_mappings table with required fields', () => {
    const columns = getTableColumns(ingredientMappings);
    expect(columns.id).toBeDefined();
    expect(columns.taskId).toBeDefined();
    expect(columns.ingredientName).toBeDefined();
    expect(columns.quantity).toBeDefined();
    expect(columns.unit).toBeDefined();
    expect(columns.preparationNote).toBeDefined();
  });

  it('defines cooking_sessions and task_progress tables', () => {
    const sessionCols = getTableColumns(cookingSessions);
    expect(sessionCols.id).toBeDefined();
    expect(sessionCols.workflowId).toBeDefined();
    expect(sessionCols.status).toBeDefined();
    expect(sessionCols.startedAt).toBeDefined();
    expect(sessionCols.completedAt).toBeDefined();

    const progressCols = getTableColumns(taskProgress);
    expect(progressCols.id).toBeDefined();
    expect(progressCols.sessionId).toBeDefined();
    expect(progressCols.taskId).toBeDefined();
    expect(progressCols.status).toBeDefined();
    expect(progressCols.completedAt).toBeDefined();
  });
});
