/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontalIcon,
  PlusIcon,
  Edit,
  Trash2,
  Calendar,
  X,
  Layers2,
  CircleDashed,
  Contrast,
  CircleCheck,
  CircleX,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { TEXT } from "../lib/constants";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { LinearTaskModal } from "./LinearTaskModal";
import { CommandPalette } from "./CommandPalette";
import { EditTaskModal } from "./EditTaskModal";
import { StatusDropdown } from "./StatusDropdown";
import { PriorityDropdown } from "./PriorityDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { useTasks, Task } from "../hooks/useTasks";
import { useUserPreferences } from "../hooks/useUserPreferences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Sortable Task Component for drag and drop
interface SortableTaskProps {
  task: Task;
  handleStatusChange: (
    taskId: string,
    newStatus: "todo" | "in_progress" | "completed" | "canceled"
  ) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  openEditModal: (task: Task) => void;
  openDeleteConfirmation: (task: Task) => void;
}

function SortableTask({
  task,
  handleStatusChange,
  updateTask,
  openEditModal,
  openDeleteConfirmation,
}: SortableTaskProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    console.log('📅 Setting due date for task:', task.id, 'to:', date);
    updateTask(task.id, { dueDate: date || undefined });
    setDueDatePopoverOpen(false);
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "none", // No transition for instant position changes
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: isMobile ? "none" : "auto",
      }}
      className={`vscode-tree-item group bg-white border-b border-vscode-border hover:bg-vscode-hover transition-colors duration-100 w-full ${
        isDragging ? "shadow-md z-50 bg-vscode-hover" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 cursor-grab active:cursor-grabbing w-full"
        style={{ touchAction: "none" }}
      >
        {/* Status Dropdown - VS Code checkbox style */}
        <div onClick={(e) => e.stopPropagation()}>
          <StatusDropdown
            status={task.status}
            onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
            showText={false}
          />
        </div>

        <div className="flex-1 min-w-0" onClick={() => openEditModal(task)}>
          <div
            className={`task-title font-normal leading-snug cursor-pointer flex items-center ${
              task.status === "completed"
                ? "text-vscode-text-muted line-through"
                : task.status === "canceled"
                  ? "text-vscode-text-muted line-through opacity-60"
                  : "text-vscode-text"
            }`}
          >
            <span className="truncate">
              {task.title}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 ml-auto">
          {/* Desktop: Priority and Date badges - VS Code style */}
          <div
            className="hidden sm:flex sm:items-center sm:gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <PriorityDropdown
              priority={task.priority as "high" | "medium" | "low"}
              onChange={(newPriority) => updateTask(task.id, { priority: newPriority })}
              showText={true}
            />

            {task.dueDate ? (
              <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDueDatePopoverOpen(true);
                    }}
                    className="task-badge font-medium px-1.5 h-5 rounded bg-blue-50 text-vscode-link border border-blue-200 cursor-pointer hover:bg-blue-100 leading-none flex items-center"
                  >
                    {(() => {
                      const date = new Date(task.dueDate);
                      const month = date.toLocaleDateString("en-US", {
                        month: "short",
                      });
                      const day = date.getDate().toString().padStart(2, "0");
                      return `${month} ${day}`;
                    })()}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-vscode-border">
                  <CalendarComponent
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={handleDateSelect}
                    className="rounded border-0"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Popover open={dueDatePopoverOpen} onOpenChange={setDueDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDueDatePopoverOpen(true);
                    }}
                    className="text-vscode-xs text-vscode-text-muted hover:text-vscode-text cursor-pointer px-1"
                  >
                    +date
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border border-vscode-border">
                  <CalendarComponent
                    mode="single"
                    selected={undefined}
                    onSelect={handleDateSelect}
                    className="rounded border-0"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Three dots menu - VS Code style */}
          <div
            className="flex-shrink-0 ml-1"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-6 h-6 hover:bg-vscode-hover transition-opacity border-none outline-none focus:outline-none focus:ring-0 bg-transparent p-0 m-0 flex items-center justify-center rounded">
                  <MoreHorizontalIcon className="w-4 h-4 text-vscode-icon" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border border-vscode-border rounded p-1 bg-white shadow-lg min-w-[140px]"
              >
                {/* Mobile-only Priority and Date controls */}
                <div className="sm:hidden">
                  <div className="px-2 py-1">
                    <PriorityDropdown
                      priority={task.priority as "high" | "medium" | "low"}
                      onChange={(newPriority) => updateTask(task.id, { priority: newPriority })}
                      showText={true}
                    />
                  </div>

                  {task.dueDate ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <DropdownMenuItem
                          className="text-vscode flex items-center gap-2 px-2 py-1 rounded hover:bg-vscode-hover"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Calendar className="w-3.5 h-3.5 text-vscode-icon" />
                          {TEXT.DUE}:{" "}
                          {(() => {
                            const date = new Date(task.dueDate);
                            const month = date.toLocaleDateString("en-US", {
                              month: "short",
                            });
                            const day = date
                              .getDate()
                              .toString()
                              .padStart(2, "0");
                            return `${month} ${day}`;
                          })()}
                        </DropdownMenuItem>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border border-vscode-border">
                        <CalendarComponent
                          mode="single"
                          selected={
                            task.dueDate ? new Date(task.dueDate) : undefined
                          }
                          onSelect={(date) =>
                            updateTask(task.id, {
                              dueDate: date || undefined,
                            })
                          }
                          className="rounded border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <DropdownMenuItem
                      className="text-vscode flex items-center gap-2 px-2 py-1 rounded hover:bg-vscode-hover"
                      onClick={() => {
                        const today = new Date();
                        updateTask(task.id, { dueDate: today });
                      }}
                    >
                      <Calendar className="w-3.5 h-3.5 text-vscode-icon" />
                      {TEXT.SET_DUE_DATE}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-vscode-border my-1" />
                </div>

                <DropdownMenuItem
                  className="text-vscode flex items-center gap-2 px-2 py-1 rounded hover:bg-vscode-hover text-vscode-text"
                  onClick={() => openEditModal(task)}
                >
                  <Edit className="w-3.5 h-3.5 text-vscode-icon" />
                  {TEXT.EDIT}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-vscode flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 text-vscode-error"
                  onClick={() => openDeleteConfirmation(task)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {TEXT.DELETE}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Circle Component
interface ProfileCircleProps {
  onClick: () => void;
}

function ProfileCircle({ onClick }: ProfileCircleProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Check if user is signed in with Google
  const isGoogleAuth = () => {
    return user?.identities?.some((identity: { provider: string }) => identity.provider === 'google') || false;
  };

  const getUserAvatar = () => {
    if (!user) return null;

    // For Google auth users, prioritize Google avatar
    if (isGoogleAuth()) {
      return user.user_metadata?.avatar_url || 
             user.user_metadata?.picture || 
             null;
    }

    // For regular email auth, they might have a custom avatar in the future
    // For now, return null to show initials
    return user.user_metadata?.avatar_url || null;
  };

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.id]);

  const getInitials = () => {
    if (!user) return "U";
    
    const name = user.user_metadata?.full_name || 
                 user.user_metadata?.name || 
                 user.email?.split("@")[0] || 
                 "User";
    
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = getUserAvatar();
  const showImage = avatarUrl && !imageError;

  // Debug logging (remove in production)
  useEffect(() => {
    if (user) {
      const googleAuth = user.identities?.some((identity: { provider: string }) => identity.provider === 'google') || false;
      console.log('👤 Profile Debug:', {
        isGoogle: googleAuth,
        avatarUrl: avatarUrl,
        userMetadata: user.user_metadata,
        identities: user.identities
      });
    }
  }, [user, avatarUrl]);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="w-6 h-6 rounded bg-vscode-sidebar border border-vscode-input-border hover:bg-vscode-hover transition-colors overflow-hidden flex items-center justify-center"
        title="Open Settings (S)"
      >
        {showImage ? (
          <Image
            src={avatarUrl}
            alt="Profile"
            width={24}
            height={24}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            unoptimized={true}
          />
        ) : (
          <span className="text-vscode-xs font-medium text-vscode-text">
            {getInitials()}
          </span>
        )}
      </button>
    </div>
  );
}

export function TasksPageFull() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const {
    tasks,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    reorderTaskInFilter,
    deleteTask,
    clearCompletedTasks,
    clearError,
    refetch,
  } = useTasks();

  const { preferences, updateWallpaper } = useUserPreferences();

  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>("default");
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [tempSelectedTheme, setTempSelectedTheme] = useState<string>("default");

  // Load theme from user preferences or localStorage as fallback
  useEffect(() => {
    if (preferences?.wallpaper_id) {
      // Use database value if available
      setSelectedTheme(preferences.wallpaper_id);
    } else {
      // Fallback to localStorage for backwards compatibility
      const savedTheme = localStorage.getItem("dashboard-theme");
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    }
  }, [preferences]);

  // Handle theme change from settings - now saves to database
  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);
    // Save to database if user preferences are available
    if (preferences) {
      await updateWallpaper(theme);
    } else {
      // Fallback to localStorage
      localStorage.setItem("dashboard-theme", theme);
    }
  };

  // Theme modal functions
  const openThemeModal = () => {
    setTempSelectedTheme(selectedTheme);
    setShowThemeModal(true);
  };

  const closeThemeModal = useCallback(() => {
    setShowThemeModal(false);
  }, []);

  const saveTheme = async () => {
    setSelectedTheme(tempSelectedTheme);
    // Save to database if user preferences are available
    if (preferences) {
      await updateWallpaper(tempSelectedTheme);
    } else {
      // Fallback to localStorage
      localStorage.setItem("dashboard-theme", tempSelectedTheme);
    }
    closeThemeModal();
  };

  // Available themes
  const themes = [
    { id: "default", name: "Default", image: null },
    { id: "im1", name: "Kluane National Park", image: "/im1.jpeg" },
    { id: "im2", name: "Weisshorn, Randa", image: "/im2.jpeg" },
    { id: "im3", name: "Sagarmatha National Park", image: "/im3.jpeg" },
  ];

  // Filter state
  const [activeFilter, setActiveFilter] = useState("1");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Drag and drop sensors with better configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start drag after 5px movement (more responsive)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter pills matching the mobile design

  // Filter tasks based on active filter and search query (renamed to avoid conflict)
  const baseFilteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter first
    if (searchQuery.trim()) {
      filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Then apply active filter and sort by order_position
    let result: typeof filtered = [];

    switch (activeFilter) {
      case "2": // Todo
        result = filtered.filter((t) => t.status === "todo");
        break;
      case "7": // In Progress
        result = filtered.filter((t) => t.status === "in_progress");
        break;
      case "3": // Completed
        result = filtered.filter((t) => t.status === "completed");
        break;
      case "8": // Canceled
        result = filtered.filter((t) => t.status === "canceled");
        break;
      default: // All tasks
        result = filtered;
        break;
    }

    // Sort by the appropriate order field based on current filter
    return result.sort((a, b) => {
      let aOrder = a.allTasksOrder;
      let bOrder = b.allTasksOrder;

      // Use the appropriate order field based on active filter
      switch (activeFilter) {
        case "2": // Todo
          aOrder = a.todoOrder || a.allTasksOrder;
          bOrder = b.todoOrder || b.allTasksOrder;
          break;
        case "7": // In Progress
          aOrder = a.inProgressOrder || a.allTasksOrder;
          bOrder = b.inProgressOrder || b.allTasksOrder;
          break;
        case "3": // Completed
          aOrder = a.completedOrder || a.allTasksOrder;
          bOrder = b.completedOrder || b.allTasksOrder;
          break;
        case "8": // Canceled
          aOrder = a.canceledOrder || a.allTasksOrder;
          bOrder = b.canceledOrder || b.allTasksOrder;
          break;
        default: // All Tasks
          aOrder = a.allTasksOrder;
          bOrder = b.allTasksOrder;
          break;
      }

      return aOrder - bOrder;
    });
  }, [tasks, activeFilter, searchQuery]);

  // Use base filtered tasks directly for now (debugging)
  const filteredTasks = baseFilteredTasks;

  const handleStatusChange = async (
    taskId: string,
    newStatus: "todo" | "in_progress" | "completed" | "canceled"
  ) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // Handle drag end for reordering tasks
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🎯 Drag end triggered", {
      activeId: active.id,
      overId: over?.id,
    });

    if (!over || active.id === over.id) {
      console.log("❌ No valid drop target");
      return;
    }

    const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
    const newIndex = filteredTasks.findIndex((task) => task.id === over.id);

    console.log("📍 Indexes:", {
      oldIndex,
      newIndex,
      totalTasks: filteredTasks.length,
    });

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      const activeTask = filteredTasks[oldIndex];

      // Fix position calculation for correct placement
      const reorderedList = [...filteredTasks];
      const [movedTask] = reorderedList.splice(oldIndex, 1);
      reorderedList.splice(newIndex, 0, movedTask);

      // Update ALL tasks with their new positions to ensure correct order
      const updates = reorderedList.map((task, index) => {
        const position = index + 1;
        console.log(`📝 Task "${task.title}" → position ${position}`);
        return reorderTaskInFilter(task.id, position, activeFilter);
      });

      console.log(
        `🎯 REORDERING: "${activeTask.title}" from ${oldIndex + 1} to ${newIndex + 1}`,
        {
          direction: oldIndex < newIndex ? "DOWN ⬇️" : "UP ⬆️",
          activeFilter,
          totalUpdates: updates.length,
        }
      );

      try {
        // Update all task positions
        await Promise.all(updates);
        console.log("✅ All positions updated");

        // Refresh to show correct order
        setTimeout(() => {
          refetch().then(() => console.log("✅ Order refreshed"));
        }, 100);
      } catch (error) {
        console.error("❌ Failed to reorder:", error);
      }
    } else {
      console.log("❌ Invalid index change");
    }
  };

  const createNewTask = async (taskData: {
    title: string;
    description: string;
    status: string;
    priority: "none" | "low" | "medium" | "high";
    dueDate?: Date;
  }) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description || undefined,
        priority: taskData.priority === "none" ? "low" : taskData.priority,
        dueDate: taskData.dueDate,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const openDeleteConfirmation = (task: Task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleEditTask = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      await updateTask(taskId, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await clearCompletedTasks();
    } catch (error) {
      console.error("Failed to clear completed tasks:", error);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTaskModalOpen(true);
  };

  const closeEditModal = () => {
    setEditTaskModalOpen(false);
    setEditingTask(null);
  };

  // Command palette handler functions
  const handleSetFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("Key pressed:", event.key, "Modals open:", {
        newTaskModalOpen,
        commandPaletteOpen,
        editTaskModalOpen,
        showThemeModal,
      });

      // Global Add Task shortcut (Ctrl+Shift+A or Cmd+Shift+A) - Works from anywhere
      if (event.key.toLowerCase() === "a" && (event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey) {
        console.log("Global Add Task hotkey (Ctrl/Cmd+Shift+A) pressed");
        event.preventDefault();
        event.stopPropagation();
        // Close any open modal first, then open new task modal
        if (showThemeModal) closeThemeModal();
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (editTaskModalOpen) setEditTaskModalOpen(false);
        setNewTaskModalOpen(true);
        return;
      }

      // Handle Esc key for theme modal
      if (showThemeModal && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeThemeModal();
        console.log("Esc - closing theme modal");
        return;
      }

      // Don't handle other shortcuts if any modal is open
      if (
        newTaskModalOpen ||
        commandPaletteOpen ||
        editTaskModalOpen ||
        showThemeModal
      ) {
        console.log("Shortcuts blocked - modal is open");
        return;
      }

      // Command Palette shortcut (Ctrl+K or Cmd+K)
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopPropagation();
        setCommandPaletteOpen(true);
        return;
      }

      // Check if T key is pressed (case insensitive) - Open New Task
      if (event.key.toLowerCase() === "t") {
        console.log("T key pressed, checking conditions...");
        // Check if any modifier keys are pressed
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
          console.log("T key blocked - modifier keys pressed");
          return;
        }

        // Check if user is typing in an input field
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            (activeElement as HTMLElement).contentEditable === "true")
        ) {
          console.log("T key blocked - typing in input field");
          return;
        }

        // All checks passed - open modal
        console.log("T key - opening new task modal");
        event.preventDefault();
        event.stopPropagation();
        setNewTaskModalOpen(true);
      }

      // Check if S key is pressed (case insensitive) - Open Settings
      if (event.key.toLowerCase() === "s") {
        console.log("S key pressed, checking conditions...");
        // Check if any modifier keys are pressed
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
          console.log("S key blocked - modifier keys pressed");
          return;
        }

        // Check if user is typing in an input field
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            (activeElement as HTMLElement).contentEditable === "true")
        ) {
          console.log("S key blocked - typing in input field");
          return;
        }

        // All checks passed - show settings view
        console.log("S key - showing settings view");
        event.preventDefault();
        event.stopPropagation();
        setActiveFilter("settings");
      }

      // Check if user is typing in an input field for filter shortcuts
      const activeElement = document.activeElement;
      const isTyping = activeElement && 
        (activeElement.tagName === "INPUT" ||
         activeElement.tagName === "TEXTAREA" ||
         (activeElement as HTMLElement).contentEditable === "true");

      // Filter shortcuts with Cmd/Ctrl modifier
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && !isTyping) {
        if (event.key === "1") {
          // Cmd+1: Show All Tasks
          event.preventDefault();
          event.stopPropagation();
          setActiveFilter("1");
          console.log("Cmd+1 - showing all tasks");
        } else if (event.key === "2") {
          // Cmd+2: Show Todo Tasks
          event.preventDefault();
          event.stopPropagation();
          setActiveFilter("2");
          console.log("Cmd+2 - showing todo tasks");
        } else if (event.key === "3") {
          // Cmd+3: Show In Progress Tasks
          event.preventDefault();
          event.stopPropagation();
          setActiveFilter("3");
          console.log("Cmd+3 - showing in progress tasks");
        } else if (event.key === "4") {
          // Cmd+4: Show Completed Tasks
          event.preventDefault();
          event.stopPropagation();
          setActiveFilter("4");
          console.log("Cmd+4 - showing completed tasks");
        } else if (event.key === "5") {
          // Cmd+5: Show Cancelled Tasks
          event.preventDefault();
          event.stopPropagation();
          setActiveFilter("5");
          console.log("Cmd+5 - showing cancelled tasks");
        }
      }

      // Clear completed tasks shortcut: Shift+Cmd+C
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "c" && !event.altKey && !isTyping) {
        event.preventDefault();
        event.stopPropagation();
        clearCompletedTasks();
        console.log("Shift+Cmd+C - clearing completed tasks");
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
    newTaskModalOpen,
    commandPaletteOpen,
    editTaskModalOpen,
    showThemeModal,
    closeThemeModal,
    setCommandPaletteOpen,
    setEditTaskModalOpen,
    setNewTaskModalOpen,
    clearCompletedTasks,
  ]);

  return (
    <>
      <div
        className="flex flex-col w-full h-screen overflow-hidden bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 flex-shrink-0 bg-white border-b border-vscode-border">
          {/* Left: Logo + Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <Image
              src="/Slane.png"
              alt="Slane"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-vscode-text-muted">/</span>
            <span className="text-sm text-vscode-text-muted">
              {activeFilter === "1" && "All Tasks"}
              {activeFilter === "2" && "Todo"}
              {activeFilter === "7" && "In Progress"}
              {activeFilter === "3" && "Completed"}
              {activeFilter === "8" && "Cancelled"}
              {activeFilter === "settings" && "Settings"}
            </span>
          </div>

          {/* Center: Search input */}
          <div className="hidden sm:flex items-center justify-center flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vscode-text-muted"
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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-vscode-sidebar border border-vscode-border rounded-md focus:outline-none focus:border-vscode-focus focus:ring-1 focus:ring-vscode-focus"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-vscode-text-muted bg-vscode-hover px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex items-center">
            <ProfileCircle onClick={() => setActiveFilter("settings")} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* VS Code Activity Bar */}
          <div className="vscode-activitybar w-12 flex-shrink-0 flex flex-col items-center py-1.5 gap-1.5">
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("1")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "1" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <Layers2 className={`w-[18px] h-[18px] ${activeFilter === "1" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">All Tasks</span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setNewTaskModalOpen(true)}
                className="w-10 h-9 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
              >
                <PlusIcon className="w-[18px] h-[18px] text-white/60" />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">New Task (T)</span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("2")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "2" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <CircleDashed className={`w-[18px] h-[18px] ${activeFilter === "2" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Todo</span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("7")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "7" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <Contrast className={`w-[18px] h-[18px] ${activeFilter === "7" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">In Progress</span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("3")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "3" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <CircleCheck className={`w-[18px] h-[18px] ${activeFilter === "3" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Completed</span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("8")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "8" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <CircleX className={`w-[18px] h-[18px] ${activeFilter === "8" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Cancelled</span>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="relative group">
              <button
                onClick={() => setActiveFilter("settings")}
                className={`w-10 h-9 flex items-center justify-center rounded-sm transition-colors ${
                  activeFilter === "settings" 
                    ? "bg-white/15 border-l-2 border-white" 
                    : "hover:bg-white/10 border-l-2 border-transparent"
                }`}
              >
                <Settings className={`w-[18px] h-[18px] ${activeFilter === "settings" ? "text-white" : "text-white/60"}`} />
              </button>
              <span className="absolute left-full ml-2 bottom-0 px-2 py-1 bg-[#1e1e1e] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">Settings (S)</span>
            </div>
          </div>

          {/* Editor Area (Main Content) */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
              {activeFilter === "settings" ? (
                /* Settings View - Centered */
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-sm px-6">
                    {/* Profile Avatar */}
                    <div className="flex justify-center mb-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-vscode-sidebar border-2 border-vscode-border flex items-center justify-center overflow-hidden">
                          {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                            <Image
                              src={user.user_metadata.avatar_url || user.user_metadata.picture}
                              alt="Profile"
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-medium text-vscode-text">
                              {(user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-vscode-border rounded-full flex items-center justify-center hover:bg-vscode-hover transition-colors">
                          <Edit className="w-3.5 h-3.5 text-vscode-text-muted" />
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-medium text-vscode-text-muted mb-1.5">Name</label>
                        <input
                          type="text"
                          defaultValue={user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""}
                          className="w-full px-3 py-2 text-sm bg-white border border-vscode-border rounded-md focus:outline-none focus:border-vscode-focus focus:ring-1 focus:ring-vscode-focus text-vscode-text"
                          placeholder="Your name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-vscode-text-muted mb-1.5">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email || ""}
                          className="w-full px-3 py-2 text-sm bg-white border border-vscode-border rounded-md focus:outline-none focus:border-vscode-focus focus:ring-1 focus:ring-vscode-focus text-vscode-text"
                          placeholder="your@email.com"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-medium text-vscode-text-muted mb-1.5">Password</label>
                        <input
                          type="password"
                          defaultValue="••••••••"
                          className="w-full px-3 py-2 text-sm bg-white border border-vscode-border rounded-md focus:outline-none focus:border-vscode-focus focus:ring-1 focus:ring-vscode-focus text-vscode-text"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <div className="mt-6">
                      <button
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0078d4] text-white rounded-md hover:bg-[#006cbd] transition-colors"
                      >
                        <span className="text-sm font-medium">Save Changes</span>
                      </button>
                    </div>

                    {/* Logout Button */}
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          try {
                            await signOut();
                            router.push("/login");
                          } catch (error) {
                            console.error("Failed to sign out:", error);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tasks View */
                <>
                  {/* Error Message */}
                  {error && (
                    <div className="mx-3 mt-2 p-2 bg-red-50 border border-red-200 rounded text-vscode">
                      <div className="flex items-center justify-between">
                        <p className="text-vscode-error">{error}</p>
                        <button
                          onClick={clearError}
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {filteredTasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-vscode-text-muted">
                      <Layers2 className="w-12 h-12 mb-3 opacity-40" />
                      <p className="text-vscode">No tasks found</p>
                      <p className="text-vscode-sm mt-1">Press <kbd className="px-1.5 py-0.5 bg-vscode-hover rounded text-vscode-xs">T</kbd> to create a task</p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="py-1">
                        {/* List View */}
                        <SortableContext
                          items={filteredTasks.map((task) => task.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {filteredTasks.map((task) => (
                            <SortableTask
                              key={task.id}
                              task={task}
                              handleStatusChange={handleStatusChange}
                              updateTask={updateTask}
                              openEditModal={openEditModal}
                              openDeleteConfirmation={openDeleteConfirmation}
                            />
                          ))}
                        </SortableContext>
                      </div>
                    </DndContext>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Linear Task Modal */}
      <LinearTaskModal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        onCreateTask={createNewTask}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => {
          setCommandPaletteOpen(false);
          setActiveFilter("settings");
        }}
        onCreateTask={() => {
          setCommandPaletteOpen(false);
          setNewTaskModalOpen(true);
        }}
        onSetFilter={handleSetFilter}
        onClearCompleted={handleClearCompleted}
        onToggleSidebar={() => {}} // No sidebar anymore, so this is a no-op
        tasks={tasks}
        onOpenEditTask={(task) => {
          setCommandPaletteOpen(false);
          setEditingTask(task);
          setEditTaskModalOpen(true);
        }}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={editTaskModalOpen}
        onClose={closeEditModal}
        task={editingTask}
        onSave={handleEditTask}
      />

      {/* Theme Selection Modal - VS Code Style */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-vscode-border rounded w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-4 py-2 border-b border-vscode-border bg-vscode-sidebar flex items-center justify-between">
              <span className="text-vscode font-medium text-vscode-text">Choose Wallpaper</span>
              <button
                onClick={closeThemeModal}
                className="w-6 h-6 flex items-center justify-center hover:bg-vscode-hover rounded"
              >
                <X className="w-4 h-4 text-vscode-icon" />
              </button>
            </div>

            {/* Theme Selection Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTempSelectedTheme(theme.id)}
                    className={`relative p-2 rounded border transition-all ${
                      tempSelectedTheme === theme.id
                        ? "border-vscode-focus bg-blue-50"
                        : "border-vscode-border hover:border-vscode-input-border"
                    }`}
                  >
                    {theme.image ? (
                      <div className="relative w-full h-20 rounded overflow-hidden mb-2">
                        <Image
                          src={theme.image}
                          alt={theme.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded bg-vscode-sidebar flex items-center justify-center mb-2 border border-vscode-border">
                        <span className="text-vscode-xs text-vscode-text-muted">Default</span>
                      </div>
                    )}
                    <div className="text-vscode-sm text-vscode-text text-center">
                      {theme.name}
                    </div>
                    {tempSelectedTheme === theme.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-vscode-button rounded flex items-center justify-center">
                        <span className="text-white text-vscode-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-vscode-border flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeThemeModal}
                className="text-vscode border-vscode-input-border hover:bg-vscode-hover"
              >
                Cancel
              </Button>
              <Button
                onClick={saveTheme}
                className="vscode-button text-vscode"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - VS Code Style */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm bg-white border border-vscode-border rounded shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-vscode-lg text-vscode-text font-medium">
              {TEXT.DELETE_TASK}
            </DialogTitle>
            <DialogDescription className="text-vscode text-vscode-text-muted">
              {TEXT.DELETE_TASK_CONFIRMATION.replace(
                "{title}",
                taskToDelete?.title || ""
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={closeDeleteConfirmation}
              className="text-vscode border-vscode-input-border hover:bg-vscode-hover"
            >
              {TEXT.CANCEL}
            </Button>
            <Button
              variant="destructive"
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete.id)}
              className="bg-vscode-error hover:bg-red-600 text-white text-vscode"
            >
              {TEXT.DELETE_TASK_BUTTON}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
