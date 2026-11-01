import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * 1. RECIPE_WORKFLOW
 * Root record linking a Mealie recipe to our custom workflow representation.
 */
export const recipeWorkflows = pgTable('recipe_workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  mealieRecipeId: text('mealie_recipe_id').notNull().unique(),
  title: text('title').notNull(),
  totalTasks: integer('total_tasks').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * 2. WORKFLOW_PHASE
 * Workflow phase lane (e.g. Prep, Sauce, Cooking).
 */
export const workflowPhases = pgTable('workflow_phases', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').notNull().references(() => recipeWorkflows.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull(),
  colorToken: text('color_token').notNull(), // hex color token from DESIGN.md
});

/**
 * 3. WORKFLOW_TASK
 * Granular executable cooking task belonging to a phase.
 */
export const workflowTasks = pgTable('workflow_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  phaseId: uuid('phase_id').notNull().references(() => workflowPhases.id, { onDelete: 'cascade' }),
  mealieInstructionId: text('mealie_instruction_id'), // non-destructive pointer to Mealie AST
  title: text('title').notNull(),
  instruction: text('instruction').notNull(),
  estimatedSeconds: integer('estimated_seconds'), // optional duration, null if unknown
  sortOrder: integer('sort_order').notNull(),
});

/**
 * 4. TASK_PREREQUISITE
 * Directed edge representing task prerequisite dependency.
 */
export const taskPrerequisites = pgTable('task_prerequisites', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => workflowTasks.id, { onDelete: 'cascade' }),
  prerequisiteTaskId: uuid('prerequisite_task_id').notNull().references(() => workflowTasks.id, { onDelete: 'cascade' }),
});

/**
 * 5. INGREDIENT_MAPPING
 * Associates ingredients with a specific task.
 */
export const ingredientMappings = pgTable('ingredient_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => workflowTasks.id, { onDelete: 'cascade' }),
  ingredientName: text('ingredient_name').notNull(),
  quantity: text('quantity'),
  unit: text('unit'),
  preparationNote: text('preparation_note'),
});

/**
 * 6. COOKING_SESSION
 * Tracks an active or completed cooking session for a workflow.
 */
export const cookingSessions = pgTable('cooking_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').notNull().references(() => recipeWorkflows.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'abandoned'
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

/**
 * 7. TASK_PROGRESS
 * Records completion status of individual tasks within an active session.
 */
export const taskProgress = pgTable('task_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => cookingSessions.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => workflowTasks.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('not_started'), // 'not_started' | 'ready' | 'in_progress' | 'blocked' | 'completed'
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Relations
export const recipeWorkflowsRelations = relations(recipeWorkflows, ({ many }) => ({
  phases: many(workflowPhases),
  sessions: many(cookingSessions),
}));

export const workflowPhasesRelations = relations(workflowPhases, ({ one, many }) => ({
  workflow: one(recipeWorkflows, {
    fields: [workflowPhases.workflowId],
    references: [recipeWorkflows.id],
  }),
  tasks: many(workflowTasks),
}));

export const workflowTasksRelations = relations(workflowTasks, ({ one, many }) => ({
  phase: one(workflowPhases, {
    fields: [workflowTasks.phaseId],
    references: [workflowPhases.id],
  }),
  prerequisites: many(taskPrerequisites, { relationName: 'task_prerequisites' }),
  requiredBy: many(taskPrerequisites, { relationName: 'task_required_by' }),
  ingredients: many(ingredientMappings),
  progress: many(taskProgress),
}));

export const taskPrerequisitesRelations = relations(taskPrerequisites, ({ one }) => ({
  task: one(workflowTasks, {
    fields: [taskPrerequisites.taskId],
    references: [workflowTasks.id],
    relationName: 'task_prerequisites',
  }),
  prerequisiteTask: one(workflowTasks, {
    fields: [taskPrerequisites.prerequisiteTaskId],
    references: [workflowTasks.id],
    relationName: 'task_required_by',
  }),
}));

export const ingredientMappingsRelations = relations(ingredientMappings, ({ one }) => ({
  task: one(workflowTasks, {
    fields: [ingredientMappings.taskId],
    references: [workflowTasks.id],
  }),
}));

export const cookingSessionsRelations = relations(cookingSessions, ({ one, many }) => ({
  workflow: one(recipeWorkflows, {
    fields: [cookingSessions.workflowId],
    references: [recipeWorkflows.id],
  }),
  taskProgressRecords: many(taskProgress),
}));

export const taskProgressRelations = relations(taskProgress, ({ one }) => ({
  session: one(cookingSessions, {
    fields: [taskProgress.sessionId],
    references: [cookingSessions.id],
  }),
  task: one(workflowTasks, {
    fields: [taskProgress.taskId],
    references: [workflowTasks.id],
  }),
}));
