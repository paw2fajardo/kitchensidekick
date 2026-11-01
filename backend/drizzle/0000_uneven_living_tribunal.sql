CREATE TABLE "cooking_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ingredient_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"ingredient_name" text NOT NULL,
	"quantity" text,
	"unit" text,
	"preparation_note" text
);
--> statement-breakpoint
CREATE TABLE "recipe_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mealie_recipe_id" text NOT NULL,
	"title" text NOT NULL,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_workflows_mealie_recipe_id_unique" UNIQUE("mealie_recipe_id")
);
--> statement-breakpoint
CREATE TABLE "task_prerequisites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"prerequisite_task_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workflow_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"color_token" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase_id" uuid NOT NULL,
	"mealie_instruction_id" text,
	"title" text NOT NULL,
	"instruction" text NOT NULL,
	"estimated_seconds" integer,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cooking_sessions" ADD CONSTRAINT "cooking_sessions_workflow_id_recipe_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."recipe_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_mappings" ADD CONSTRAINT "ingredient_mappings_task_id_workflow_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."workflow_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_prerequisites" ADD CONSTRAINT "task_prerequisites_task_id_workflow_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."workflow_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_prerequisites" ADD CONSTRAINT "task_prerequisites_prerequisite_task_id_workflow_tasks_id_fk" FOREIGN KEY ("prerequisite_task_id") REFERENCES "public"."workflow_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_session_id_cooking_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."cooking_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_task_id_workflow_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."workflow_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_phases" ADD CONSTRAINT "workflow_phases_workflow_id_recipe_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."recipe_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_tasks" ADD CONSTRAINT "workflow_tasks_phase_id_workflow_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."workflow_phases"("id") ON DELETE cascade ON UPDATE no action;