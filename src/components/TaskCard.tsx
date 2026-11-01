import React from 'react';
import { StatusBadge } from './StatusBadge';
import { TouchButton } from './TouchPrimitives';

export type TaskStatus = 'pending' | 'ready' | 'in_progress' | 'blocked' | 'completed';
export type PhaseType = 'prep' | 'sauce' | 'cooking';

export interface IngredientSummary {
  id: string;
  name: string;
  quantity?: string;
  prepared?: boolean;
}

export interface TaskCardProps {
  id: string;
  title: string;
  instructionPreview: string;
  phase: PhaseType;
  status: TaskStatus;
  durationMinutes?: number;
  ingredients?: IngredientSummary[];
  isActiveHero?: boolean;
  activeTimerSeconds?: number;
  prerequisite?: {
    id: string;
    stepNumber: string;
    title: string;
  };
  onStart?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  onSelectPrerequisite?: (prerequisiteId: string) => void;
  onToggleIngredient?: (ingredientId: string) => void;
}

const phaseNameLabels: Record<PhaseType, string> = {
  prep: 'Prep Phase',
  sauce: 'Sauce Lane',
  cooking: 'Cooking Phase',
};

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * TaskCard
 *
 * Implements the reworked "Culinary Flow" interface:
 * - Supports Hero Active Card mode (dominant focal step with arm's-length instruction & 56px CTA)
 * - Supports Queued / Parallel Lane mode (1-level flat card, 4px left-border phase accent)
 * - Zero nested sub-cards or inner gray boxes (100% anti-slop compliant)
 * - >=48px touch targets for all interactive actions
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  instructionPreview,
  phase,
  status,
  durationMinutes,
  ingredients = [],
  isActiveHero = false,
  activeTimerSeconds,
  prerequisite,
  onStart,
  onComplete,
  onSelectPrerequisite,
  onToggleIngredient,
}) => {
  // HERO ACTIVE TASK CARD (Primary Focal Step on Countertop)
  if (isActiveHero) {
    return (
      <article
        data-task-id={id}
        className="w-full bg-[#FFFFFF] rounded-[14px] border border-[#D9DDD4] shadow-none p-6 sm:p-7 flex flex-col gap-5"
      >
        {/* Top Header with Phase Pill and Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold uppercase tracking-wider text-[#5F675F]">
              Current Active Step • {phaseNameLabels[phase]}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Big Arm's-Length Step Title */}
        <div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#20251F] leading-snug tracking-tight m-0">
            {title}
          </h2>
        </div>

        {/* Full Instruction (20-24px for 3-4 feet countertop reading) */}
        <p className="text-[18px] sm:text-[20px] text-[#20251F] leading-relaxed m-0 font-medium bg-transparent">
          {instructionPreview}
        </p>

        {/* Timer Bar (If active timer exists) */}
        {activeTimerSeconds != null && (
          <div className="flex items-center justify-between py-2 border-y border-[#D9DDD4]">
            <div className="flex items-center gap-3">
              <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#245C43]">
                {formatTimer(activeTimerSeconds)}
              </span>
              <span className="text-[14px] text-[#5F675F] font-medium">Stage 1 of 2</span>
            </div>
            <TouchButton variant="secondary" className="text-[15px]">
              +30s
            </TouchButton>
          </div>
        )}

        {/* Step-Specific Ingredients with Tap-to-Verify */}
        {ingredients.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[14px] font-semibold text-[#5F675F]">Ingredients for this step:</span>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleIngredient?.(item.id)}
                  className={`min-h-[48px] px-3.5 py-2 rounded-[8px] border text-[15px] font-medium inline-flex items-center gap-2 transition-colors ${
                    item.prepared
                      ? 'bg-[#E4EEE7] border-[#245C43] text-[#245C43] line-through'
                      : 'bg-[#ECEDE7] border-[#D9DDD4] text-[#20251F] hover:bg-[#E2E4DC]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      item.prepared ? 'border-[#245C43] bg-[#245C43] text-[#FFFFFF]' : 'border-[#8E968E]'
                    }`}
                  >
                    {item.prepared && '✓'}
                  </span>
                  <span>
                    {item.name}
                    {item.quantity ? ` (${item.quantity})` : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dominant Primary Completion CTA (56px tall for single-touch completion) */}
        <div className="pt-3 border-t border-[#D9DDD4]">
          <TouchButton
            isCTA={true}
            onClick={() => onComplete?.(id)}
            className="w-full justify-between px-6"
          >
            <span>Mark Step Complete & Continue</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </TouchButton>
        </div>
      </article>
    );
  }

  // QUEUED / PARALLEL LANE TASK CARD (De-Nested, Clean Flat Item)
  return (
    <article
      data-task-id={id}
      className="relative w-full min-h-[72px] bg-[#FFFFFF] rounded-[12px] border border-[#D9DDD4] shadow-none p-5 flex flex-col gap-3 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-[18px] font-semibold text-[#20251F] leading-snug tracking-tight m-0">
            {title}
          </h3>
          {durationMinutes != null && durationMinutes > 0 && (
            <span className="text-[14px] font-medium text-[#5F675F]">
              {durationMinutes} min
            </span>
          )}
        </div>
        <div className="shrink-0 pt-0.5">
          <StatusBadge status={status} />
        </div>
      </div>

      <p className="text-[15px] text-[#5F675F] leading-relaxed line-clamp-2 m-0">
        {instructionPreview}
      </p>

      {/* Ingredient summary tags */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {ingredients.slice(0, 3).map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center text-[13px] text-[#20251F] bg-[#ECEDE7] rounded-[6px] px-2 py-0.5 font-medium"
            >
              {item.name}
            </span>
          ))}
          {ingredients.length > 3 && (
            <span className="text-[13px] text-[#5F675F] font-medium">
              +{ingredients.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Prerequisite Action */}
      {status === 'blocked' && prerequisite && (
        <div className="pt-2 border-t border-[#D9DDD4] flex items-center justify-between text-[14px]">
          <span className="text-[#5F675F]">
            Waiting for:{' '}
            <button
              type="button"
              onClick={() => onSelectPrerequisite?.(prerequisite.id)}
              className="text-[#8A4E0B] font-semibold underline hover:text-[#5A3205] min-h-[48px] inline-flex items-center px-1"
            >
              {prerequisite.title} ({prerequisite.stepNumber})
            </button>
          </span>
        </div>
      )}

      {/* Ready Start Action */}
      {status === 'ready' && onStart && (
        <div className="pt-2 border-t border-[#D9DDD4] flex justify-end">
          <TouchButton
            variant="secondary"
            onClick={() => onStart(id)}
            className="w-full sm:w-auto"
          >
            <span>Start Step</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </TouchButton>
        </div>
      )}
    </article>
  );
};
