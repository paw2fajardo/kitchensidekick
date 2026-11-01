import React from 'react';
import { X, Check, Circle, ExternalLink, ChefHat } from 'lucide-react';
import { TouchButton } from './TouchPrimitives';

export interface IngredientDrawerItem {
  id: string;
  name: string;
  quantity?: string | null;
  unit?: string | null;
  preparationNote?: string | null;
  isPrepared: boolean;
  taskId?: string;
  taskTitle?: string;
}

export interface IngredientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: IngredientDrawerItem[];
  onToggleIngredient: (id: string) => void;
  onJumpToTask?: (taskId: string) => void;
}

export const IngredientDrawer: React.FC<IngredientDrawerProps> = ({
  isOpen,
  onClose,
  ingredients,
  onToggleIngredient,
  onJumpToTask,
}) => {
  if (!isOpen) return null;

  const preparedCount = ingredients.filter((i) => i.isPrepared).length;
  const pendingCount = ingredients.length - preparedCount;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
      <aside 
        aria-label="Mise en Place Drawer"
        className="w-full sm:w-[420px] bg-[#FFFFFF] border-l border-[#D9DDD4] flex flex-col h-full shadow-2xl z-50 animate-in slide-in-from-right duration-200"
      >
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-[#D9DDD4] flex items-center justify-between bg-[#F5F5F0]">
        <div className="flex items-center gap-2.5">
          <ChefHat className="w-5 h-5 text-[#245C43]" />
          <div>
            <h3 className="text-[18px] font-bold text-[#20251F] leading-tight">
              Mise en Place
            </h3>
            <p className="text-[13px] text-[#5F675F]">
              {preparedCount} of {ingredients.length} prepared ({pendingCount} pending)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close ingredient panel"
          className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center rounded-[8px] text-[#5F675F] hover:bg-[#E2E4DC] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Ingredient List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-2">
        {ingredients.length === 0 ? (
          <div className="text-center py-8 text-[#5F675F] text-[15px]">
            No ingredients mapped for this recipe.
          </div>
        ) : (
          ingredients.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-[10px] border transition-colors flex items-start justify-between gap-3 ${
                item.isPrepared
                  ? 'bg-[#E4EEE7]/40 border-[#245C43]/20 text-[#5F675F]'
                  : 'bg-[#FFFFFF] border-[#D9DDD4] text-[#20251F]'
              }`}
            >
              {/* Checkbox trigger >=48px bounding area */}
              <button
                type="button"
                onClick={() => onToggleIngredient(item.id)}
                className="min-h-[48px] min-w-[48px] -ml-2 -mt-1 p-2 inline-flex items-center justify-center rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                aria-label={`Mark ${item.name} as ${item.isPrepared ? 'pending' : 'prepared'}`}
              >
                <span
                  className={`w-6 h-6 rounded-[6px] border flex items-center justify-center transition-colors ${
                    item.isPrepared
                      ? 'bg-[#245C43] border-[#245C43] text-[#FFFFFF]'
                      : 'border-[#8E968E] bg-[#FFFFFF] text-transparent'
                  }`}
                >
                  {item.isPrepared ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4" />}
                </span>
              </button>

              {/* Ingredient Name & Quantity */}
              <div className="flex-1 pt-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-[16px] font-medium leading-snug ${
                      item.isPrepared ? 'line-through text-[#8E968E]' : 'text-[#20251F]'
                    }`}
                  >
                    {item.name}
                  </span>
                  {(item.quantity || item.unit) && (
                    <span className="text-[14px] font-semibold text-[#245C43] shrink-0">
                      {[item.quantity, item.unit].filter(Boolean).join(' ')}
                    </span>
                  )}
                </div>

                {item.preparationNote && (
                  <p className="text-[13px] text-[#5F675F] mt-0.5">{item.preparationNote}</p>
                )}

                {item.taskId && item.taskTitle && (
                  <button
                    type="button"
                    onClick={() => onJumpToTask?.(item.taskId!)}
                    className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#356B8C] hover:underline"
                  >
                    <span>Task: {item.taskTitle}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom bulk action */}
      <div className="p-4 border-t border-[#D9DDD4] bg-[#F5F5F0]">
        <TouchButton
          variant="secondary"
          className="w-full min-h-[48px]"
          onClick={() => {
            const allPrepared = ingredients.every((i) => i.isPrepared);
            ingredients.forEach((i) => {
              if (allPrepared ? i.isPrepared : !i.isPrepared) {
                onToggleIngredient(i.id);
              }
            });
          }}
        >
          {ingredients.every((i) => i.isPrepared) ? 'Reset All to Pending' : 'Mark All Prepared'}
        </TouchButton>
      </div>
    </aside>
  </div>
  );
};
