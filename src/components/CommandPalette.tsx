/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useEffect } from "react";
import {
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  Circle,
  Clock,
  X,
} from "lucide-react";
import { Task } from "../hooks/useTasks";
import { Command } from "cmdk";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onCreateTask: () => void;
  onSetFilter: (filterId: string) => void;
  onClearCompleted: () => void;
  onToggleSidebar: () => void;
  tasks: Task[];
  onOpenEditTask: (task: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onCreateTask,
  onSetFilter,
  onClearCompleted,
  tasks,
  onOpenEditTask,
}) => {
  // Helper function to get task status icon
  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5 text-vscode-success" />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5 text-vscode-info" />;
      case 'canceled':
        return <X className="w-3.5 h-3.5 text-vscode-error" />;
      default: // 'todo'
        return <Circle className="w-3.5 h-3.5 text-vscode-text-muted" />;
    }
  };

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/30">
      <div className="w-full max-w-xl mx-4">
        <Command className="bg-white rounded-md shadow-2xl border border-vscode-border overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-vscode-border">
            <svg
              className="w-4 h-4 text-vscode-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Command.Input
              placeholder="Type to search..."
              className="flex-1 text-sm text-vscode-text placeholder-vscode-text-muted outline-none bg-transparent"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-vscode-text-muted">
              No results found.
            </Command.Empty>

            {/* Actions Group */}
            <Command.Group heading="Actions" className="px-1 py-1">
              <div className="text-[10px] uppercase tracking-wider text-vscode-text-muted px-2 py-1 mb-1">Actions</div>
              <Command.Item
                onSelect={() => {
                  onCreateTask();
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <Plus className="w-4 h-4 text-vscode-text" />
                <span className="flex-1">New Task</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">T</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <Settings className="w-4 h-4 text-vscode-text" />
                <span className="flex-1">Settings</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">S</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onClearCompleted();
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <Trash2 className="w-4 h-4 text-vscode-text" />
                <span className="flex-1">Clear Completed</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⇧⌘C</span>
              </Command.Item>
            </Command.Group>

            {/* Filters Group */}
            <Command.Group heading="Filters" className="px-1 py-1 border-t border-vscode-border mt-1 pt-2">
              <div className="text-[10px] uppercase tracking-wider text-vscode-text-muted px-2 py-1 mb-1">Filters</div>
              <Command.Item
                onSelect={() => {
                  onSetFilter("1");
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <svg className="w-4 h-4 text-vscode-text" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm0 11H4V3h10v10zM5 5h6v1H5V5zm0 3h6v1H5V8zm0 3h4v1H5v-1z"/>
                </svg>
                <span className="flex-1">All Tasks</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⌘1</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSetFilter("2");
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <Circle className="w-4 h-4 text-vscode-text-muted" />
                <span className="flex-1">Todo</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⌘2</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSetFilter("3");
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <Clock className="w-4 h-4 text-[#3794ff]" />
                <span className="flex-1">In Progress</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⌘3</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSetFilter("4");
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <CheckCircle className="w-4 h-4 text-[#89d185]" />
                <span className="flex-1">Completed</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⌘4</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  onSetFilter("5");
                  onClose();
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
              >
                <X className="w-4 h-4 text-[#f48771]" />
                <span className="flex-1">Cancelled</span>
                <span className="text-[10px] text-vscode-text-muted bg-vscode-sidebar px-1.5 py-0.5 rounded">⌘5</span>
              </Command.Item>
            </Command.Group>

            {/* Tasks Group - Only show when there are tasks */}
            {tasks.length > 0 && (
              <Command.Group heading="Tasks" className="px-1 py-1 border-t border-vscode-border mt-1 pt-2">
                <div className="text-[10px] uppercase tracking-wider text-vscode-text-muted px-2 py-1 mb-1">Recent Tasks</div>
                {tasks.slice(0, 8).map((task) => (
                  <Command.Item
                    key={`task-${task.id}`}
                    onSelect={() => {
                      onOpenEditTask(task);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-vscode-text rounded cursor-pointer data-[selected=true]:bg-vscode-active data-[selected=true]:text-white"
                  >
                    {getTaskStatusIcon(task.status)}
                    <span className="flex-1 truncate">{task.title}</span>
                  </Command.Item>
                ))}
                {tasks.length > 8 && (
                  <div className="px-2 py-1 text-[10px] text-vscode-text-muted">
                    +{tasks.length - 8} more tasks
                  </div>
                )}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="px-3 py-2 bg-vscode-sidebar border-t border-vscode-border">
            <div className="flex items-center justify-between text-[10px] text-vscode-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="bg-vscode-sidebar px-1 py-0.5 rounded">↑↓</span> navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-vscode-sidebar px-1 py-0.5 rounded">↵</span> select
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-vscode-sidebar px-1 py-0.5 rounded">esc</span> close
                </span>
              </div>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
};
