import React, { useState, useEffect } from 'react';
import { PhaseType } from './TaskCard';

export interface WorkflowBoardLayoutProps {
  recipeTitle: string;
  totalTasks: number;
  completedTasks: number;
  activeHeroCard?: React.ReactNode;
  childrenByPhase: {
    prep: React.ReactNode;
    sauce: React.ReactNode;
    cooking: React.ReactNode;
  };
  ingredientDrawerOpen?: boolean;
  onToggleIngredientDrawer?: () => void;
  ingredientDrawerContent?: React.ReactNode;
}

const PHASES: Array<{ id: PhaseType; label: string; accentColor: string }> = [
  { id: 'prep', label: 'Prep Lane', accentColor: '#537B60' },
  { id: 'sauce', label: 'Sauce Lane', accentColor: '#B17A3D' },
  { id: 'cooking', label: 'Cooking Lane', accentColor: '#A65B45' },
];

/**
 * WorkflowBoardLayout (Culinary Flow Model)
 *
 * Architecture:
 * 1. Top Bar with Recipe Title, Progress ("3 of 14 Done"), and Mise-en-place drawer toggle.
 * 2. Dominant Hero Active Task Section (The Cook's focal anchor: immediate instruction + timer + CTA).
 * 3. Parallel Tracks Section:
 *    - Desktop (>1080px): 3 lanes displayed cleanly below the hero.
 *    - Tablet Landscape (900-1080px): 2 lanes displayed when drawer is closed.
 *    - Tablet with Drawer open / Portrait / Mobile: Auto-collapses into 1 lane with sticky segmented switcher to guarantee 0px horizontal clipping.
 */
export const WorkflowBoardLayout: React.FC<WorkflowBoardLayoutProps> = ({
  recipeTitle,
  totalTasks,
  completedTasks,
  activeHeroCard,
  childrenByPhase,
  ingredientDrawerOpen = false,
  onToggleIngredientDrawer,
  ingredientDrawerContent,
}) => {
  const [activeLane, setActiveLane] = useState<PhaseType>('prep');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isTabletLandscape = windowWidth >= 900 && windowWidth <= 1080;
  // const isDesktop = windowWidth > 1080;

  // 1024px iPad Landscape Rule: If drawer opens, collapse lanes to single active lane
  const forceSingleLane =
    windowWidth < 900 ||
    (isTabletLandscape && ingredientDrawerOpen);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F0] text-[#20251F] flex flex-col font-sans">
      {/* Sticky App Header */}
      <header className="sticky top-0 z-20 bg-[#FFFFFF] border-b border-[#D9DDD4] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-semibold tracking-wider uppercase text-[#5F675F]">
            Cooking Companion
          </span>
          <h1 className="text-[19px] sm:text-[22px] font-bold text-[#20251F] truncate m-0">
            {recipeTitle}
          </h1>
        </div>

        {/* Progress & Mise-en-place CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1 text-[13px] font-semibold text-[#5F675F]">
            <span>{completedTasks} of {totalTasks} tasks completed ({progressPercent}%)</span>
            <div className="w-32 h-1.5 bg-[#ECEDE7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#245C43] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {onToggleIngredientDrawer && (
            <button
              type="button"
              onClick={onToggleIngredientDrawer}
              className={`min-h-[48px] px-4 rounded-[10px] border text-[15px] font-semibold inline-flex items-center gap-2 transition-colors ${
                ingredientDrawerOpen
                  ? 'bg-[#E4EEE7] border-[#245C43] text-[#245C43]'
                  : 'bg-[#FFFFFF] border-[#D9DDD4] text-[#20251F] hover:bg-[#ECEDE7]'
              }`}
              aria-expanded={ingredientDrawerOpen}
            >
              <span>{ingredientDrawerOpen ? 'Close Mise-en-place' : 'Mise-en-place'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col gap-8 max-w-7xl mx-auto w-full">
          {/* ZONE 1: HERO ACTIVE STEP (The Cook's Focal Point) */}
          {activeHeroCard && (
            <section aria-label="Current Step Focus" className="w-full">
              {activeHeroCard}
            </section>
          )}

          {/* ZONE 2: PARALLEL WORKSTREAMS */}
          <section aria-label="Parallel Workflow Tracks" className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DDD4]">
              <h2 className="text-[19px] font-bold text-[#20251F] m-0">
                Parallel Workflow Lanes
              </h2>
              <span className="text-[14px] text-[#5F675F]">
                Pick upcoming steps from any lane
              </span>
            </div>

            {/* Sticky segmented switcher when collapsed */}
            {forceSingleLane && (
              <div className="sticky top-0 z-10 bg-[#F5F5F0] py-2">
                <div className="flex gap-2 p-1 bg-[#FFFFFF] rounded-[10px] border border-[#D9DDD4]" role="tablist">
                  {PHASES.map((phase) => {
                    const isSelected = activeLane === phase.id;
                    return (
                      <button
                        key={phase.id}
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveLane(phase.id)}
                        className={`min-h-[48px] flex-1 inline-flex items-center justify-center gap-2 px-3 rounded-[8px] text-[14px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#E4EEE7] text-[#245C43]'
                            : 'text-[#5F675F] hover:bg-[#ECEDE7]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: phase.accentColor }}
                        />
                        <span>{phase.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lanes Viewport */}
            {forceSingleLane ? (
              <div className="flex flex-col gap-4">
                {childrenByPhase[activeLane]}
              </div>
            ) : isTabletLandscape && !ingredientDrawerOpen ? (
              <div className="grid grid-cols-2 gap-6">
                <div>{childrenByPhase.prep}</div>
                <div>{childrenByPhase.cooking}</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                <div>{childrenByPhase.prep}</div>
                <div>{childrenByPhase.sauce}</div>
                <div>{childrenByPhase.cooking}</div>
              </div>
            )}
          </section>
        </main>

        {/* 320px Collapsible Mise-en-place Side Drawer */}
        {ingredientDrawerOpen && ingredientDrawerContent && (
          <aside
            className="w-[320px] shrink-0 border-l border-[#D9DDD4] bg-[#FFFFFF] p-6 overflow-y-auto z-10 shadow-none"
            aria-label="Mise-en-place Ingredients"
          >
            {ingredientDrawerContent}
          </aside>
        )}
      </div>
    </div>
  );
};
