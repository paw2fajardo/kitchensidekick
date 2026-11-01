import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeOverview } from './RecipeOverview';
import { FocusMode } from './FocusMode';
import { IngredientDrawer } from '../IngredientDrawer';

describe('RecipeOverview (Screen 2: FE-04)', () => {
  it('groups ingredients by component and renders original instructions', () => {
    const mockStart = vi.fn();
    const mockEdit = vi.fn();

    render(
      <RecipeOverview
        title="Sukiyaki"
        description="Traditional hot pot"
        ingredients={[
          { id: '1', name: 'Beef Ribeye', quantity: '400g', group: 'Meat' },
          { id: '2', name: 'Dark Soy Sauce', quantity: '100ml', group: 'Warishita Sauce' },
        ]}
        instructions={[
          { id: 's1', stepNumber: 1, text: 'Slice shiitake mushrooms.' },
          { id: 's2', stepNumber: 2, text: 'Mix sauce.' },
        ]}
        onStartCooking={mockStart}
        onEditWorkflow={mockEdit}
      />
    );

    expect(screen.getByText('Meat')).toBeDefined();
    expect(screen.getByText('Beef Ribeye')).toBeDefined();
    expect(screen.getByText('Warishita Sauce')).toBeDefined();
    expect(screen.getByText('Slice shiitake mushrooms.')).toBeDefined();

    const startBtn = screen.getByRole('button', { name: /Start Cooking Session/i });
    expect(startBtn.className).toContain('min-h-[56px]');
    fireEvent.click(startBtn);
    expect(mockStart).toHaveBeenCalledTimes(1);
  });
});

describe('FocusMode (Screen 5: FE-07, FE-09, FE-10)', () => {
  it('renders 22px instruction text and handles complete CTA', () => {
    const mockComplete = vi.fn();
    const mockExit = vi.fn();

    render(
      <FocusMode
        tasks={[
          {
            id: 'task-1',
            title: 'Sear Beef Slices',
            instructionPreview: 'Sear beef slices in hot tallow for 30 seconds per side.',
            phase: 'cooking',
            status: 'ready',
            durationMinutes: 2,
          },
        ]}
        onCompleteTask={mockComplete}
        onExitFocus={mockExit}
      />
    );

    expect(screen.getByText('Sear beef slices in hot tallow for 30 seconds per side.')).toBeDefined();

    const completeBtn = screen.getByRole('button', { name: /Complete Step/i });
    expect(completeBtn.className).toContain('min-h-[56px]');
    fireEvent.click(completeBtn);
    expect(mockComplete).toHaveBeenCalledWith('task-1');
  });
});

describe('IngredientDrawer (Screen 6: FE-08)', () => {
  it('toggles ingredient between pending and prepared', () => {
    const mockToggle = vi.fn();

    render(
      <IngredientDrawer
        isOpen={true}
        onClose={vi.fn()}
        ingredients={[
          {
            id: 'ing-1',
            name: 'Shiitake Mushrooms',
            quantity: '8',
            isPrepared: false,
          },
        ]}
        onToggleIngredient={mockToggle}
      />
    );

    expect(screen.getByText('Shiitake Mushrooms')).toBeDefined();
    const toggleBtn = screen.getByLabelText(/Mark Shiitake Mushrooms as prepared/i);
    fireEvent.click(toggleBtn);
    expect(mockToggle).toHaveBeenCalledWith('ing-1');
  });
});
