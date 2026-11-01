import React from 'react';
import { 
  BookOpen, 
  FileText, 
  ChefHat
} from 'lucide-react';
import { GlobalTimerStrip } from './GlobalTimerStrip';

export type ScreenId = 'library' | 'overview' | 'cooking' | 'celebration';

interface AppShellProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  recipeTitle?: string;
  activeSessionBadge?: string;
  isCookingMode?: boolean;
  onExitCooking?: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentScreen,
  onNavigate,
  recipeTitle = 'Sukiyaki (Standard)',
  activeSessionBadge,
  isCookingMode = false,
  onExitCooking,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#20251F] flex flex-col font-sans">
      {/* Top Bar / Masthead */}
      <header className="h-16 bg-[#F5F5F0] border-b border-[#D9DDD4] px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#245C43] text-[#FFFFFF] flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[18px] md:text-[20px] font-bold text-[#20251F] tracking-tight leading-none">
              KitchenSidekick
            </h1>
            <p className="text-[13px] text-[#5F675F] leading-snug">
              {recipeTitle}
            </p>
          </div>
        </div>

        {/* Global session badge / Mode status */}
        <div className="flex items-center gap-3">
          {activeSessionBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#E4EEE7] text-[#245C43] text-[13px] font-semibold border border-[#D9DDD4]">
              <span className="w-2 h-2 rounded-full bg-[#245C43]" />
              {activeSessionBadge}
            </span>
          )}
          {isCookingMode && onExitCooking && (
            <button
              onClick={onExitCooking}
              className="text-[13px] font-bold px-3 py-1.5 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[#5F675F] hover:text-[#20251F]"
            >
              Exit Cooking
            </button>
          )}
        </div>
      </header>

      {/* Mode 1: Preparation Navigation Ribbon (Only shown outside of active cooking) */}
      {!isCookingMode && (
        <nav 
          aria-label="Planning Navigation"
          className="bg-[#F5F5F0] border-b border-[#D9DDD4] px-4 md:px-8 py-2 overflow-x-auto flex items-center gap-2 shrink-0 scrollbar-none"
        >
          <button
            onClick={() => onNavigate('library')}
            className={`min-h-[48px] px-4 py-2 rounded-[10px] text-[14px] md:text-[15px] font-medium flex items-center gap-2 transition-colors shrink-0 ${
              currentScreen === 'library'
                ? 'bg-[#245C43] text-[#FFFFFF] font-semibold'
                : 'bg-[#FFFFFF] text-[#20251F] border border-[#D9DDD4] hover:bg-[#ECEDE7]'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${currentScreen === 'library' ? 'text-[#FFFFFF]' : 'text-[#5F675F]'}`} />
            <span>1. Recipe Library</span>
          </button>

          <button
            onClick={() => onNavigate('overview')}
            className={`min-h-[48px] px-4 py-2 rounded-[10px] text-[14px] md:text-[15px] font-medium flex items-center gap-2 transition-colors shrink-0 ${
              currentScreen === 'overview'
                ? 'bg-[#245C43] text-[#FFFFFF] font-semibold'
                : 'bg-[#FFFFFF] text-[#20251F] border border-[#D9DDD4] hover:bg-[#ECEDE7]'
            }`}
          >
            <FileText className={`w-4 h-4 ${currentScreen === 'overview' ? 'text-[#FFFFFF]' : 'text-[#5F675F]'}`} />
            <span>2. Recipe & Mise en Place</span>
          </button>
        </nav>
      )}

      {/* Global Persistent Timer Strip (Mounted across all screens) */}
      <GlobalTimerStrip />

      {/* Framed-Sheet Workspace Area */}
      <main className="flex-1 p-3 md:p-6 lg:p-8 flex flex-col max-w-[1600px] w-full mx-auto">
        <div className="flex-1 bg-[#FFFFFF] border border-[#D9DDD4] rounded-[16px] shadow-none overflow-hidden flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};
