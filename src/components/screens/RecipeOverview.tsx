import React from 'react';
import { Clock, Users, ArrowRight, Edit3, ChefHat } from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';

export interface OverviewIngredient {
  id: string;
  name: string;
  quantity?: string | null;
  unit?: string | null;
  group?: string | null; // e.g. "Sauce", "Main", "Garnish"
}

export interface OverviewInstruction {
  id: string;
  stepNumber: number;
  text: string;
}

export interface RecipeOverviewProps {
  title: string;
  description?: string | null;
  totalTime?: string | null;
  yieldServings?: string | null;
  ingredients: OverviewIngredient[];
  instructions: OverviewInstruction[];
  onStartCooking: () => void;
  onEditWorkflow: () => void;
}

export const RecipeOverview: React.FC<RecipeOverviewProps> = ({
  title,
  description,
  totalTime = '45 mins',
  yieldServings = '4 servings',
  ingredients,
  instructions,
  onStartCooking,
  onEditWorkflow,
}) => {
  // Group ingredients by component/section
  const groupedIngredients = React.useMemo(() => {
    const map = new Map<string, OverviewIngredient[]>();
    ingredients.forEach((ing) => {
      const groupKey = ing.group || 'Main Ingredients';
      const existing = map.get(groupKey) || [];
      existing.push(ing);
      map.set(groupKey, existing);
    });
    return Array.from(map.entries());
  }, [ingredients]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-y-auto">
      {/* Top Header Card */}
      <div className="p-6 md:p-8 border-b border-[#D9DDD4] bg-[#FFFFFF]">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-[6px] bg-[#E4EEE7] text-[#245C43] text-[13px] font-semibold border border-[#245C43]/20">
              Recipe Overview
            </span>
          </div>

          <h2 className="text-[28px] md:text-[34px] font-bold text-[#20251F] tracking-tight leading-tight mb-3">
            {title}
          </h2>

          {description && (
            <p className="text-[16px] md:text-[18px] text-[#5F675F] leading-relaxed mb-6">
              {description}
            </p>
          )}

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[14px] font-medium">
              <Clock className="w-4 h-4 text-[#5F675F]" />
              <span>{totalTime}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[14px] font-medium">
              <Users className="w-4 h-4 text-[#5F675F]" />
              <span>{yieldServings}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#F5F5F0] border border-[#D9DDD4] text-[#20251F] text-[14px] font-medium">
              <ChefHat className="w-4 h-4 text-[#5F675F]" />
              <span>{ingredients.length} Ingredients</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <TouchButton
              variant="primary"
              isCTA
              onClick={onStartCooking}
              className="flex-1 md:flex-initial min-h-[56px] px-8 text-[16px] md:text-[18px]"
            >
              <span>Start Cooking Session</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </TouchButton>

            <TouchButton
              variant="secondary"
              onClick={onEditWorkflow}
              className="min-h-[56px] text-[16px]"
            >
              <Edit3 className="w-4 h-4 mr-1.5" />
              <span>Adjust Recipe Steps</span>
            </TouchButton>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Ingredients & Original Instructions */}
      <div className="p-6 md:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ingredients Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b border-[#D9DDD4] pb-3">
            <h3 className="text-[20px] font-bold text-[#20251F] tracking-tight">
              Ingredients
            </h3>
            <p className="text-[14px] text-[#5F675F]">
              Grouped by preparation component
            </p>
          </div>

          <div className="space-y-6">
            {groupedIngredients.map(([groupName, groupItems]) => (
              <div key={groupName} className="rounded-[10px] border border-[#D9DDD4] bg-[#F5F5F0] p-4">
                <h4 className="text-[15px] font-bold text-[#245C43] uppercase tracking-wide mb-3">
                  {groupName}
                </h4>
                <ul className="space-y-2.5">
                  {groupItems.map((ing) => (
                    <li key={ing.id} className="flex items-baseline justify-between text-[15px] bg-[#FFFFFF] p-2.5 rounded-[8px] border border-[#D9DDD4]">
                      <span className="font-medium text-[#20251F]">{ing.name}</span>
                      {(ing.quantity || ing.unit) && (
                        <span className="font-semibold text-[#5F675F] text-[14px] shrink-0 ml-2">
                          {[ing.quantity, ing.unit].filter(Boolean).join(' ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-[#D9DDD4] pb-3">
            <h3 className="text-[20px] font-bold text-[#20251F] tracking-tight">
              Original Recipe Instructions
            </h3>
            <p className="text-[14px] text-[#5F675F]">
              Source Mealie instructions converted into executable parallel workflow
            </p>
          </div>

          <div className="space-y-4">
            {instructions.map((step) => (
              <div key={step.id} className="p-4 rounded-[10px] border border-[#D9DDD4] bg-[#FFFFFF] flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-[#ECEDE7] text-[#245C43] text-[15px] font-bold flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <p className="text-[16px] text-[#20251F] leading-relaxed pt-0.5">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
