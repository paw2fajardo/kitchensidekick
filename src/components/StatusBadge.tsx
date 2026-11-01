import React from 'react';

export type TaskStatus = 'pending' | 'ready' | 'in_progress' | 'blocked' | 'completed';

export interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

/**
 * StatusBadge
 *
 * Implements DESIGN.md Section 7.12 & 8.1 (UX-05):
 * - Static icon + clear text label for all 5 lifecycle states
 * - Strictly zero continuous motion (no animate-pulse, no animate-ping)
 * - WCAG AA compliant text contrast across all states
 * - Consistent 8px radius, flat styling, 0px drop shadow
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'ready':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#E4EEE7] text-[#245C43] text-[13px] font-semibold border border-[#D9DDD4] shadow-none ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8" />
          </svg>
          Ready
        </span>
      );

    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#EBF3F8] text-[#356B8C] text-[13px] font-semibold border border-[#D9DDD4] shadow-none ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          In progress
        </span>
      );

    case 'blocked':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#FDF4E7] text-[#8A4E0B] text-[13px] font-semibold border border-[#D9DDD4] shadow-none ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0v4" />
          </svg>
          Blocked
        </span>
      );

    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#E6F3EC] text-[#287A4B] text-[13px] font-semibold border border-[#D9DDD4] shadow-none ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
          Completed
        </span>
      );

    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#ECEDE7] text-[#5F675F] text-[13px] font-medium border border-[#D9DDD4] shadow-none ${className}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
          </svg>
          Pending
        </span>
      );
  }
};
