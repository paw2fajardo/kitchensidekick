import React from 'react';
import { CheckCircle2, RotateCcw, BookOpen } from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';

export interface CookingCompleteCelebrationProps {
  recipeTitle: string;
  totalSteps: number;
  totalMinutes?: string | number;
  onCookAgain: () => void;
  onReturnToLibrary: () => void;
}

export const CookingCompleteCelebration: React.FC<CookingCompleteCelebrationProps> = ({
  recipeTitle,
  totalSteps,
  totalMinutes = 35,
  onCookAgain,
  onReturnToLibrary,
}) => {
  return (
    <div id="celebration-root" className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center bg-[#FFFFFF] overflow-y-auto">
      <div id="celebration-container" className="max-w-xl w-full flex flex-col items-center">
        {/* Celebration Badge */}
        <div id="celebration-badge-icon" className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#E4EEE7] text-[#245C43] flex items-center justify-center mb-6 border border-[#245C43]/20">
          <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 stroke-[2.5]" />
        </div>

        <span id="celebration-badge-text" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#E4EEE7] text-[#245C43] text-[13px] font-bold uppercase tracking-wider mb-3">
          Session Completed
        </span>

        <h1 id="celebration-title" className="text-[28px] md:text-[38px] font-bold text-[#20251F] tracking-tight leading-tight mb-3">
          Meal Finished!
        </h1>

        <p id="celebration-description" className="text-[17px] md:text-[20px] text-[#5F675F] leading-relaxed mb-8">
          You've completed all {totalSteps} cooking and prep steps for <span className="font-semibold text-[#20251F]">{recipeTitle}</span>. Time to serve and enjoy!
        </p>

        {/* Summary Card */}
        <div id="celebration-summary-card" className="w-full bg-[#F5F5F0] border border-[#D9DDD4] rounded-[14px] p-6 mb-8 grid grid-cols-2 gap-4">
          <div className="text-center border-r border-[#D9DDD4] pr-4">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F] block mb-1">
              Steps Executed
            </span>
            <span id="celebration-steps-count" className="text-[28px] font-bold text-[#20251F]">
              {totalSteps} / {totalSteps}
            </span>
          </div>
          <div className="text-center pl-2">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F] block mb-1">
              Cooking Time
            </span>
            <span id="celebration-total-time" className="text-[28px] font-bold text-[#20251F]">
              {totalMinutes}
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div id="celebration-actions" className="w-full flex flex-col sm:flex-row items-center gap-4">
          <TouchButton
            id="btn-celebration-library"
            variant="primary"
            onClick={onReturnToLibrary}
            className="w-full sm:flex-1 min-h-[56px] text-[16px] md:text-[18px] font-bold flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Recipe Library</span>
          </TouchButton>

          <TouchButton
            id="btn-celebration-cook-again"
            variant="secondary"
            onClick={onCookAgain}
            className="w-full sm:flex-1 min-h-[56px] text-[16px] md:text-[18px] font-semibold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Cook Again</span>
          </TouchButton>
        </div>
      </div>
    </div>
  );
};
