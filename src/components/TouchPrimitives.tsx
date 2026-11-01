import React from 'react';

export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'override';
  isCTA?: boolean;
}

/**
 * TouchButton
 *
 * Implements DESIGN.md Section 4 & 6 (UX-04):
 * - Minimum 48px touch height and width bounding box for standard buttons
 * - Minimum 56px height for primary completion CTAs
 * - 10px corner radius, zero drop shadow, 1px hairline border
 * - High contrast styling and visible focus rings
 */
export const TouchButton: React.FC<TouchButtonProps> = ({
  variant = 'primary',
  isCTA = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const minHeightClass = isCTA ? 'min-h-[56px] text-[18px]' : 'min-h-[48px] text-[16px]';

  const variantClasses = {
    primary:
      'bg-[#245C43] hover:bg-[#194A35] text-[#FFFFFF] border-transparent font-semibold focus:ring-[#245C43]',
    secondary:
      'bg-[#FFFFFF] hover:bg-[#ECEDE7] text-[#20251F] border-[#D9DDD4] font-medium focus:ring-[#245C43]',
    danger:
      'bg-[#B33B32] hover:bg-[#8F2B23] text-[#FFFFFF] border-transparent font-semibold focus:ring-[#B33B32]',
    ghost:
      'bg-transparent hover:bg-[#ECEDE7] text-[#20251F] border-transparent font-medium focus:ring-[#245C43]',
    override:
      'bg-[#FFFFFF] hover:bg-[#FDF4E7] text-[#8A4E0B] border-[#8A4E0B] font-semibold focus:ring-[#8A4E0B]',
  }[variant];

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-[#ECEDE7] text-[#8E968E] border-[#D9DDD4] hover:bg-[#ECEDE7]'
    : '';

  return (
    <button
      type="button"
      disabled={disabled}
      className={`min-w-[48px] px-5 py-2.5 rounded-[10px] border shadow-none inline-flex items-center justify-center gap-2 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-offset-2 ${minHeightClass} ${variantClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TouchChipProps {
  label: string;
  count?: string | number;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * TouchChip
 *
 * Implements touch-safe chip/pill trigger with guaranteed >=48px bounding box:
 * Inner pill is 32-36px tall centered inside an accessible >=48px hit target.
 */
export const TouchChip: React.FC<TouchChipProps> = ({
  label,
  count,
  isSelected = false,
  onSelect,
  className = '',
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-[48px] min-w-[48px] p-1 inline-flex items-center justify-center bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#245C43] rounded-[8px] ${className}`}
    >
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-[14px] font-medium transition-colors shadow-none ${
          isSelected
            ? 'bg-[#E4EEE7] border-[#245C43] text-[#245C43] font-semibold'
            : 'bg-[#ECEDE7] border-[#D9DDD4] text-[#20251F] hover:bg-[#E2E4DC]'
        }`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
        {count != null && (
          <span className="text-[12px] opacity-80 px-1 py-0.2 bg-[#D9DDD4] rounded-[4px] font-semibold">
            {count}
          </span>
        )}
      </span>
    </button>
  );
};

export interface IngredientToggleChipProps {
  id: string;
  name: string;
  quantity?: string;
  isPrepared: boolean;
  onToggle: (id: string) => void;
  className?: string;
}

/**
 * IngredientToggleChip
 *
 * Remediates COMP-02:
 * The entire ingredient chip itself acts as the >=48px tap-to-verify toggle button.
 * Prevents sub-checkbox target crowding on countertop tablet displays.
 */
export const IngredientToggleChip: React.FC<IngredientToggleChipProps> = ({
  id,
  name,
  quantity,
  isPrepared,
  onToggle,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className={`min-h-[48px] px-3.5 py-2 rounded-[8px] border text-[15px] font-medium inline-flex items-center gap-2.5 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-[#245C43] ${
        isPrepared
          ? 'bg-[#E4EEE7] border-[#245C43] text-[#245C43] line-through'
          : 'bg-[#ECEDE7] border-[#D9DDD4] text-[#20251F] hover:bg-[#E2E4DC]'
      } ${className}`}
      aria-pressed={isPrepared}
      aria-label={`${name}${quantity ? ' ' + quantity : ''}: ${isPrepared ? 'Prepared' : 'Pending prep'}`}
    >
      <span
        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
          isPrepared
            ? 'border-[#245C43] bg-[#245C43] text-[#FFFFFF]'
            : 'border-[#8E968E] bg-[#FFFFFF]'
        }`}
      >
        {isPrepared && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span>
        {name}
        {quantity ? ` (${quantity})` : ''}
      </span>
    </button>
  );
};

export interface UndoToastProps {
  message: string;
  secondsRemaining: number;
  onUndo: () => void;
}

/**
 * UndoToast
 *
 * Remediates CRIT-03:
 * 5-second non-blocking bottom Undo toast for accidental tap recovery.
 */
export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  secondsRemaining,
  onUndo,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#20251F] text-[#FFFFFF] px-5 py-3 rounded-[12px] shadow-lg border border-[#D9DDD4] flex items-center gap-4 min-h-[48px]"
    >
      <span className="text-[15px] font-medium">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="min-h-[48px] px-3.5 py-1.5 rounded-[8px] bg-[#245C43] hover:bg-[#194A35] text-[#FFFFFF] text-[14px] font-semibold inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
      >
        <span>Undo</span>
        <span className="text-[12px] opacity-80">({secondsRemaining}s)</span>
      </button>
    </div>
  );
};
