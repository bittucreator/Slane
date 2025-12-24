/**
 * @author Shiva Nagendra Babu Kore
 */

import { useState, useEffect, useCallback } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { StatusDropdown } from "./StatusDropdown";
import { PriorityDropdown } from "./PriorityDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from './ui/calendar';
import { DynamicRichTextEditor } from './DynamicRichTextEditor';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  status?: "todo" | "in_progress" | "completed" | "canceled";
  dueDate?: Date;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const EditTaskModal = ({
  isOpen,
  onClose,
  task,
  onSave,
}: EditTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    status: "todo" as "todo" | "in_progress" | "completed" | "canceled",
    dueDate: undefined as Date | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status || (task.completed ? "completed" : "todo"),
        dueDate: task.dueDate,
      });
      
      // Auto-resize textarea for existing description
      setTimeout(() => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea && task.description) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
        }
      }, 100);
    }
  }, [task]);

  // Handle modal visibility animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !formData.title.trim()) return;

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    onSave(task.id, {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
    });

    setIsSubmitting(false);
    handleClose();
  }, [task, formData, onSave, handleClose]);

  // Add keyboard event listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleClose();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (formData.title.trim()) {
          const mockEvent = {
            preventDefault: () => {},
          } as React.FormEvent;
          handleSubmit(mockEvent);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDownEvent, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDownEvent, true);
    };
  }, [isOpen, formData.title, handleClose, handleSubmit]);

  if (!isOpen || !task) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-all duration-300 ease-out ${
        isVisible ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Modal */}
      <div
        className={`bg-white text-vscode-text rounded-md shadow-2xl w-full max-w-2xl mx-4 flex flex-col border border-vscode-border transition-all duration-300 ease-out transform max-h-[85vh] ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-vscode-border">
          <h2 className="text-sm font-medium text-vscode-text">Edit Task</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-vscode-text-muted hover:text-vscode-text hover:bg-vscode-sidebar h-7 w-7 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* Title Field */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Task title"
              className="w-full text-sm text-vscode-text bg-transparent border-none outline-none p-0 placeholder-vscode-text-muted font-medium"
              autoFocus
            />
          </div>

          {/* Description Field - Right after title */}
          <div>
            <div onClick={(e) => e.stopPropagation()}>
              <DynamicRichTextEditor
                content={formData.description}
                onChange={(content: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    description: content,
                  }));
                }}
                placeholder="Add description…"
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (formData.title.trim()) {
                      const mockEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent;
                      handleSubmit(mockEvent);
                    }
                  }
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Properties - Horizontal Stack */}
            <div className="pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Dropdown */}
                <StatusDropdown
                  status={formData.status}
                  onChange={(newStatus) => setFormData((prev) => ({ ...prev, status: newStatus }))}
                />

                {/* Priority Dropdown */}
                <PriorityDropdown
                  priority={formData.priority}
                  onChange={(newPriority) => setFormData((prev) => ({ ...prev, priority: newPriority }))}
                />

                {/* Due Date */}
                {formData.dueDate ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-1.5 h-5 rounded text-xs font-medium bg-blue-50 text-vscode-link border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all duration-200"
                      >
                        {(() => {
                          const date = new Date(formData.dueDate);
                          const month = date.toLocaleDateString('en-US', { month: 'short' });
                          const day = date.getDate().toString().padStart(2, '0');
                          return `${month} ${day}`;
                        })()}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-vscode-border">
                      <CalendarComponent
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date || undefined }))}
                        className="rounded border-0"
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-1.5 h-5 rounded text-xs font-medium bg-gray-50 text-vscode-text-muted border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                      >
                        Due date
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-vscode-border">
                      <CalendarComponent
                        mode="single"
                        selected={undefined}
                        onSelect={(date) => setFormData((prev) => ({ ...prev, dueDate: date || undefined }))}
                        className="rounded border-0"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-vscode-sidebar border-t border-vscode-border">
          <div className="text-[10px] text-vscode-text-muted flex items-center gap-1">
            <span className="bg-vscode-hover px-1.5 py-0.5 rounded border border-vscode-border">esc</span> to close
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="text-vscode-text bg-white hover:bg-vscode-hover border border-vscode-border px-4 py-1.5 text-xs rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isSubmitting}
              className="bg-[#0078d4] hover:bg-[#006cbd] text-white px-4 py-1.5 text-xs rounded transition-all flex items-center gap-2 disabled:bg-[#6e6e6e] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
