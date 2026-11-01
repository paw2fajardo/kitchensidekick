import React from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  RotateCcw, 
  Check, 
  Clock, 
  Lock,
  Layers,
  ArrowLeft
} from 'lucide-react';
import type { TaskCardProps, PhaseType } from '../TaskCard';
import { TouchButton } from '../TouchPrimitives';
import { useTimerStore } from '../../stores/timerStore';

export interface ActiveCookingConsoleProps {
  recipeTitle: string;
  tasks: TaskCardProps[];
  activeTaskId: string;
  onSelectTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onExitCooking: () => void;
}

const PHASE_NAMES: Record<PhaseType, string> = {
  prep: 'Prep Phase',
  sauce: 'Sauce & Base',
  cooking: 'Cooking & Simmer',
};

export const ActiveCookingConsole: React.FC<ActiveCookingConsoleProps> = ({
  recipeTitle,
  tasks,
  activeTaskId,
  onSelectTask,
  onCompleteTask,
  onExitCooking,
}) => {
  const currentTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const currentIndex = tasks.findIndex((t) => t.id === currentTask?.id);

  // Bind to central timerStore
  const activeTimers = useTimerStore((s) => s.activeTimers);
  const setTimer = useTimerStore((s) => s.setTimer);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const extendTimer = useTimerStore((s) => s.extendTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);

  // Initialize or fetch timer for the active task
  const taskTimer = activeTimers[currentTask?.id];
  const durationSecs = (currentTask?.durationMinutes || 3) * 60;

  React.useEffect(() => {
    if (!currentTask) return;
    if (!activeTimers[currentTask.id]) {
      setTimer({
        id: currentTask.id,
        taskId: currentTask.id,
        stageName: currentTask.title,
        durationSeconds: durationSecs,
        remainingSeconds: durationSecs,
        isRunning: false,
        isPaused: false,
        isCompleted: false,
        isOvertime: false,
        totalStages: 1,
        currentStageIndex: 0,
      });
    }
  }, [currentTask?.id, durationSecs, activeTimers, setTimer]);

  const remainingSeconds = taskTimer ? taskTimer.remainingSeconds : durationSecs;
  const isRunning = taskTimer ? taskTimer.isRunning && !taskTimer.isPaused : false;
  const isOvertime = taskTimer ? taskTimer.isOvertime || remainingSeconds <= 0 : false;

  const formatTimer = (secs: number) => {
    const isNeg = secs < 0;
    const abs = Math.abs(secs);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isNeg ? `+${formatted}` : formatted;
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
      {/* Active Cooking Header Bar */}
      <div className="h-16 border-b border-[#D9DDD4] bg-[#F5F5F0] px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <TouchButton
            variant="secondary"
            onClick={onExitCooking}
            className="min-h-[48px] px-3 py-2 text-[#5F675F] hover:text-[#20251F] border border-[#D9DDD4] bg-[#FFFFFF] rounded-[10px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span className="text-[14px] font-semibold">Exit Cooking</span>
          </TouchButton>
          <div className="hidden sm:block">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F]">
              Cooking Session
            </span>
            <p className="text-[15px] font-bold text-[#20251F] truncate max-w-[280px] md:max-w-[400px]">
              {recipeTitle}
            </p>
          </div>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[12px] font-bold text-[#5F675F] uppercase tracking-wider">
              Step {currentIndex + 1} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 md:w-36 h-2 bg-[#D9DDD4] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#245C43] transition-all duration-300" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[13px] font-mono font-bold text-[#20251F]">
                {progressPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 70/30 Countertop Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left 70%: Active Step Command Deck */}
        <div className="flex-1 lg:w-[68%] p-4 md:p-8 flex flex-col justify-between overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#D9DDD4]">
          <div className="space-y-6 max-w-[900px]">
            {/* Step Phase & Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-[13px] font-bold uppercase tracking-wider bg-[#E4EEE7] text-[#245C43]">
                {PHASE_NAMES[currentTask?.phase || 'prep']}
              </span>
              <span className="text-[14px] font-medium text-[#5F675F]">
                Estimated: {currentTask?.durationMinutes || 3} min
              </span>
            </div>

            {/* Prominent Task Title & Instruction (Arm's length viewing 24px+) */}
            <div className="space-y-3">
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#20251F] leading-tight tracking-tight">
                {currentTask?.title}
              </h1>
              <p className="text-[18px] md:text-[22px] text-[#20251F] leading-relaxed font-normal bg-[#F5F5F0] p-5 rounded-[12px] border border-[#D9DDD4]">
                {currentTask?.instructionPreview}
              </p>
            </div>

            {/* Ingredients for this step */}
            {currentTask?.ingredients && currentTask.ingredients.length > 0 && (
              <div className="space-y-3">
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F]">
                  Mise en place for this step:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {currentTask.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="min-h-[48px] px-4 py-2.5 rounded-[10px] bg-[#FFFFFF] border border-[#D9DDD4] flex items-center gap-2.5 text-[15px] font-medium text-[#20251F]"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#245C43]" />
                      <span className="font-semibold">{ing.name}</span>
                      <span className="text-[#5F675F]">({ing.quantity})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Centralized High-Contrast Countdown Timer */}
            <div className={`p-6 rounded-[14px] border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isOvertime 
                ? 'bg-[#FDF4E7] border-[#A86416]' 
                : 'bg-[#F0F2EB] border-[#D9DDD4]'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-[#FFFFFF] border border-[#D9DDD4] flex items-center justify-center shrink-0">
                  <Clock className={`w-6 h-6 ${isOvertime ? 'text-[#A86416]' : 'text-[#245C43]'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F]">
                      Step Timer
                    </span>
                    {isOvertime && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold uppercase bg-[#A86416]/15 text-[#8A4E0B]">
                        Overtime
                      </span>
                    )}
                  </div>
                  <div className={`font-mono text-[40px] md:text-[48px] font-bold leading-none tracking-tight ${
                    isOvertime ? 'text-[#A86416]' : 'text-[#20251F]'
                  }`}>
                    {formatTimer(remainingSeconds)}
                  </div>
                </div>
              </div>

              {/* Fat-finger Touch Timer Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <TouchButton
                  onClick={() => {
                    if (isRunning) {
                      pauseTimer(currentTask.id);
                    } else {
                      startTimer(currentTask.id);
                    }
                  }}
                  className={`flex-1 sm:flex-none min-h-[56px] min-w-[120px] px-6 rounded-[12px] text-[16px] font-bold flex items-center justify-center gap-2 ${
                    isRunning
                      ? 'bg-[#FFFFFF] text-[#20251F] border border-[#D9DDD4] hover:bg-[#E6E8E2]'
                      : 'bg-[#245C43] text-[#FFFFFF] hover:bg-[#1B4532]'
                  }`}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
                </TouchButton>

                <TouchButton
                  onClick={() => extendTimer(currentTask.id, 60)}
                  className="min-h-[56px] px-4 rounded-[12px] bg-[#FFFFFF] border border-[#D9DDD4] text-[#20251F] hover:bg-[#E6E8E2] text-[15px] font-bold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  +1 min
                </TouchButton>

                <TouchButton
                  onClick={() => resetTimer(currentTask.id)}
                  className="min-h-[56px] px-4 rounded-[12px] bg-[#FFFFFF] border border-[#D9DDD4] text-[#5F675F] hover:text-[#20251F] hover:bg-[#E6E8E2]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </TouchButton>
              </div>
            </div>
          </div>

          {/* Primary Arm's-Length Completion CTA (Strictly >= 56px height) */}
          <div className="pt-6 mt-6 border-t border-[#D9DDD4]">
            <TouchButton
              onClick={() => onCompleteTask(currentTask.id)}
              className="w-full min-h-[60px] md:min-h-[64px] bg-[#245C43] hover:bg-[#1B4532] text-[#FFFFFF] rounded-[14px] text-[18px] md:text-[20px] font-bold flex items-center justify-center gap-3 shadow-none transition-colors"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>
                {currentIndex === tasks.length - 1
                  ? 'Complete Last Step & Finish Meal'
                  : 'Mark Step Complete & Advance'}
              </span>
            </TouchButton>
          </div>
        </div>

        {/* Right 30%: Chronological Sequential Queue ("Up Next") */}
        <div className="w-full lg:w-[32%] bg-[#F5F5F0] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#D9DDD4] flex items-center justify-between bg-[#F5F5F0]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#245C43]" />
              <h2 className="text-[14px] font-bold uppercase tracking-wider text-[#20251F]">
                Recipe Timeline
              </h2>
            </div>
            <span className="text-[12px] font-semibold text-[#5F675F]">
              {completedCount}/{totalCount} Completed
            </span>
          </div>

          {/* Scrollable list of chronological steps */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {tasks.map((task, idx) => {
              const isActive = task.id === currentTask?.id;
              const isCompleted = task.status === 'completed';
              const isBlocked = task.status === 'blocked';

              return (
                <div
                  key={task.id}
                  onClick={() => !isBlocked && onSelectTask(task.id)}
                  className={`p-3.5 rounded-[12px] border transition-all text-left relative ${
                    isActive
                      ? 'bg-[#FFFFFF] border-[#245C43] ring-2 ring-[#245C43] shadow-none'
                      : isCompleted
                      ? 'bg-[#EAECE6] border-[#D9DDD4] opacity-75'
                      : isBlocked
                      ? 'bg-[#EFEFEA] border-[#D9DDD4] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFFFF] border-[#D9DDD4] hover:border-[#245C43] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F675F]">
                      Step {idx + 1} · {PHASE_NAMES[task.phase]}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#287A4B] bg-[#E4EEE7] px-2 py-0.5 rounded">
                        <Check className="w-3 h-3 stroke-[3]" /> Done
                      </span>
                    ) : isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A4E0B] bg-[#FDF4E7] px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> Blocked
                      </span>
                    ) : (
                      <span className="text-[12px] font-medium text-[#5F675F]">
                        {task.durationMinutes}m
                      </span>
                    )}
                  </div>

                  <h3 className={`text-[15px] font-bold leading-snug ${
                    isActive ? 'text-[#20251F]' : isCompleted ? 'text-[#5F675F] line-through' : 'text-[#20251F]'
                  }`}>
                    {task.title}
                  </h3>

                  {isBlocked && task.prerequisite && (
                    <div className="mt-2 text-[12px] text-[#8A4E0B] flex items-center gap-1">
                      <span>Requires:</span>
                      <span className="font-semibold truncate">{task.prerequisite.title}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
