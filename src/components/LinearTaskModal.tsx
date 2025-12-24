/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { StatusDropdown } from './StatusDropdown';
import { PriorityDropdown } from './PriorityDropdown';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { DynamicRichTextEditor } from './DynamicRichTextEditor';

interface LinearTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: {
    title: string;
    description: string;
    status: string;
    priority: 'none' | 'low' | 'medium' | 'high';
    dueDate?: Date;
  }) => void;
}

export const LinearTaskModal: React.FC<LinearTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('none');
      setDueDate(undefined);
      setIsSubmitting(false);

      // Trigger opening animation
      setIsVisible(true);

      // Focus title field after animation starts
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
        }
      }, 150);
    } else {
      // Trigger closing animation
      setIsVisible(false);
    }
  }, [isOpen]);

  // Define callback functions first before they're used in other useEffects
  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleCreateTask = useCallback(() => {
    if (title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onCreateTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate,
      });
      setIsVisible(false);
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 300);
    }
  }, [title, description, status, priority, dueDate, onCreateTask, onClose, isSubmitting]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (title.trim()) {
        handleCreateTask();
      }
    }
  }, [handleClose, handleCreateTask, title]);

  // Separate useEffect for keyboard handling - now placed after callbacks are defined
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (title.trim()) {
          handleCreateTask();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isOpen, title, handleCreateTask, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[15vh] transition-all duration-300 ease-out ${
        isVisible ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`bg-white text-vscode-text rounded-md shadow-2xl w-full max-w-2xl mx-4 flex flex-col border border-vscode-border transition-all duration-300 ease-out transform max-h-[85vh] ${
          isVisible
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-vscode-border">
          <h2 className="text-sm font-medium text-vscode-text">New Task</h2>
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
        <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
          {/* Title Field */}
          <div>
            <input
              ref={titleRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-sm text-vscode-text bg-transparent border-none outline-none p-0 placeholder-vscode-text-muted font-medium"
              style={{ caretColor: '#3794ff' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
                handleKeyDown(e);
              }}
            />
          </div>

          {/* Description Field */}
          <div>
            <DynamicRichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Add description…"
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleClose();
                } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  if (title.trim()) {
                    handleCreateTask();
                  }
                }
              }}
            />
          </div>

          {/* Properties - Horizontal Stack */}
          <div className="pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Dropdown */}
              <StatusDropdown
                status={status as "todo" | "in_progress" | "completed" | "canceled"}
                onChange={(newStatus) => setStatus(newStatus)}
              />

              {/* Priority Dropdown */}
              <PriorityDropdown
                priority={(priority === 'none' ? 'low' : priority) as "high" | "medium" | "low"}
                onChange={(newPriority) => setPriority(newPriority)}
              />

              {/* Due Date */}
              {dueDate ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-1 px-1.5 h-5 rounded text-xs font-medium bg-blue-50 text-vscode-link border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all duration-200"
                    >
                      {(() => {
                        const date = new Date(dueDate);
                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                        const day = date.getDate().toString().padStart(2, '0');
                        return `${month} ${day}`;
                      })()}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-vscode-border">
                    <CalendarComponent
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => setDueDate(date || undefined)}
                      className="rounded border-0"
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="flex items-center gap-1 px-1.5 h-5 rounded text-xs font-medium bg-gray-50 text-vscode-text-muted border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                    >
                      Due date
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-vscode-border">
                    <CalendarComponent
                      mode="single"
                      selected={undefined}
                      onSelect={(date) => setDueDate(date || undefined)}
                      className="rounded border-0"
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
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
              onClick={handleCreateTask}
              disabled={!title.trim() || isSubmitting}
              className="bg-[#0078d4] hover:bg-[#006cbd] text-white px-4 py-1.5 text-xs rounded transition-all flex items-center gap-2 disabled:bg-[#6e6e6e] disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create task
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
