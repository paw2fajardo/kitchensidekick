import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import type { ScreenId } from './components/layout/AppShell';
import { RecipeLibrary } from './components/screens/RecipeLibrary';
import { RecipeOverview } from './components/screens/RecipeOverview';
import { WorkflowEditor } from './components/screens/WorkflowEditor';
import { ActiveCookingConsole } from './components/screens/ActiveCookingConsole';
import { CookingCompleteCelebration } from './components/screens/CookingCompleteCelebration';
import type { TaskCardProps } from './components/TaskCard';
import type { EditableTask } from './components/screens/WorkflowEditor';

// Canonical Sukiyaki initial workflow tasks
const INITIAL_TASKS: TaskCardProps[] = [
  {
    id: 'prep-shiitake',
    title: 'Clean & Score Shiitake Mushrooms',
    instructionPreview: 'Wipe shiitake mushroom caps with a damp cloth. Cut decorative cross slits into caps and trim tough woody stems.',
    phase: 'prep',
    status: 'ready',
    durationMinutes: 5,
    ingredients: [{ id: 'ing-1', name: 'Fresh Shiitake Mushrooms', quantity: '8 caps' }],
  },
  {
    id: 'prep-tofu',
    title: 'Cut & Pan-Sear Grilled Tofu',
    instructionPreview: 'Cut yakidofu (grilled firm tofu) into 8 uniform rectangular cubes, pat dry with paper towels.',
    phase: 'prep',
    status: 'ready',
    durationMinutes: 5,
    ingredients: [{ id: 'ing-2', name: 'Yaki Tofu (Grilled Tofu)', quantity: '1 block' }],
  },
  {
    id: 'prep-shirataki',
    title: 'Parboil & Cut Shirataki Noodles',
    instructionPreview: 'Parboil shirataki noodles for 2 minutes to eliminate konjac odor, drain thoroughly, and cut into manageable lengths.',
    phase: 'prep',
    status: 'ready',
    durationMinutes: 4,
    ingredients: [{ id: 'ing-3', name: 'Shirataki Konjac Noodles', quantity: '200g' }],
  },
  {
    id: 'sauce-warishita',
    title: 'Simmer Warishita Sauce Base',
    instructionPreview: 'Combine sake, mirin, Japanese dark soy sauce, and sugar in a small saucepan. Bring to gentle simmer until sugar dissolves.',
    phase: 'sauce',
    status: 'ready',
    durationMinutes: 6,
    ingredients: [
      { id: 'ing-sake', name: 'Cooking Sake', quantity: '100ml' },
      { id: 'ing-mirin', name: 'Hon Mirin', quantity: '100ml' },
      { id: 'ing-soy', name: 'Dark Soy Sauce', quantity: '100ml' },
      { id: 'ing-sugar', name: 'Cane Sugar', quantity: '3 tbsp' },
    ],
  },
  {
    id: 'cook-beef',
    title: 'Sear Beef Ribeye in Tallow',
    instructionPreview: 'Melt beef tallow cube in a hot cast-iron sukiyaki pot. Spread sugar and sear beef slices on both sides for 30s each.',
    phase: 'cooking',
    status: 'blocked',
    durationMinutes: 3,
    prerequisite: {
      id: 'sauce-warishita',
      stepNumber: 'Sauce Step 1',
      title: 'Simmer Warishita Sauce Base',
    },
    ingredients: [
      { id: 'ing-beef', name: 'Thin Sliced Wagyu Beef Ribeye', quantity: '400g' },
      { id: 'ing-tallow', name: 'Beef Tallow', quantity: '1 cube' },
    ],
  },
  {
    id: 'cook-simmer',
    title: 'Add Vegetables & Simmer in Warishita',
    instructionPreview: 'Arrange scored shiitake, tofu cubes, negi scallions, and shirataki noodles around seared beef. Pour warishita broth.',
    phase: 'cooking',
    status: 'blocked',
    durationMinutes: 8,
    prerequisite: {
      id: 'cook-beef',
      stepNumber: 'Cooking Step 1',
      title: 'Sear Beef Ribeye in Tallow',
    },
    ingredients: [{ id: 'ing-egg', name: 'Fresh Pasteurized Eggs for Dipping', quantity: '4' }],
  },
];

interface AppIngredient {
  id: string;
  name: string;
  quantity: string;
  isPrepared: boolean;
  taskId: string;
  taskTitle: string;
}

const INITIAL_INGREDIENTS: AppIngredient[] = [
  { id: 'ing-beef', name: 'Thinly Sliced Wagyu Beef Ribeye', quantity: '400g', isPrepared: false, taskId: 'cook-beef', taskTitle: 'Sear Beef Ribeye in Tallow' },
  { id: 'ing-tallow', name: 'Beef Tallow', quantity: '1 cube', isPrepared: true, taskId: 'cook-beef', taskTitle: 'Sear Beef Ribeye in Tallow' },
  { id: 'ing-1', name: 'Fresh Shiitake Mushrooms', quantity: '8 caps', isPrepared: false, taskId: 'prep-shiitake', taskTitle: 'Clean & Score Shiitake Mushrooms' },
  { id: 'ing-2', name: 'Yaki Tofu (Grilled Firm Tofu)', quantity: '1 block', isPrepared: false, taskId: 'prep-tofu', taskTitle: 'Cut & Pan-Sear Grilled Tofu' },
  { id: 'ing-3', name: 'Shirataki Konjac Noodles', quantity: '200g', isPrepared: true, taskId: 'prep-shirataki', taskTitle: 'Parboil & Cut Shirataki Noodles' },
  { id: 'ing-sake', name: 'Cooking Sake', quantity: '100ml', isPrepared: true, taskId: 'sauce-warishita', taskTitle: 'Simmer Warishita Sauce Base' },
  { id: 'ing-mirin', name: 'Hon Mirin', quantity: '100ml', isPrepared: true, taskId: 'sauce-warishita', taskTitle: 'Simmer Warishita Sauce Base' },
  { id: 'ing-soy', name: 'Dark Soy Sauce', quantity: '100ml', isPrepared: true, taskId: 'sauce-warishita', taskTitle: 'Simmer Warishita Sauce Base' },
  { id: 'ing-sugar', name: 'Cane Sugar', quantity: '3 tbsp', isPrepared: true, taskId: 'sauce-warishita', taskTitle: 'Simmer Warishita Sauce Base' },
  { id: 'ing-egg', name: 'Pasteurized Eggs (for dipping)', quantity: '4', isPrepared: false, taskId: 'cook-simmer', taskTitle: 'Add Vegetables & Simmer in Warishita' },
];

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('library');
  const [tasks, setTasks] = useState<TaskCardProps[]>(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string>(INITIAL_TASKS[0].id);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Active selected recipe metadata
  const [selectedRecipe, setSelectedRecipe] = useState<{
    id: string;
    slug: string;
    name: string;
    description: string;
    totalTime: string;
    yieldServings: string;
    ingredients: { id: string; name: string; quantity: string; group?: string }[];
    instructions: { id: string; stepNumber: number; text: string }[];
  }>({
    id: 'sukiyaki-kanto-001',
    slug: 'kanto-style-sukiyaki',
    name: 'Kanto-Style Sukiyaki (Simmered Beef Hot Pot)',
    description: 'Classic Tokyo-style sukiyaki cooked in rich warishita broth with thinly sliced beef ribeye, shiitake mushrooms, grilled firm tofu, and shirataki noodles.',
    totalTime: '45 mins',
    yieldServings: '4 servings',
    ingredients: INITIAL_INGREDIENTS.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      group: i.taskId?.includes('sauce') ? 'Warishita Sauce' : 'Sukiyaki Hot Pot',
    })),
    instructions: INITIAL_TASKS.map((t, idx) => ({
      id: t.id,
      stepNumber: idx + 1,
      text: t.instructionPreview,
    })),
  });

  // Synchronize internal screen & slug with browser URL path and parameters
  const updateUrl = useCallback((screen: ScreenId, slug: string) => {
    let targetPath = '/recipes';
    if (screen === 'overview') {
      targetPath = `/recipes/${encodeURIComponent(slug)}`;
    } else if (screen === 'cooking') {
      targetPath = `/recipes/${encodeURIComponent(slug)}/cooking`;
    } else if (screen === 'celebration') {
      targetPath = `/recipes/${encodeURIComponent(slug)}/celebration`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ screen, slug }, '', targetPath);
    }
  }, []);

  const navigateToScreen = useCallback((screen: ScreenId) => {
    setCurrentScreen(screen);
    updateUrl(screen, selectedRecipe.slug);
  }, [selectedRecipe.slug, updateUrl]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const sessionBadge = `${completedCount}/${tasks.length} steps completed`;

  /**
   * Handle selecting a recipe from Library or generating its deterministic workflow.
   */
  const handleSelectOrGenerateRecipe = async (recipeSummary: { id: string; slug: string; name: string }) => {
    try {
      // 1. Fetch full recipe from Mealie via backend
      let fullRecipe: any = null;
      try {
        const res = await fetch(`/api/recipes/${recipeSummary.slug}`);
        if (res.ok) {
          fullRecipe = await res.json();
        }
      } catch {
        // Fallback or offline
      }

      // 2. Fetch or Generate Workflow via /api/workflows
      let workflowData: any = null;
      try {
        const wfRes = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: recipeSummary.slug }),
        });
        if (wfRes.ok) {
          workflowData = await wfRes.json();
        }
      } catch {
        // Fallback
      }

      if (workflowData && workflowData.phases) {
        // Convert workflow phases & tasks into TaskCardProps
        const loadedTasks: TaskCardProps[] = [];
        const loadedIngredients: { id: string; name: string; quantity: string; group?: string }[] = [];

        workflowData.phases.forEach((phase: any) => {
          let phaseType: 'prep' | 'sauce' | 'cooking' = 'cooking';
          const pName = (phase.name || '').toLowerCase();
          if (pName.includes('prep')) phaseType = 'prep';
          else if (pName.includes('sauce') || pName.includes('seasoning') || pName.includes('tare')) phaseType = 'sauce';

          phase.tasks.forEach((t: any) => {
            const prereqId = t.prerequisites && t.prerequisites.length > 0 ? t.prerequisites[0] : undefined;
            loadedTasks.push({
              id: t.id,
              title: t.title,
              instructionPreview: t.instruction,
              phase: phaseType,
              status: t.prerequisites && t.prerequisites.length > 0 ? 'blocked' : 'ready',
              durationMinutes: t.estimatedSeconds ? Math.ceil(t.estimatedSeconds / 60) : 4,
              prerequisite: prereqId ? { id: prereqId, stepNumber: 'Step', title: 'Prerequisite task' } : undefined,
              ingredients: (t.ingredients || []).map((ing: any) => ({
                id: ing.id,
                name: ing.ingredientName,
                quantity: ing.quantity || '',
              })),
            });
          });
        });

        if (fullRecipe && fullRecipe.recipeIngredient) {
          fullRecipe.recipeIngredient.forEach((ri: any) => {
            loadedIngredients.push({
              id: ri.referenceId || String(Math.random()),
              name: ri.food?.name || ri.display || 'Ingredient',
              quantity: ri.display || `${ri.quantity || ''} ${ri.unit?.name || ''}`.trim(),
              group: 'Ingredients',
            });
          });
        }

        const recipeName = fullRecipe?.name || workflowData.workflow?.title || recipeSummary.name;
        setSelectedRecipe({
          id: workflowData.workflow?.id || recipeSummary.id,
          slug: recipeSummary.slug,
          name: recipeName,
          description: fullRecipe?.description || 'Chef crafted workflow orchestrating parallel preparation and cooking steps.',
          totalTime: fullRecipe?.totalTime || `${loadedTasks.reduce((acc, cur) => acc + (cur.durationMinutes || 3), 0)} mins`,
          yieldServings: fullRecipe?.recipeServings ? `${fullRecipe.recipeServings} servings` : '4 servings',
          ingredients: loadedIngredients.length > 0 ? loadedIngredients : INITIAL_INGREDIENTS.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
          instructions: loadedTasks.map((t, idx) => ({ id: t.id, stepNumber: idx + 1, text: t.instructionPreview })),
        });

        setTasks(loadedTasks.length > 0 ? loadedTasks : INITIAL_TASKS);
        setActiveTaskId(loadedTasks[0]?.id || INITIAL_TASKS[0].id);
      } else {
        // If workflow generation failed, keep canonical fallback
        setSelectedRecipe((prev) => ({
          ...prev,
          name: recipeSummary.name,
          slug: recipeSummary.slug,
        }));
      }
    } finally {
      setCurrentScreen('overview');
      updateUrl('overview', recipeSummary.slug);
    }
  };

  // Handle browser popstate navigation (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.screen) {
        setCurrentScreen(state.screen);
      } else {
        // Fallback parse from window.location.pathname
        const path = window.location.pathname;
        if (path === '/' || path === '/recipes') {
          setCurrentScreen('library');
        } else if (path.endsWith('/cooking')) {
          setCurrentScreen('cooking');
        } else if (path.endsWith('/celebration')) {
          setCurrentScreen('celebration');
        } else if (path.startsWith('/recipes/')) {
          setCurrentScreen('overview');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load URL routing & deep link support
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/recipes/')) {
      const parts = path.split('/').filter(Boolean); // ['recipes', 'slug', 'cooking'?]
      if (parts.length >= 2) {
        const slug = decodeURIComponent(parts[1]);
        const subRoute = parts[2];
        if (subRoute === 'cooking') {
          setCurrentScreen('cooking');
        } else if (subRoute === 'celebration') {
          setCurrentScreen('celebration');
        } else {
          setCurrentScreen('overview');
        }
        // If it's a different slug than canonical default, trigger load
        if (slug && slug !== selectedRecipe.slug) {
          handleSelectOrGenerateRecipe({ id: slug, slug, name: slug });
        }
      }
    }
  }, []);

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t));
      // Re-evaluate blocked dependencies
      return updated.map((t) => {
        if (t.status === 'blocked' && t.prerequisite) {
          const prereqTask = updated.find((p) => p.id === t.prerequisite?.id);
          if (prereqTask && prereqTask.status === 'completed') {
            return { ...t, status: 'ready' as const };
          }
        }
        return t;
      });
    });

    // Advance to next ready task, or finish meal if this was the last task
    const currentIndex = tasks.findIndex((t) => t.id === taskId);
    if (currentIndex < tasks.length - 1) {
      setActiveTaskId(tasks[currentIndex + 1].id);
    } else {
      // Completed the final step: celebrate meal completion!
      navigateToScreen('celebration');
    }
  };

  const handleSaveEditedWorkflow = (editedTasks: EditableTask[]) => {
    const converted: TaskCardProps[] = editedTasks.map((et) => {
      const prereq = editedTasks.find((p) => p.id === et.prerequisiteId);
      return {
        id: et.id,
        title: et.title,
        instructionPreview: et.instruction,
        phase: et.phase,
        status: 'ready',
        durationMinutes: et.estimatedMinutes,
        prerequisite: prereq
          ? {
              id: prereq.id,
              stepNumber: `Step ${editedTasks.indexOf(prereq) + 1}`,
              title: prereq.title,
            }
          : undefined,
      };
    });
    setTasks(converted);
    setIsEditorOpen(false);
  };

  return (
    <AppShell
      currentScreen={currentScreen}
      onNavigate={navigateToScreen}
      recipeTitle={selectedRecipe.name}
      activeSessionBadge={sessionBadge}
      isCookingMode={currentScreen === 'cooking'}
      onExitCooking={() => navigateToScreen('overview')}
    >
      {/* Screen 1: Recipe Library */}
      {currentScreen === 'library' && (
        <RecipeLibrary
          onSelectRecipe={(recipe) => handleSelectOrGenerateRecipe(recipe)}
          onOpenWorkflow={(recipeSlug) => {
            const found = { slug: recipeSlug, id: recipeSlug, name: recipeSlug };
            handleSelectOrGenerateRecipe(found);
          }}
        />
      )}

      {/* Screen 2: Recipe Overview & Staging */}
      {currentScreen === 'overview' && !isEditorOpen && (
        <RecipeOverview
          title={selectedRecipe.name}
          description={selectedRecipe.description}
          totalTime={selectedRecipe.totalTime}
          yieldServings={selectedRecipe.yieldServings}
          ingredients={selectedRecipe.ingredients}
          instructions={selectedRecipe.instructions}
          onStartCooking={() => navigateToScreen('cooking')}
          onEditWorkflow={() => setIsEditorOpen(true)}
        />
      )}

      {/* Workflow Step Customization Modal / View */}
      {isEditorOpen && (
        <WorkflowEditor
          recipeTitle={selectedRecipe.name}
          initialTasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            instruction: t.instructionPreview,
            phase: t.phase,
            estimatedMinutes: t.durationMinutes || 5,
            prerequisiteId: t.prerequisite?.id || null,
          }))}
          onSave={handleSaveEditedWorkflow}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}

      {/* Mode 2: Active Cooking Console (Countertop 70/30 Glanceable Deck) */}
      {currentScreen === 'cooking' && (
        <ActiveCookingConsole
          recipeTitle={selectedRecipe.name}
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectTask={setActiveTaskId}
          onCompleteTask={handleCompleteTask}
          onExitCooking={() => navigateToScreen('overview')}
        />
      )}

      {/* Screen 3: Meal Finished Celebration */}
      {currentScreen === 'celebration' && (
        <CookingCompleteCelebration
          recipeTitle={selectedRecipe.name}
          totalSteps={tasks.length}
          totalMinutes={selectedRecipe.totalTime}
          onCookAgain={() => {
            // Reset task states and restart cooking
            setTasks((prev) =>
              prev.map((t, idx) => ({
                ...t,
                status: idx === 0 ? 'ready' : (t.prerequisite ? 'blocked' : 'ready'),
              }))
            );
            setActiveTaskId(tasks[0]?.id || INITIAL_TASKS[0].id);
            navigateToScreen('cooking');
          }}
          onReturnToLibrary={() => navigateToScreen('library')}
        />
      )}
    </AppShell>
  );
};
export default App;
