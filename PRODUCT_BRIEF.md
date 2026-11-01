# Kitchen Workflow App — Product Brief

## 1. Product summary

The Kitchen Workflow App is a kitchen-focused frontend built on top of a self-hosted Mealie instance. Mealie remains responsible for recipe storage, user management, and recipe URL ingestion. The custom application provides a better way to understand, organize, and execute recipes that contain multiple components or parallel cooking activities.

The product should feel like a practical cooking workspace—not a food blog, recipe social network, or general-purpose project-management tool.

## 2. Problem statement

Most recipe applications present instructions as one linear sequence. That structure is difficult to use for complex dishes where several activities can happen independently, such as preparing ingredients, making a sauce, and setting up the cooking station before cooking begins.

Users often have to mentally reorganize the recipe or return to printouts and source websites.

## 3. Product goal

Transform a conventional Mealie recipe into an editable cooking workflow with:

- Recipe-specific phases or workstreams.
- Tasks grouped into those phases.
- Ingredients associated with the tasks and phases where they are used.
- Explicit task dependencies where one task must wait for another.
- A visual overview of parallel work.
- A simplified cooking mode for carrying out tasks.
- Persistent workflow configuration and cooking progress.

## 4. Product principles

1. **Mealie owns recipe data.** Do not fork Mealie or modify its core recipe model.
2. **The custom app owns workflow data.** Phases, task organization, mappings, dependencies, and cooking progress belong to this application.
3. **Preserve source content.** Original instructions and ingredient references must remain traceable and must not be silently discarded.
4. **Generation is a proposal.** Automatically classified phases and mappings must be reviewable and editable.
5. **Phases are recipe-specific.** Do not force every recipe into a fixed set of global phases.
6. **Parallel does not mean simultaneous by default.** A board shows independent workstreams; dependencies indicate prerequisites. Do not imply a precise schedule unless timing data exists.
7. **Cooking use comes first.** Prioritize legibility, large touch targets, low cognitive load, and reliable progress recovery.

## 5. Target users and context

Primary users are home cooks preparing recipes with multiple components or preparation stages.

Primary devices:

- 10–13 inch tablet, especially landscape orientation, positioned on a kitchen counter.
- Mobile phone for checking instructions while cooking.
- Desktop browser for browsing and editing recipes or workflows.

Assume users may be standing away from the screen, have wet or occupied hands, and need to understand instructions quickly.

## 6. Main user journeys

### Journey A — Find and prepare a recipe

1. Open the recipe library.
2. Search or browse recipes synced from Mealie.
3. Open a recipe overview.
4. Review ingredients and original instructions.
5. Create or open the recipe's workflow.

### Journey B — Generate and edit a workflow

1. The application normalizes the Mealie recipe data.
2. The workflow generator proposes phases and task groupings.
3. The user reviews the proposal.
4. The user adds, renames, reorders, or removes phases.
5. The user edits tasks and moves tasks between phases.
6. The user associates ingredients with relevant tasks.
7. The user adds or adjusts task dependencies.
8. The user saves the workflow.

### Journey C — Cook using the workflow

1. Open the saved workflow board.
2. Review all phases and their progress.
3. See which tasks are ready, blocked, in progress, or complete.
4. Open a task in Focus Mode when more detailed instructions are needed.
5. Mark tasks and ingredients as complete.
6. Return to the board without losing context.
7. Resume the session after a refresh or temporary connection loss.

## 7. Required screens

### Screen 1 — Recipe Library

Purpose: Find recipes available from Mealie.

Required content:

- Application navigation.
- Search field.
- Recipe cards with image and title.
- Preparation time, cooking time, and servings when available.
- Indicator showing whether a workflow exists.
- Basic filtering or browsing controls.

Avoid social features, ratings, comments, and food-blog layouts.

### Screen 2 — Recipe Overview

Purpose: Review the source recipe before entering the workflow.

Required content:

- Recipe title and image.
- Recipe metadata when available.
- Ingredient list, preserving ingredient group headings where present.
- Original instructions.
- Primary action to open or create a workflow.
- Secondary action to edit an existing workflow.

The original recipe remains accessible, but the workflow is the primary product experience.

### Screen 3 — Workflow Editor

Purpose: Correct and customize the generated workflow.

Required capabilities:

- Add, rename, reorder, and delete phases.
- Add and edit tasks.
- Move tasks between phases.
- Preserve links to original Mealie instruction IDs when possible.
- Associate one or more ingredients with a task.
- Allow an ingredient to be associated with multiple tasks.
- Define task dependencies.
- Show unassigned instructions and unmapped ingredients.
- Validate before saving.

Prefer direct, understandable controls over a complex node-and-edge graph editor.

### Screen 4 — Workflow Board (primary screen)

Purpose: Show the full cooking operation at a glance.

Use a multi-column or multi-lane layout. Each lane represents a recipe-specific phase or workstream. Tasks appear as vertically arranged cards within their phase.

Use this sample recipe content for the first design:

**Sukiyaki**

**Prep**
- Slice beef.
- Cut napa cabbage.
- Slice shiitake mushrooms.
- Prepare tofu.
- Arrange ingredients.

**Sauce**
- Combine soy sauce.
- Add mirin.
- Add sugar.
- Mix until dissolved.

**Cooking**
- Heat the cooking pot.
- Cook beef.
- Add vegetables.
- Add tofu.
- Add sauce.
- Simmer and finish.

Required elements:

- Recipe title and overall progress.
- Phase headers and phase-level progress.
- Task cards with title, concise instruction, status, and ingredient indicators.
- Optional duration only when known or explicitly entered.
- Visible indication of dependencies and blocked tasks.
- Ingredient checklist accessible without leaving the board.
- A clear switch between Overview Mode and Focus Mode.

Task states:

- Not started.
- Ready.
- In progress.
- Blocked.
- Completed.

Completed tasks should remain visible but visually subdued. Status must not be conveyed by color alone.

Important: This is not a time-scaled Gantt chart. The lanes represent workstreams, not a guaranteed schedule. Do not force sequential execution where tasks are independent.

### Screen 5 — Focus Mode / Cooking Mode

Purpose: Help the user execute one task with minimal distraction.

Required elements:

- Recipe title and current phase.
- Current task title and full instruction.
- Task progress and overall workflow progress.
- Associated ingredients and quantities.
- Large completion action.
- Previous and next navigation.
- Optional timer only where an actual duration exists or the user adds one.
- Return to workflow overview.

Keep the main instruction visually dominant. Design for one-handed operation and glanceability.

### Screen 6 — Ingredient Checklist

Purpose: Track ingredient preparation and availability.

Required elements:

- Ingredients grouped by phase or recipe component.
- Quantity and unit when available.
- Interactive checkboxes.
- Indicators or links showing which tasks use each ingredient.
- Completed and pending states.

On tablets, this may be a persistent or collapsible side panel. On mobile, use a drawer or dedicated panel.

## 8. Core interaction requirements

- Selecting a recipe opens its overview.
- Opening a workflow displays the workflow board.
- Selecting a task reveals its details or opens Focus Mode.
- Completing a task updates its state and relevant progress indicators.
- Selecting an ingredient reveals the tasks that use it.
- The workflow editor allows phases and tasks to be modified.
- Saving preserves user corrections.
- Returning from Focus Mode preserves the board context.
- Blocked tasks explain which prerequisite remains incomplete.

Avoid interactions that require precise dragging as the only way to perform an action. Provide accessible alternatives such as menus or move controls.

## 9. Responsive behavior

### Tablet landscape

- Primary target for the workflow board.
- Show multiple phases simultaneously.
- Keep ingredients accessible.
- Use the available horizontal space efficiently.

### Tablet portrait

- Show fewer lanes at once, with horizontal scrolling or a clear phase selector.
- Avoid shrinking cards until text becomes difficult to read.

### Mobile

- Show one phase at a time or use a phase selector.
- Do not compress all desktop lanes into narrow columns.
- Keep the main task action accessible.
- Use a compact, persistent navigation/control area where appropriate.

### Desktop

- Support a wider multi-lane board.
- Allow space for an ingredient panel and workflow editing controls.

## 10. Accessibility and kitchen usability

- Minimum touch target: 48px; aim for 56px or larger for primary actions.
- Body text: approximately 16–18px.
- Main cooking instructions: approximately 20–24px or larger where needed.
- Strong text/background contrast.
- Clear visual states supported by text or icons, not color alone.
- Confirm destructive actions.
- Avoid unnecessary navigation and modal dialogs.
- Keep key controls in consistent locations.
- Respect reduced-motion preferences.

## 11. MVP scope

Include:

- Mealie recipe retrieval.
- Recipe normalization.
- Basic deterministic workflow generation.
- Manual phase and task editing.
- Ingredient-to-task mapping.
- Parallel workflow board.
- Task completion and ingredient checklist.
- Workflow persistence.
- Cooking progress persistence.
- Tablet-friendly and mobile-responsive layouts.

Defer:

- AI-generated recipes.
- AI as a mandatory workflow-generation dependency.
- Automatic cooking schedule optimization.
- Social sharing and community features.
- Ratings and reviews.
- Meal planning and grocery checkout.
- Real-time multi-user collaboration.
- Advanced graph or Gantt editing.

## 12. Design deliverables

Produce a cohesive, high-fidelity design system and connected prototype for all six screens.

Prioritize the Workflow Board and Focus Mode. Include responsive variants, component states, empty states, and error or blocked states.

Prototype the main journey:

Recipe Library → Recipe Overview → Workflow Board → Focus Mode → Complete Task → Workflow Board.

Also prototype:

Recipe Overview → Workflow Editor → Modify Phases and Tasks → Save → Workflow Board.

The result should look and behave like a practical, production-ready kitchen application—not a conceptual mockup.

## 13. Design success criteria

A user should be able to look at a complex recipe and quickly understand:

- What the independent workstreams are.
- Which tasks belong to each phase.
- Which ingredients are needed for a task.
- What can be done next.
- What is blocked and why.
- How much of the workflow is complete.

The primary success measure is whether the interface makes complex recipes easier to execute without repeatedly returning to the original recipe website or printouts.
