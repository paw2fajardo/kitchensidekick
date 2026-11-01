import React, { useEffect, useState } from 'react';
import { Clock, Pause, Play, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { playKitchenChime } from '../../lib/sound';

export interface GlobalTimerStripProps {
  onDismiss?: () => void;
}

export const GlobalTimerStrip: React.FC<GlobalTimerStripProps> = ({ onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const timers = useTimerStore((state) => state.activeTimers);
  const tickTimer = useTimerStore((state) => state.tickTimer);
  const pauseTimer = useTimerStore((state) => state.pauseTimer);
  const startTimer = useTimerStore((state) => state.startTimer);
  const extendTimer = useTimerStore((state) => state.extendTimer);
  const clearTimer = useTimerStore((state) => state.clearTimer);
  const clearAllTimers = useTimerStore((state) => state.clearAllTimers);

  const activeTimerList = Object.values(timers);

  // If new timers are added, un-dismiss so user sees them
  useEffect(() => {
    if (activeTimerList.length > 0 && isDismissed) {
      // Keep dismissed unless a timer enters overtime/alarm
      const hasAlarm = activeTimerList.some((t) => t.isOvertime || t.remainingSeconds <= 0);
      if (hasAlarm) {
        setIsDismissed(false);
      }
    }
  }, [activeTimerList, isDismissed]);

  // Global ticker interval
  useEffect(() => {
    const running = activeTimerList.some((t) => t.isRunning && !t.isPaused);
    if (!running) return;

    const interval = setInterval(() => {
      activeTimerList.forEach((t) => {
        if (t.isRunning && !t.isPaused) {
          if (t.remainingSeconds === 1) {
            playKitchenChime();
          }
          tickTimer(t.id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerList, tickTimer]);

  if (activeTimerList.length === 0 || isDismissed) return null;

  const formatDisplayTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSecs = Math.abs(seconds);
    const m = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return isNegative ? `+${formatted}` : formatted;
  };

  return (
    <div 
      id="global-timer-strip-bar"
      aria-label="Active Cooking Timers"
      className="bg-[#FFFFFF] border-b border-[#D9DDD4] px-4 md:px-8 py-2.5 flex items-center justify-between gap-3 overflow-x-auto shadow-none shrink-0"
    >
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none flex-nowrap min-w-0">
        <div className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-[#5F675F] shrink-0 mr-1">
          <Clock className="w-4 h-4 text-[#245C43]" />
          <span>Timers:</span>
        </div>

        <div className="flex items-center gap-3 flex-nowrap">
          {activeTimerList.map((timer) => {
            const isOvertime = timer.isOvertime || timer.remainingSeconds <= 0;

            return (
              <div
                key={timer.id}
                id={`timer-chip-${timer.id}`}
                className={`min-h-[48px] px-3.5 py-1.5 rounded-[10px] border flex items-center gap-3 shrink-0 transition-colors ${
                  isOvertime
                    ? 'bg-[#FDF4E7] border-[#A86416] text-[#8A4E0B]'
                    : 'bg-[#F5F5F0] border-[#D9DDD4] text-[#20251F]'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-semibold truncate max-w-[140px] text-[#5F675F]">
                    {timer.stageName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isOvertime && <AlertTriangle className="w-3.5 h-3.5 text-[#A86416] shrink-0" />}
                    <span
                      className={`font-mono text-[16px] font-bold leading-none ${
                        isOvertime ? 'text-[#A86416]' : 'text-[#20251F]'
                      }`}
                    >
                      {formatDisplayTime(timer.remainingSeconds)}
                    </span>
                    {isOvertime && (
                      <span className="text-[11px] font-bold uppercase px-1 rounded bg-[#A86416]/15 text-[#8A4E0B]">
                        Overtime
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Pause/Resume, +30s, Dismiss */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => (timer.isRunning ? pauseTimer(timer.id) : startTimer(timer.id))}
                    className="p-1.5 rounded-[6px] hover:bg-[#E2E4DC] text-[#20251F] min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                    aria-label={timer.isRunning ? 'Pause timer' : 'Resume timer'}
                  >
                    {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => extendTimer(timer.id, 30)}
                    className="px-2 py-1 text-[12px] font-semibold rounded-[6px] bg-[#FFFFFF] border border-[#D9DDD4] hover:bg-[#E2E4DC] text-[#20251F] min-h-[36px]"
                  >
                    +30s
                  </button>

                  <button
                    type="button"
                    onClick={() => clearTimer(timer.id)}
                    className="p-1.5 rounded-[6px] hover:bg-[#E2E4DC] text-[#5F675F] min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                    aria-label="Acknowledge and dismiss timer"
                    title="Acknowledge timer"
                  >
                    <CheckCircle className="w-4 h-4 text-[#245C43]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dismiss All / Close Strip Button: Kitchen Accessible >=48px Touch Target */}
      <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-[#D9DDD4]">
        <button
          id="btn-dismiss-global-timer-strip"
          type="button"
          onClick={() => {
            setIsDismissed(true);
            clearAllTimers();
            if (onDismiss) {
              onDismiss();
            }
          }}
          className="min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-[10px] text-[#5F675F] hover:text-[#20251F] hover:bg-[#F5F5F0] border border-[#D9DDD4] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
          title="Dismiss timer strip and clear timers"
          aria-label="Dismiss timer strip"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Dismiss</span>
        </button>
      </div>
    </div>
  );
};
