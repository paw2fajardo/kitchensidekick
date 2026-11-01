import React, { useState } from 'react';
import { Save, Trash2, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { TouchButton } from '../TouchPrimitives';
import type { PhaseType } from '../TaskCard';

export interface EditableTask {
  id: string;
  title: string;
  instruction: string;
  phase: PhaseType;
  estimatedMinutes: number;
  prerequisiteId?: string | null;
}

export interface WorkflowEditorProps {
  recipeTitle: string;
  initialTasks: EditableTask[];
  onSave: (tasks: EditableTask[]) => void;
  onCancel: () => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  recipeTitle,
  initialTasks,
  onSave,
  onCancel,
}) => {
  const [tasks, setTasks] = useState<EditableTask[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTasks[0]?.id || '');

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  const handleUpdateActiveTask = (updates: Partial<EditableTask>) => {
    if (!selectedTaskId) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTaskId ? { ...t, ...updates } : t))
    );
  };

  const handleAddTask = (phase: PhaseType) => {
    const newTask: EditableTask = {
      id: `task-${Date.now()}`,
      title: 'New Cooking Task',
      instruction: 'Describe step-by-step physical action.',
      phase,
      estimatedMinutes: 5,
    };
    setTasks((prev) => [...prev, newTask]);
    setSelectedTaskId(newTask.id);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(tasks.find((t) => t.id !== id)?.id || '');
    }
  };

  const handleMoveTask = (id: string, direction: 'up' | 'down') => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(index, 1);
    newTasks.splice(targetIndex, 0, moved);
    setTasks(newTasks);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
      {/* Top Bar */}
      <div className="p-4 md:p-6 border-b border-[#D9DDD4] bg-[#FFFFFF] flex items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-[6px] bg-[#ECEDE7] text-[#5F675F] text-[12px] font-mono uppercase tracking-wider">
            Screen 3: FE-05
          </span>
          <h2 className="text-[22px] md:text-[26px] font-bold text-[#20251F] tracking-tight">
            Workflow Editor: {recipeTitle}
          </h2>
          <p className="text-[14px] text-[#5F675F]">
            Structure phases and assign step prerequisites without forced drag-and-drop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TouchButton variant="secondary" onClick={onCancel}>
            Cancel
          </TouchButton>
          <TouchButton variant="primary" onClick={() => onSave(tasks)}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Workflow</span>
          </TouchButton>
        </div>
      </div>

      {/* Main Split: Task List & Task Property Inspector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Task List (Left Column) */}
        <div className="lg:col-span-5 border-r border-[#D9DDD4] flex flex-col h-full bg-[#F5F5F0]">
          <div className="p-3 border-b border-[#D9DDD4] bg-[#F5F5F0] flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#5F675F]">
              Workflow Tasks ({tasks.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAddTask('prep')}
                className="px-2 py-1 text-[12px] font-semibold bg-[#FFFFFF] border border-[#D9DDD4] rounded-[6px] hover:bg-[#E2E4DC]"
              >
                + Prep
              </button>
              <button
                type="button"
                onClick={() => handleAddTask('sauce')}
                className="px-2 py-1 text-[12px] font-semibold bg-[#FFFFFF] border border-[#D9DDD4] rounded-[6px] hover:bg-[#E2E4DC]"
              >
                + Sauce
              </button>
              <button
                type="button"
                onClick={() => handleAddTask('cooking')}
                className="px-2 py-1 text-[12px] font-semibold bg-[#FFFFFF] border border-[#D9DDD4] rounded-[6px] hover:bg-[#E2E4DC]"
              >
                + Cooking
              </button>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-2">
            {tasks.map((task, idx) => {
              const isSelected = task.id === selectedTaskId;
              const phaseBadgeColors = {
                prep: 'bg-[#537B60]/15 text-[#537B60]',
                sauce: 'bg-[#B17A3D]/15 text-[#8A5A22]',
                cooking: 'bg-[#A65B45]/15 text-[#A65B45]',
              }[task.phase];

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 rounded-[10px] border cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#245C43] ring-1 ring-[#245C43]'
                      : 'bg-[#FFFFFF] border-[#D9DDD4] hover:border-[#8E968E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[13px] font-bold text-[#8E968E] w-5 text-right">
                      {idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase ${phaseBadgeColors}`}>
                      {task.phase}
                    </span>
                    <span className="text-[15px] font-semibold text-[#20251F] truncate">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      aria-label="Move task up"
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveTask(task.id, 'up');
                      }}
                      className="p-1 rounded text-[#5F675F] hover:bg-[#ECEDE7] disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move task down"
                      disabled={idx === tasks.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveTask(task.id, 'down');
                      }}
                      className="p-1 rounded text-[#5F675F] hover:bg-[#ECEDE7] disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Inspector Form (Right Column) */}
        <div className="lg:col-span-7 p-6 overflow-y-auto">
          {activeTask ? (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#D9DDD4] pb-4">
                <h3 className="text-[20px] font-bold text-[#20251F]">Edit Task Properties</h3>
                <TouchButton
                  variant="danger"
                  onClick={() => handleDeleteTask(activeTask.id)}
                  className="min-h-[44px] text-[14px]"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span>Delete Task</span>
                </TouchButton>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#20251F] mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  value={activeTask.title}
                  onChange={(e) => handleUpdateActiveTask({ title: e.target.value })}
                  className="w-full min-h-[48px] px-3.5 py-2 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[16px] text-[#20251F] focus:ring-2 focus:ring-[#245C43] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#20251F] mb-1.5">
                    Cooking Phase
                  </label>
                  <select
                    value={activeTask.phase}
                    onChange={(e) => handleUpdateActiveTask({ phase: e.target.value as PhaseType })}
                    className="w-full min-h-[48px] px-3 py-2 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[15px] font-medium text-[#20251F] focus:ring-2 focus:ring-[#245C43]"
                  >
                    <option value="prep">Prep Phase</option>
                    <option value="sauce">Sauce Phase</option>
                    <option value="cooking">Cooking Phase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-[#20251F] mb-1.5">
                    Estimated Duration (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={activeTask.estimatedMinutes}
                      onChange={(e) => handleUpdateActiveTask({ estimatedMinutes: Number(e.target.value) || 1 })}
                      className="w-full min-h-[48px] px-3.5 py-2 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[16px] text-[#20251F] focus:ring-2 focus:ring-[#245C43]"
                    />
                    <Clock className="w-4 h-4 absolute right-3 top-3.5 text-[#5F675F] pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#20251F] mb-1.5">
                  Prerequisite Step Blocker (Dependency)
                </label>
                <select
                  value={activeTask.prerequisiteId || ''}
                  onChange={(e) => handleUpdateActiveTask({ prerequisiteId: e.target.value || null })}
                  className="w-full min-h-[48px] px-3 py-2 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[15px] text-[#20251F] focus:ring-2 focus:ring-[#245C43]"
                >
                  <option value="">No Prerequisite (Starts Ready)</option>
                  {tasks
                    .filter((t) => t.id !== activeTask.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Requires: [{t.phase.toUpperCase()}] {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-[#20251F] mb-1.5">
                  Step Instructions
                </label>
                <textarea
                  rows={4}
                  value={activeTask.instruction}
                  onChange={(e) => handleUpdateActiveTask({ instruction: e.target.value })}
                  className="w-full p-3.5 rounded-[8px] border border-[#D9DDD4] bg-[#FFFFFF] text-[16px] text-[#20251F] focus:ring-2 focus:ring-[#245C43] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#5F675F] text-[16px]">
              Select a task from the left list to edit properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
