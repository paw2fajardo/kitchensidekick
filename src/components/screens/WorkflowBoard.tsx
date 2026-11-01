import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  RotateCcw, 
  Check, 
  Clock, 
  ChefHat, 
  ArrowRight, 
  CheckSquare, 
  Square,
  Lock,
  Layers
} from 'lucide-react';
import { TaskCard } from '../TaskCard';
import type { TaskCardProps, PhaseType } from '../TaskCard';
import { TouchButton } from '../TouchPrimitives';
import { IngredientDrawer } from '../IngredientDrawer';
import type { IngredientDrawerItem } from '../IngredientDrawer';
import { playKitchenChime } from '../../lib/sound';

export interface WorkflowBoardProps {
  recipeTitle: string;
  tasks: TaskCardProps[];
  ingredients: IngredientDrawerItem[];
  onStartTask: (taskId: string) => void;
  onEnterFocusMode: (taskId?: string) => void;
  onToggleIngredient: (id: string) => void;
  onCompleteTask?: (taskId: string) => void;
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({
  recipeTitle,
  tasks,
  ingredients,
  onStartTask,
  onEnterFocusMode,
  onToggleIngredient,
  onCompleteTask,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Active Hero task determination
  // Priority: 1st task with 'in_progress', else 1st task with 'ready', else 1st incomplete task
  const [activeTaskId, setActiveTaskId] = useState<string>(() => {
    const inProg = tasks.find((t) => t.status === 'in_progress');
    if (inProg) return inProg.id;
    const ready = tasks.find((t) => t.status === 'ready');
    if (ready) return ready.id;
    const pending = tasks.find((t) => t.status !== 'completed');
    return pending?.id || tasks[0]?.id || '';
  });

  // Track verified ingredients in the hero card
  const [verifiedIngredients, setVerifiedIngredients] = useState<Record<string, boolean>>({});

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Hero Task Timer State
  const defaultSeconds = (activeTask?.durationMinutes || 3) * 60;
  const [timerRemaining, setTimerRemaining] = useState<number>(defaultSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Reset timer on active task change
  useEffect(() => {
    const secs = (activeTask?.durationMinutes || 3) * 60;
    setTimerRemaining(secs);
    setIsTimerRunning(false);
  }, [activeTask?.id, activeTask?.durationMinutes]);

  // Steady-state timer countdown (Zero continuous animation slop)
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          playKitchenChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Segregate parallel workstreams
  const prepTasks = tasks.filter((t) => t.phase === 'prep');
  const sauceTasks = tasks.filter((t) => t.phase === 'sauce');
  const cookingTasks = tasks.filter((t) => t.phase === 'cooking');

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const phaseBadgeColors: Record<PhaseType, { bg: string; text: string }> = {
    prep: { bg: 'bg-[#537B60]/15', text: 'text-[#537B60]' },
    sauce: { bg: 'bg-[#B17A3D]/15', text: 'text-[#8A5A22]' },
    cooking: { bg: 'bg-[#A65B45]/15', text: 'text-[#A65B45]' },
  };

  // Jump to prerequisite card anchor smoothly
  const handleSelectPrerequisite = (prereqId: string) => {
    setActiveTaskId(prereqId);
    const el = document.getElementById(`card-${prereqId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#245C43]');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[#245C43]'), 2000);
    }
  };

  // 5-second non-blocking Undo Toast State
  const [undoToast, setUndoToast] = useState<{ taskId: string; title: string } | null>(null);

  const handleHeroCompleteAndAdvance = () => {
    if (!activeTask) return;

    const completedId = activeTask.id;
    const completedTitle = activeTask.title;

    if (onCompleteTask) {
      onCompleteTask(completedId);
    }
    playKitchenChime();

    // Trigger non-blocking 5-second Undo toast
    setUndoToast({ taskId: completedId, title: completedTitle });

    // Advance to next available ready or pending task
    const currentIndex = tasks.findIndex((t) => t.id === activeTask.id);
    const remainingTasks = tasks.slice(currentIndex + 1).concat(tasks.slice(0, currentIndex));
    const nextTask = remainingTasks.find((t) => t.status !== 'completed' && t.id !== activeTask.id);

    if (nextTask) {
      setActiveTaskId(nextTask.id);
    }
  };

  // Auto-dismiss undo toast after 5 seconds
  useEffect(() => {
    if (!undoToast) return;
    const timer = setTimeout(() => {
      setUndoToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
      {/* Top Workflow Bar */}
      <div className="p-4 md:p-6 border-b border-[#D9DDD4] bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-[6px] bg-[#E4EEE7] text-[#245C43] text-[12px] font-semibold border border-[#245C43]/20">
              The Culinary Flow Model
            </span>
            <span className="text-[13px] text-[#5F675F]">
              {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
            </span>
          </div>
          <h2 className="text-[22px] md:text-[26px] font-bold text-[#20251F] tracking-tight">
            {recipeTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Secondary buttons use white/neutral styling to enforce EXACTLY ONE primary green CTA on screen */}
          <TouchButton
            variant="secondary"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="min-h-[48px]"
          >
            <ChefHat className="w-4 h-4 mr-1.5" />
            <span>Mise en Place ({ingredients.filter((i) => i.isPrepared).length}/{ingredients.length})</span>
          </TouchButton>

          <TouchButton
            variant="secondary"
            onClick={() => onEnterFocusMode(activeTaskId)}
            className="min-h-[48px]"
          >
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            <span>Full Focus Mode</span>
          </TouchButton>
        </div>
      </div>

      {/* Main Container with Optional Mise en Place Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F5F5F0] space-y-6">

          {/* ======================================================== */}
          {/* ZONE 1: TOP ZONE - HERO ACTIVE TASK CARD (DESIGN.md Sec 4) */}
          {/* ======================================================== */}
          {activeTask && (
            <section 
              aria-label="Active Cooking Step" 
              className="rounded-[16px] bg-[#FFFFFF] border border-[#D9DDD4] p-6 md:p-8 shadow-none transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#D9DDD4]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-[6px] text-[13px] font-bold uppercase tracking-wider ${phaseBadgeColors[activeTask.phase].bg} ${phaseBadgeColors[activeTask.phase].text}`}>
                    {activeTask.phase} Phase
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#ECEDE7] text-[#20251F] text-[13px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#5F675F]" />
                    {activeTask.durationMinutes || 3} min
                  </span>

                  {activeTask.status === 'blocked' && activeTask.prerequisite && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FDF4E7] text-[#8A4E0B] text-[13px] font-semibold border border-[#D9DDD4]">
                      <Lock className="w-3.5 h-3.5" />
                      Prerequisite Blocked
                    </span>
                  )}
                </div>

                {/* Glanceable Steady-State Timer (Zero continuous animations) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-2 bg-[#F5F5F0] border border-[#D9DDD4] px-4 py-2 rounded-[10px]">
                    <span className="text-[28px] md:text-[32px] font-mono font-bold text-[#20251F] leading-none">
                      {formatTimer(timerRemaining)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#5F675F] uppercase">
                      {timerRemaining === 0 ? 'Done' : isTimerRunning ? 'Active' : 'Timer'}
                    </span>
                  </div>

                  <TouchButton
                    variant="secondary"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="min-h-[48px] px-3.5"
                    aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </TouchButton>

                  <TouchButton
                    variant="secondary"
                    onClick={() => setTimerRemaining((s) => s + 30)}
                    className="min-h-[48px] px-3"
                    aria-label="Add 30 seconds"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-[13px]">30s</span>
                  </TouchButton>

                  <TouchButton
                    variant="ghost"
                    onClick={() => {
                      setTimerRemaining((activeTask.durationMinutes || 3) * 60);
                      setIsTimerRunning(false);
                    }}
                    className="min-h-[48px] px-2.5"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#5F675F]" />
                  </TouchButton>
                </div>
              </div>

              {/* Headline & 22px Glanceable Instruction */}
              <div className="mb-6">
                <h3 className="text-[20px] md:text-[24px] font-bold text-[#20251F] tracking-tight mb-2">
                  {activeTask.title}
                </h3>
                <p className="text-[20px] md:text-[22px] font-medium text-[#20251F] leading-relaxed">
                  {activeTask.instructionPreview}
                </p>
              </div>

              {/* Step-Specific Ingredients with Tap-to-Verify Checkboxes */}
              {activeTask.ingredients && activeTask.ingredients.length > 0 && (
                <div className="mb-6">
                  <span className="text-[13px] font-bold text-[#5F675F] uppercase tracking-wider block mb-2">
                    Verify Step Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {activeTask.ingredients.map((ing) => {
                      const isVerified = Boolean(verifiedIngredients[ing.id]);
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() =>
                            setVerifiedIngredients((prev) => ({
                              ...prev,
                              [ing.id]: !prev[ing.id],
                            }))
                          }
                          className={`min-h-[48px] px-3.5 py-2 rounded-[8px] border text-[15px] font-medium inline-flex items-center gap-2 transition-colors select-none ${
                            isVerified
                              ? 'bg-[#E4EEE7] border-[#245C43] text-[#245C43]'
                              : 'bg-[#F5F5F0] border-[#D9DDD4] text-[#20251F] hover:bg-[#E2E4DC]'
                          }`}
                        >
                          {isVerified ? (
                            <CheckSquare className="w-4 h-4 text-[#245C43]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8E968E]" />
                          )}
                          <span className={isVerified ? 'line-through text-[#5F675F]' : ''}>{ing.name}</span>
                          {ing.quantity && <span className="font-semibold text-[#245C43]">({ing.quantity})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Blocked Prerequisite Alert if applicable */}
              {activeTask.status === 'blocked' && activeTask.prerequisite && (
                <div className="mb-6 p-4 rounded-[10px] bg-[#FDF4E7] border border-[#D9DDD4] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#8A4E0B]">
                    <Lock className="w-5 h-5 shrink-0" />
                    <span className="text-[15px] font-medium">
                      Waiting for prerequisite: <strong>{activeTask.prerequisite.title}</strong>
                    </span>
                  </div>
                  <TouchButton
                    variant="override"
                    onClick={() => handleSelectPrerequisite(activeTask.prerequisite!.id)}
                    className="min-h-[48px] text-[14px]"
                  >
                    <span>Jump to Prerequisite</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </TouchButton>
                </div>
              )}

              {/* SINGLE PRIMARY 56PX COMPLETION CTA (Canonical #245C43) */}
              <div className="pt-4 border-t border-[#D9DDD4] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[14px] text-[#5F675F]">
                  Step {tasks.findIndex((t) => t.id === activeTask.id) + 1} of {tasks.length} in active workflow
                </span>

                <TouchButton
                  variant="primary"
                  isCTA
                  onClick={handleHeroCompleteAndAdvance}
                  className="w-full sm:w-auto min-h-[56px] px-8 text-[18px]"
                >
                  <Check className="w-5 h-5 mr-2 stroke-[3]" />
                  <span>Mark Complete & Advance</span>
                </TouchButton>
              </div>
            </section>
          )}

          {/* ======================================================== */}
          {/* ZONE 2: BOTTOM ZONE - PARALLEL WORKSTREAMS (DE-NESTED)   */}
          {/* ======================================================== */}
          <section aria-label="Parallel Cooking Workstreams">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#5F675F]" />
              <h4 className="text-[16px] font-bold text-[#20251F] uppercase tracking-wider">
                Parallel Workstreams & Next Steps
              </h4>
            </div>

            {/* De-nested flat columns without inner gray boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Lane 1: Prep Lane */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b-2 border-[#537B60]">
                  <span className="font-bold text-[16px] text-[#20251F]">1. Prep Tasks</span>
                  <span className="text-[13px] font-semibold text-[#5F675F]">
                    {prepTasks.filter((t) => t.status === 'completed').length}/{prepTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {prepTasks.map((task) => (
                    <div
                      key={task.id}
                      id={`card-${task.id}`}
                      onClick={() => setActiveTaskId(task.id)}
                      className={`cursor-pointer transition-all ${
                        task.id === activeTaskId ? 'ring-2 ring-[#245C43] rounded-[12px]' : ''
                      }`}
                    >
                      <TaskCard
                        {...task}
                        onStart={(id) => {
                          setActiveTaskId(id);
                          onStartTask(id);
                        }}
                        onSelectPrerequisite={handleSelectPrerequisite}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane 2: Sauce Lane */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b-2 border-[#B17A3D]">
                  <span className="font-bold text-[16px] text-[#20251F]">2. Sauce Tasks</span>
                  <span className="text-[13px] font-semibold text-[#5F675F]">
                    {sauceTasks.filter((t) => t.status === 'completed').length}/{sauceTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sauceTasks.map((task) => (
                    <div
                      key={task.id}
                      id={`card-${task.id}`}
                      onClick={() => setActiveTaskId(task.id)}
                      className={`cursor-pointer transition-all ${
                        task.id === activeTaskId ? 'ring-2 ring-[#245C43] rounded-[12px]' : ''
                      }`}
                    >
                      <TaskCard
                        {...task}
                        onStart={(id) => {
                          setActiveTaskId(id);
                          onStartTask(id);
                        }}
                        onSelectPrerequisite={handleSelectPrerequisite}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Lane 3: Cooking Lane */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b-2 border-[#A65B45]">
                  <span className="font-bold text-[16px] text-[#20251F]">3. Cooking Tasks</span>
                  <span className="text-[13px] font-semibold text-[#5F675F]">
                    {cookingTasks.filter((t) => t.status === 'completed').length}/{cookingTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cookingTasks.map((task) => (
                    <div
                      key={task.id}
                      id={`card-${task.id}`}
                      onClick={() => setActiveTaskId(task.id)}
                      className={`cursor-pointer transition-all ${
                        task.id === activeTaskId ? 'ring-2 ring-[#245C43] rounded-[12px]' : ''
                      }`}
                    >
                      <TaskCard
                        {...task}
                        onStart={(id) => {
                          setActiveTaskId(id);
                          onStartTask(id);
                        }}
                        onSelectPrerequisite={handleSelectPrerequisite}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Collapsible Mise en Place Ingredient Drawer */}
        <IngredientDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ingredients={ingredients}
          onToggleIngredient={onToggleIngredient}
          onJumpToTask={(taskId) => {
            handleSelectPrerequisite(taskId);
            setDrawerOpen(false);
          }}
        />
      </div>

      {/* Non-blocking 5-second Undo Completion Toast */}
      {undoToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#20251F] text-[#FFFFFF] px-5 py-3 rounded-[12px] shadow-2xl flex items-center gap-4 border border-[#D9DDD4]/20 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#287A4B] stroke-[3]" />
            <span className="text-[15px] font-medium">
              Completed &ldquo;{undoToast.title}&rdquo;
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onCompleteTask) {
                // Toggle task back from completed to ready
                const target = tasks.find((t) => t.id === undoToast.taskId);
                if (target) {
                  onStartTask(target.id);
                  setActiveTaskId(target.id);
                }
              }
              setUndoToast(null);
            }}
            className="min-h-[44px] px-3.5 py-1.5 rounded-[8px] bg-[#FFFFFF] text-[#20251F] text-[14px] font-bold hover:bg-[#ECEDE7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
          >
            Undo
          </button>
        </aside>
      )}
    </div>
  );
};
