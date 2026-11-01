import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';
import type { TaskCardProps, PhaseType } from '../TaskCard';
import { playKitchenChime } from '../../lib/sound';
import { useWakeLock } from '../../lib/useWakeLock';

export interface FocusModeProps {
  tasks: TaskCardProps[];
  initialTaskId?: string;
  onCompleteTask: (taskId: string) => void;
  onExitFocus: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  tasks,
  initialTaskId,
  onCompleteTask,
  onExitFocus,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    if (initialTaskId) {
      const idx = tasks.findIndex((t) => t.id === initialTaskId);
      if (idx !== -1) return idx;
    }
    const firstActive = tasks.findIndex((t) => t.status === 'ready' || t.status === 'in_progress');
    return firstActive !== -1 ? firstActive : 0;
  });

  const currentTask = tasks[currentIdx] || tasks[0];

  // Stage timer logic
  const defaultSeconds = (currentTask?.durationMinutes || 2) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState<number>(defaultSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasFlipped, setHasFlipped] = useState<boolean>(false);

  // Screen WakeLock integration
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, requestLock, releaseLock } = useWakeLock();

  useEffect(() => {
    // Automatically engage screen wakeLock when entering Focus Mode
    requestLock().catch(() => {});
    return () => {
      releaseLock().catch(() => {});
    };
  }, [requestLock, releaseLock]);

  // Reset timer on task switch
  useEffect(() => {
    const secs = (currentTask?.durationMinutes || 2) * 60;
    setRemainingSeconds(secs);
    setIsRunning(false);
    setHasFlipped(false);
  }, [currentTask?.id, currentTask?.durationMinutes]);

  // Countdown clock effect
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          playKitchenChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentIdx < tasks.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const phaseBadgeColors: Record<PhaseType, string> = {
    prep: 'bg-[#537B60] text-[#FFFFFF]',
    sauce: 'bg-[#B17A3D] text-[#FFFFFF]',
    cooking: 'bg-[#A65B45] text-[#FFFFFF]',
  };

  const isCompleted = currentTask?.status === 'completed';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      {/* Top Controls Bar */}
      <div className="p-4 md:p-6 border-b border-[#D9DDD4] bg-[#FFFFFF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <TouchButton variant="secondary" onClick={onExitFocus} className="min-h-[44px]">
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Back to Board</span>
          </TouchButton>

          <span className={`px-3 py-1 rounded-[6px] text-[13px] font-bold uppercase tracking-wider ${phaseBadgeColors[currentTask?.phase || 'prep']}`}>
            Phase {currentTask?.phase}
          </span>
        </div>

        {/* Step Indicator & WakeLock Badge */}
        <div className="flex items-center gap-3">
          {wakeLockSupported && !wakeLockActive && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#FDF4E7] text-[#A86416] text-[12px] font-medium border border-[#D9DDD4]">
              <ShieldAlert className="w-3.5 h-3.5" />
              Screen lock inactive
            </span>
          )}

          <span className="text-[15px] font-semibold text-[#5F675F]">
            Step {currentIdx + 1} of {tasks.length}
          </span>
        </div>
      </div>

      {/* Primary Arm's-Length Focus Sheet */}
      <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col justify-between">
        <div>
          {/* Title */}
          <h2 className="text-[26px] md:text-[32px] font-bold text-[#20251F] tracking-tight leading-snug mb-4">
            {currentTask?.title}
          </h2>

          {/* Primary 22px High-Legibility Instruction Text */}
          <div className="p-6 rounded-[12px] bg-[#F5F5F0] border border-[#D9DDD4] mb-8">
            <p className="text-[20px] md:text-[24px] font-medium text-[#20251F] leading-relaxed">
              {currentTask?.instructionPreview}
            </p>
          </div>

          {/* Ingredients Needed for this Step */}
          {currentTask?.ingredients && currentTask.ingredients.length > 0 && (
            <div className="mb-8">
              <span className="text-[13px] font-bold text-[#5F675F] uppercase tracking-wider block mb-2">
                Ingredients for this step:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentTask.ingredients.map((ing) => (
                  <span
                    key={ing.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FFFFFF] border border-[#D9DDD4] text-[15px] font-medium text-[#20251F]"
                  >
                    <span>{ing.name}</span>
                    {ing.quantity && <span className="font-bold text-[#245C43]">{ing.quantity}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sequential Stage Timer Display */}
          <div className="p-6 rounded-[12px] border border-[#D9DDD4] bg-[#FFFFFF] flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="block text-[44px] md:text-[54px] font-mono font-bold text-[#20251F] leading-none tracking-tight">
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-[13px] text-[#5F675F] font-medium">
                  {remainingSeconds === 0 ? 'Timer Finished!' : isRunning ? 'Countdown in progress' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Timer Actions: Pause / Resume / +30s / Flip */}
            <div className="flex flex-wrap items-center gap-3">
              <TouchButton
                variant={isRunning ? 'secondary' : 'primary'}
                onClick={() => setIsRunning(!isRunning)}
                className="min-h-[48px]"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-1" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-1 fill-current" />
                    <span>Start Timer</span>
                  </>
                )}
              </TouchButton>

              <TouchButton
                variant="secondary"
                onClick={() => setRemainingSeconds((s) => s + 30)}
                className="min-h-[48px]"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>+30s</span>
              </TouchButton>

              <TouchButton
                variant="override"
                onClick={() => {
                  setHasFlipped(!hasFlipped);
                  playKitchenChime();
                }}
                className="min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span>{hasFlipped ? 'Flipped ✓' : 'Tactile Flip'}</span>
              </TouchButton>

              <TouchButton
                variant="ghost"
                onClick={() => {
                  setRemainingSeconds((currentTask?.durationMinutes || 2) * 60);
                  setIsRunning(false);
                }}
                className="min-h-[48px]"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </TouchButton>
            </div>
          </div>
        </div>

        {/* Persistent Bottom Execution Bar (>=56px Primary CTA & Prev/Next) */}
        <div className="pt-6 border-t border-[#D9DDD4] flex items-center justify-between gap-4">
          <TouchButton
            variant="secondary"
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="min-h-[56px] text-[16px]"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Previous</span>
          </TouchButton>

          <TouchButton
            variant="primary"
            isCTA
            disabled={isCompleted}
            onClick={() => {
              if (currentTask) {
                onCompleteTask(currentTask.id);
                playKitchenChime();
                if (currentIdx < tasks.length - 1) {
                  setCurrentIdx(currentIdx + 1);
                }
              }
            }}
            className="flex-1 max-w-md min-h-[56px]"
          >
            <Check className="w-6 h-6 mr-2 stroke-[3]" />
            <span>{isCompleted ? 'Step Completed' : 'Complete Step & Advance'}</span>
          </TouchButton>

          <TouchButton
            variant="secondary"
            disabled={currentIdx === tasks.length - 1}
            onClick={handleNext}
            className="min-h-[56px] text-[16px]"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5 ml-1" />
          </TouchButton>
        </div>
      </div>
    </div>
  );
};
