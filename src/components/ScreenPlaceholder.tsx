import React from 'react';
import { TaskCard } from './TaskCard';
import type { TaskCardProps } from './TaskCard';

export interface ScreenPlaceholderProps {
  screenId: string;
  title: string;
  description: string;
  sampleTask?: TaskCardProps;
}

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({
  screenId,
  title,
  description,
  sampleTask,
}) => {
  return (
    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-[6px] bg-[#ECEDE7] text-[#5F675F] text-[12px] font-mono uppercase tracking-wider">
            {screenId}
          </span>
        </div>
        <h2 className="text-[24px] md:text-[28px] font-bold text-[#20251F] tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-[16px] text-[#5F675F] max-w-2xl leading-relaxed mb-6">
          {description}
        </p>

        {sampleTask && (
          <div className="mt-8 border-t border-[#D9DDD4] pt-6 max-w-md">
            <h3 className="text-[14px] font-semibold text-[#5F675F] uppercase tracking-wider mb-3">
              Design System TaskCard Integration Preview
            </h3>
            <TaskCard {...sampleTask} />
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-[#D9DDD4] flex items-center justify-between text-[13px] text-[#8E968E]">
        <span>Framed-Sheet surface: #FFFFFF | Border: 1px hairline #D9DDD4 | Canvas: #F5F5F0</span>
        <span>WCAG 2.2 AA compliant</span>
      </div>
    </div>
  );
};
