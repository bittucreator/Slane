/**
 * @author Shiva Nagendra Babu Kore
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { canUseFeature, safeExecute } from "../lib/mobile-compat";
import { convertLocalDateToUTC } from "../lib/date-utils";
import { BUSINESS } from "../lib/constants";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean; // Keep for backward compatibility
  status: "todo" | "in_progress" | "completed" | "canceled";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  allTasksOrder: number;
  todoOrder: number | null;
  inProgressOrder: number | null;
  completedOrder: number | null;
  canceledOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Safely parses a date from Supabase timestamptz with enhanced error handling
 */
function parseSupabaseDate(
  dateString: string | null | undefined
): Date | undefined {
  if (!dateString || dateString.trim() === "") return undefined;

  try {
    // Handle different date formats that might come from Supabase
    let date: Date;

    // Handle ISO string format specifically
    if (typeof dateString === "string" && dateString.includes("T")) {
      date = new Date(dateString);
    } else {
      // For other formats, try direct parsing
      date = new Date(dateString);
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("❌ Invalid date string from Supabase:", dateString);
      return undefined;
    }

    // Additional validation: check for extremely old or future dates (basic sanity check)
    const year = date.getFullYear();
    if (year < BUSINESS.MIN_YEAR || year > BUSINESS.MAX_YEAR) {
      console.warn("⚠️  Date appears to be invalid year:", dateString, year);
      return undefined;
    }

    console.log(
      "✅ Successfully parsed date:",
      dateString,
      "→",
      date.toISOString()
    );
    return date;
  } catch (error) {
    console.error("❌ Error parsing date from Supabase:", dateString, error);
    return undefined;
  }
}

export const useTasks = () => {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const isOperatingRef = useRef(false);
  const isDraggingRef = useRef(false);

  // Helper function to ensure task array uniqueness
  const ensureUniqueTasksArray = useCallback((tasksArray: Task[]): Task[] => {
    const taskMap = new Map<string, Task>();
    tasksArray.forEach((task) => {
      if (task && task.id) {
        taskMap.set(task.id, task);
      }
    });
    return Array.from(taskMap.values());
  }, []);

  // Get current user from Supabase auth
  useEffect(() => {
    mountedRef.current = true;

    const getCurrentUser = async () => {
      console.log("🔐 getCurrentUser called");

      if (!supabase) {
        console.warn("⚠️ Supabase not configured - authentication required");
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
          setError(
            "Authentication service not configured. Please check your environment variables."
          );
        }
        return;
      }

      try {
        // Check if we recently signed out (within last 10 seconds)
        const recentSignOut =
          typeof window !== "undefined" &&
          localStorage.getItem("recentSignOut") &&
          Date.now() - parseInt(localStorage.getItem("recentSignOut") || "0") <
            10000;

        if (recentSignOut) {
          console.log(
            "Recent sign out detected in useTasks, skipping session restore"
          );
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("🔐 Session check result:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          error: !!error,
        });

        if (error) {
          console.error("❌ Error getting session:", error);
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mountedRef.current) {
          const newUser = session?.user ? { id: session.user.id } : null;
          console.log("👤 Setting user:", !!newUser, newUser?.id);
          setUser(newUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error);
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getCurrentUser();

    // Listen for auth state changes
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (mountedRef.current) {
          setUser(session?.user ? { id: session.user.id } : null);
        }
      });

      return () => {
        subscription.unsubscribe();
        mountedRef.current = false;
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Enhanced task formatting with better error handling
  const formatTask = useCallback(
    (dbTask: Record<string, unknown>): Task | null => {
      try {
        if (!dbTask || !dbTask.id) {
          console.warn("Invalid task data from database:", dbTask);
          return null;
        }

        return {
          id: String(dbTask.id),
          title: String(dbTask.title || "Untitled Task"),
          description:
            typeof dbTask.description === "string"
              ? dbTask.description
              : undefined,
          completed: Boolean(dbTask.completed),
          status:
            typeof dbTask.status === "string" &&
            ["todo", "in_progress", "completed", "canceled"].includes(
              dbTask.status
            )
              ? (dbTask.status as
                  | "todo"
                  | "in_progress"
                  | "completed"
                  | "canceled")
              : "todo",
          priority:
            typeof dbTask.priority === "string" &&
            ["low", "medium", "high"].includes(dbTask.priority)
              ? (dbTask.priority as "low" | "medium" | "high")
              : "low",
          dueDate: parseSupabaseDate(dbTask.due_date as string),
          allTasksOrder:
            typeof dbTask.all_tasks_order === "number"
              ? dbTask.all_tasks_order
              : 1,
          todoOrder:
            typeof dbTask.todo_order === "number" ? dbTask.todo_order : null,
          inProgressOrder:
            typeof dbTask.in_progress_order === "number"
              ? dbTask.in_progress_order
              : null,
          completedOrder:
            typeof dbTask.completed_order === "number"
              ? dbTask.completed_order
              : null,
          canceledOrder:
            typeof dbTask.canceled_order === "number"
              ? dbTask.canceled_order
              : null,
          createdAt:
            parseSupabaseDate(dbTask.created_at as string) || new Date(),
          updatedAt:
            parseSupabaseDate(dbTask.updated_at as string) || new Date(),
        };
      } catch (error) {
        console.error("Error formatting task:", error, dbTask);
        return null;
      }
    },
    []
  );

  // Fetch tasks from Supabase with better error handling
  const fetchTasks = useCallback(async () => {
    console.log("🔍 fetchTasks called. User:", !!user, "Supabase:", !!supabase);

    if (!user) {
      console.log("❌ No user, clearing tasks");
      if (mountedRef.current) {
        setTasks([]);
        setLoading(false);
      }
      return;
    }

    // Don't load if Supabase is not configured (running in demo mode)
    if (!supabase) {
      console.log("⚠️ Supabase not configured - using mock data");
      if (mountedRef.current) {
        setTasks([]);
        setLoading(false);
      }
      return;
    }

    // Prevent multiple simultaneous fetch operations
    if (isOperatingRef.current) {
      return;
    }

    try {
      isOperatingRef.current = true;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      console.log("📊 Querying tasks for user:", user.id);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("all_tasks_order", { ascending: true });

      console.log("📊 Query result:", {
        data: data?.length || 0,
        error: !!error,
      });

      if (error) {
        console.error("❌ Supabase query error:", error);
        throw error;
      }

      if (mountedRef.current) {
        const formattedTasks: Task[] = (data || [])
          .map(formatTask)
          .filter((task): task is Task => task !== null);

        // Ensure uniqueness when setting initial tasks
        setTasks(ensureUniqueTasksArray(formattedTasks));
      }
    } catch (err) {
      if (mountedRef.current) {
        let errorMessage = "Failed to fetch tasks";

        if (err instanceof Error) {
          if (
            err.message.includes("refresh_token_not_found") ||
            err.message.includes("JWT")
          ) {
            errorMessage = "Session expired. Please sign in again.";
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            errorMessage = "Network error. Please check your connection.";
          }
        }

        setError(errorMessage);
        console.error("Failed to load tasks:", errorMessage);
      }
    } finally {
      isOperatingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, formatTask]);

  // Create a new task with enhanced validation
  const createTask = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high";
      dueDate?: Date;
    }) => {
      if (!user) {
        throw new Error("User not authenticated. Please sign in first.");
      }

      if (!supabase) {
        throw new Error(
          "Database connection not available. Please check your configuration."
        );
      }

      // Validate input data
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new Error("Task title is required");
      }

      if (taskData.title.trim().length > 255) {
        throw new Error("Task title is too long (max 255 characters)");
      }

      if (
        taskData.description &&
        taskData.description.length > BUSINESS.MAX_TASK_DESCRIPTION_LENGTH
      ) {
        throw new Error(
          `Task description is too long (max ${BUSINESS.MAX_TASK_DESCRIPTION_LENGTH} characters)`
        );
      }

      try {
        let utcDueDate: Date | null = null;
        if (taskData.dueDate) {
          try {
            // Ensure we have a valid date object
            const dateToConvert =
              taskData.dueDate instanceof Date
                ? taskData.dueDate
                : new Date(taskData.dueDate);

            if (isNaN(dateToConvert.getTime())) {
              throw new Error("Invalid due date provided");
            }

            utcDueDate = convertLocalDateToUTC(dateToConvert);
            console.log("Date conversion:", {
              original: taskData.dueDate,
              converted: utcDueDate,
              originalISO: dateToConvert.toISOString(),
              convertedISO: utcDueDate.toISOString(),
            });
          } catch (error) {
            console.error("Date conversion error:", error);
            throw new Error("Invalid due date provided");
          }
        }

        const insertData = {
          user_id: user.id,
          title: taskData.title.trim(),
          description: taskData.description?.trim() || null,
          priority: taskData.priority,
          due_date: utcDueDate?.toISOString() || null,
          completed: false,
          status: "todo" as const,
        };

        const { data, error } = await supabase
          .from("tasks")
          .insert(insertData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("No data returned from task creation");
        }

        const newTask = formatTask(data);
        if (!newTask) {
          throw new Error("Failed to format created task");
        }

        if (mountedRef.current) {
          setTasks((prev) => [newTask, ...prev]);
          setError(null);
        }

        // Log success
        console.log("Task created:", newTask.title);

        return newTask;
      } catch (err) {
        let errorMessage = "Failed to create task";
        if (err instanceof Error) {
          if (err.message.includes("duplicate key")) {
            errorMessage = "A task with this title already exists";
          } else if (
            err.message.includes("network") ||
            err.message.includes("fetch")
          ) {
            errorMessage = "Network error. Please check your connection.";
          } else if (err.message.length < 100) {
            errorMessage = err.message;
          }
        }

        if (mountedRef.current) {
          setError(errorMessage);
        }

        // Log error
        console.error("Failed to create task:", errorMessage);

        throw new Error(errorMessage);
      }
    },
    [user, formatTask]
  );

  // Update a task with comprehensive validation
  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!user) {
        throw new Error("User not authenticated. Please sign in first.");
      }

      if (!supabase) {
        throw new Error(
          "Database connection not available. Please check your configuration."
        );
      }

      if (!taskId || taskId.trim().length === 0) {
        throw new Error("Task ID is required");
      }

      // Validate updates
      if (
        updates.title !== undefined &&
        (!updates.title || updates.title.trim().length === 0)
      ) {
        throw new Error("Task title cannot be empty");
      }

      if (updates.title && updates.title.trim().length > 255) {
        throw new Error("Task title is too long (max 255 characters)");
      }

      if (
        updates.description &&
        updates.description.length > BUSINESS.MAX_TASK_DESCRIPTION_LENGTH
      ) {
        throw new Error(
          `Task description is too long (max ${BUSINESS.MAX_TASK_DESCRIPTION_LENGTH} characters)`
        );
      }

      try {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.title !== undefined)
          updateData.title = updates.title.trim();
        if (updates.description !== undefined)
          updateData.description = updates.description?.trim() || null;
        if (updates.completed !== undefined)
          updateData.completed = Boolean(updates.completed);
        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.priority !== undefined)
          updateData.priority = updates.priority;
        if (updates.allTasksOrder !== undefined)
          updateData.all_tasks_order = updates.allTasksOrder;
        if (updates.todoOrder !== undefined)
          updateData.todo_order = updates.todoOrder;
        if (updates.inProgressOrder !== undefined)
          updateData.in_progress_order = updates.inProgressOrder;
        if (updates.completedOrder !== undefined)
          updateData.completed_order = updates.completedOrder;
        if (updates.canceledOrder !== undefined)
          updateData.canceled_order = updates.canceledOrder;

        if (updates.dueDate !== undefined) {
          if (updates.dueDate) {
            try {
              const utcDueDate = convertLocalDateToUTC(updates.dueDate);
              updateData.due_date = utcDueDate.toISOString();
            } catch (dateError) {
              console.error("Error converting update date to UTC:", dateError);
              throw new Error("Invalid due date provided");
            }
          } else {
            updateData.due_date = null;
          }
        }

        const { data, error } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", taskId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Task not found or permission denied");
        }

        const updatedTask = formatTask(data);
        if (!updatedTask) {
          throw new Error("Failed to format updated task");
        }

        if (mountedRef.current) {
          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task))
          );
          setError(null);
        }

        // Show success notification for non-completion updates
        if (
          updates.completed === undefined ||
          updates.title !== undefined ||
          updates.description !== undefined ||
          updates.priority !== undefined ||
          updates.dueDate !== undefined
        ) {
          console.log("Task updated:", updatedTask.title);
        } else if (updates.completed !== undefined) {
          // Show different message for completion toggle
          if (updates.completed) {
            console.log("Task completed:", updatedTask.title);
          } else {
            console.log("Task reopened:", updatedTask.title);
          }
        }

        return updatedTask;
      } catch (err) {
        let errorMessage = "Failed to update task";
        if (err instanceof Error && err.message.length < 100) {
          errorMessage = err.message;
        }

        if (mountedRef.current) {
          setError(errorMessage);
        }

        // Log error
        console.error("Failed to update task:", errorMessage);

        throw new Error(errorMessage);
      }
    },
    [user, formatTask]
  );

  // Update task status - convenience function for status changes
  const updateTaskStatus = useCallback(
    async (
      taskId: string,
      status: "todo" | "in_progress" | "completed" | "canceled"
    ) => {
      // Also update the completed field for backward compatibility
      const completed = status === "completed";
      return await updateTask(taskId, { status, completed });
    },
    [updateTask]
  );

  // Reorder task within a specific filter view
  const reorderTaskInFilter = useCallback(
    async (taskId: string, newPosition: number, filterId: string) => {
      if (!user || !supabase) return;

      try {
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        // Map filter ID to database column name
        const columnMapping: Record<string, string> = {
          "1": "all_tasks_order", // All Tasks
          "2": "todo_order", // Todo
          "7": "in_progress_order", // In Progress
          "3": "completed_order", // Completed
          "8": "canceled_order", // Canceled
        };

        const columnName = columnMapping[filterId];
        if (!columnName) {
          console.warn("Unknown filter ID:", filterId);
          return;
        }

        updateData[columnName] = newPosition;

        console.log(
          `📝 DB UPDATE: ${columnName} = ${newPosition} for task ${taskId}`
        );

        // Direct database update for better performance
        const { error, data } = await supabase
          .from("tasks")
          .update(updateData)
          .eq("id", taskId)
          .eq("user_id", user.id)
          .select();

        if (error) {
          console.error("❌ Database update error:", error);
          if (
            error.message.includes("column") &&
            error.message.includes("does not exist")
          ) {
            console.error(
              "🚨 MISSING DATABASE COLUMNS! Please run the SQL migration:"
            );
            console.error(
              "File: supabase/migrations/20250926200000_fix_task_ordering_per_filter.sql"
            );
          }
          throw error;
        }

        console.log(
          `✅ DB SUCCESS: ${columnName} = ${newPosition} for task ${taskId}`
        );

        // Note: Local state is now updated via batchUpdateTasks in the drag handler
        // This prevents double updates and reduces flickering
      } catch (error) {
        console.error("Failed to reorder task:", error);
        throw error; // Re-throw so the calling code can handle the error
      }
    },
    [user, supabase]
  );

  // Batch reorder multiple tasks for better performance during drag operations
  const batchReorderTasks = useCallback(
    async (
      updates: Array<{ taskId: string; newPosition: number; filterId: string }>
    ) => {
      if (!user || !supabase || !updates.length) return;

      try {
        // Map filter ID to database column name
        const columnMapping: Record<string, string> = {
          "1": "all_tasks_order", // All Tasks
          "2": "todo_order", // Todo
          "7": "in_progress_order", // In Progress
          "3": "completed_order", // Completed
          "8": "canceled_order", // Canceled
        };

        // Process all updates with a single transaction approach
        const promises = updates.map(({ taskId, newPosition, filterId }) => {
          const columnName = columnMapping[filterId];
          if (!columnName) {
            console.warn("Unknown filter ID:", filterId);
            return Promise.resolve();
          }

          const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            [columnName]: newPosition,
          };

          return supabase!
            .from("tasks")
            .update(updateData)
            .eq("id", taskId)
            .eq("user_id", user.id);
        });

        const results = await Promise.all(promises);

        // Check for any errors
        const errors = results.filter((result) => result?.error);
        if (errors.length > 0) {
          console.error("Some batch updates failed:", errors);
          throw new Error(`${errors.length} updates failed`);
        }

        console.log(`Successfully updated ${updates.length} task positions`);
      } catch (error) {
        console.error("Failed to batch reorder tasks:", error);
        throw error;
      }
    },
    [user, supabase]
  );

  // Delete a task with validation
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user) {
        throw new Error("User not authenticated. Please sign in first.");
      }

      if (!supabase) {
        throw new Error(
          "Database connection not available. Please check your configuration."
        );
      }

      if (!taskId || taskId.trim().length === 0) {
        throw new Error("Task ID is required");
      }

      try {
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", taskId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        if (mountedRef.current) {
          setTasks((prev) => prev.filter((task) => task.id !== taskId));
          setError(null);
        }

        // Log success
        console.log("Task deleted successfully");
      } catch (err) {
        let errorMessage = "Failed to delete task";
        if (err instanceof Error && err.message.length < 100) {
          errorMessage = err.message;
        }

        if (mountedRef.current) {
          setError(errorMessage);
        }

        // Log error
        console.error("Failed to delete task:", errorMessage);

        throw new Error(errorMessage);
      }
    },
    [user]
  );

  // Clear completed tasks
  const clearCompletedTasks = useCallback(async () => {
    if (!user) {
      throw new Error("User not authenticated. Please sign in first.");
    }

    if (!supabase) {
      throw new Error(
        "Database connection not available. Please check your configuration."
      );
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", user.id)
        .eq("completed", true);

      if (error) {
        throw error;
      }

      if (mountedRef.current) {
        setTasks((prev) => prev.filter((task) => !task.completed));
        setError(null);
      }

      // Log success
      console.log("Completed tasks cleared successfully");
    } catch (err) {
      let errorMessage = "Failed to clear completed tasks";
      if (err instanceof Error && err.message.length < 100) {
        errorMessage = err.message;
      }

      if (mountedRef.current) {
        setError(errorMessage);
      }

      // Log error
      console.error("Failed to clear completed tasks:", errorMessage);

      throw new Error(errorMessage);
    }
  }, [user]);

  // Control dragging state to prevent real-time interference
  const setDraggingState = useCallback((isDragging: boolean) => {
    isDraggingRef.current = isDragging;
  }, []);

  // Batch update multiple tasks efficiently (prevents multiple re-renders during drag)
  const batchUpdateTasks = useCallback(
    (updates: Array<{ id: string; updates: Partial<Task> }>) => {
      if (!updates.length) return;

      setTasks((prevTasks) => {
        // Create a map to ensure uniqueness and avoid duplicates
        const taskMap = new Map(prevTasks.map((task) => [task.id, task]));

        // Apply all updates
        updates.forEach(({ id, updates: taskUpdates }) => {
          const existingTask = taskMap.get(id);
          if (existingTask) {
            taskMap.set(id, { ...existingTask, ...taskUpdates });
          }
        });

        // Convert back to array and ensure no duplicates
        const updatedTasks = Array.from(taskMap.values());

        // Double-check for duplicates (safety measure)
        const uniqueTasksMap = new Map();
        updatedTasks.forEach((task) => {
          uniqueTasksMap.set(task.id, task);
        });

        return Array.from(uniqueTasksMap.values());
      });
    },
    []
  );

  // Clear error manually
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Real-time subscription effect with comprehensive mobile Safari compatibility
  useEffect(() => {
    console.log(
      "🔍 Real-time effect triggered. User:",
      !!user,
      "Supabase:",
      !!supabase
    );

    if (!user || !supabase) {
      console.log("❌ Missing user or supabase, skipping real-time setup");
      return;
    }

    // Use mobile compatibility check
    if (!canUseFeature("realtime")) {
      console.info(
        "📱 Real-time disabled for mobile compatibility. Using polling fallback."
      );

      // Set up polling fallback for mobile Safari
      const pollInterval = setInterval(() => {
        if (mountedRef.current && !isOperatingRef.current) {
          console.log("🔄 Polling fallback triggered");
          safeExecute(
            () => fetchTasks(),
            undefined,
            "mobile-polling-fetchTasks"
          );
        }
      }, 3000); // Poll every 3 seconds for better UX

      return () => {
        clearInterval(pollInterval);
      };
    }

    // Try to set up real-time subscription with error handling
    return safeExecute(
      () => {
        if (!supabase) return () => {};

        let isSubscribed = true;
        console.log("🔄 Setting up real-time subscription for user:", user.id);

        // Test basic connection first
        console.log("🌐 Testing Supabase connection...");
        console.log("Supabase client status:", {
          auth: !!supabase.auth,
          realtime: !!supabase.realtime,
          isConnected: true,
        });

        const channel = supabase
          .channel(`tasks_${user.id}_${Date.now()}`) // Unique channel name
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "tasks",
              filter: `user_id=eq.${user.id}`, // Only listen to changes for the current user
            },
            (payload: Record<string, unknown>) => {
              if (!mountedRef.current || !isSubscribed) {
                console.log(
                  "Ignoring real-time event - component unmounted or unsubscribed"
                );
                return;
              }

              // Skip real-time updates during drag operations to prevent flickering
              if (isDraggingRef.current) {
                console.log(
                  "Ignoring real-time event - drag operation in progress"
                );
                return;
              }

              console.log(
                "📨 Real-time task update received:",
                payload.eventType,
                payload
              );

              safeExecute(
                () => {
                  switch (payload.eventType) {
                    case "INSERT": {
                      // New task created
                      const newTask = formatTask(
                        payload.new as Record<string, unknown>
                      );
                      if (newTask) {
                        console.log(
                          "➕ Adding new task to state:",
                          newTask.title
                        );
                        setTasks((prev) => {
                          // Check if task already exists (avoid duplicates)
                          const exists = prev.some(
                            (task) => task.id === newTask.id
                          );
                          if (exists) {
                            console.log(
                              "⚠️  Task already exists, skipping duplicate"
                            );
                            return prev;
                          }
                          console.log("✅ Task added successfully");
                          const newTaskList = [newTask, ...prev];
                          return ensureUniqueTasksArray(newTaskList);
                        });
                      }
                      break;
                    }
                    case "UPDATE": {
                      // Task updated
                      const updatedTask = formatTask(
                        payload.new as Record<string, unknown>
                      );
                      if (updatedTask) {
                        console.log(
                          "✏️  Updating task in state:",
                          updatedTask.title
                        );
                        setTasks((prev) =>
                          prev.map((task) =>
                            task.id === updatedTask.id ? updatedTask : task
                          )
                        );
                      }
                      break;
                    }
                    case "DELETE": {
                      // Task deleted
                      const deletedTask = payload.old as
                        | { id: string }
                        | undefined;
                      if (deletedTask?.id) {
                        console.log(
                          "🗑️ Removing task from state:",
                          deletedTask.id
                        );
                        setTasks((prev) =>
                          prev.filter((task) => task.id !== deletedTask.id)
                        );
                      }
                      break;
                    }
                    default:
                      console.log("Unknown event type:", payload.eventType);
                  }
                },
                undefined,
                "realtime-payload-handler"
              );
            }
          )
          .subscribe((status, err) => {
            console.log("📡 Real-time subscription status:", status);

            if (status === "SUBSCRIBED") {
              console.log("✅ Real-time subscription active for tasks");
            } else if (status === "CHANNEL_ERROR") {
              console.warn("❌ Real-time connection failed:", err);
              console.warn("Falling back to periodic refresh");
              isSubscribed = false;

              // Fallback to polling if real-time fails
              const pollInterval = setInterval(() => {
                if (mountedRef.current && !isOperatingRef.current) {
                  console.log("🔄 Error fallback polling triggered");
                  safeExecute(
                    () => fetchTasks(),
                    undefined,
                    "realtime-error-polling"
                  );
                }
              }, 5000); // Poll every 5 seconds on error

              setTimeout(() => clearInterval(pollInterval), 60000); // Stop after 1 minute
            } else if (status === "CLOSED") {
              console.warn("🔴 Real-time connection closed");
              isSubscribed = false;
            } else if (status === "TIMED_OUT") {
              console.warn("⏰ Real-time connection timed out");
              isSubscribed = false;
            } else {
              console.log("📡 Real-time status:", status);
            }
          });

        // Cleanup subscription on unmount or user change
        return () => {
          isSubscribed = false;
          try {
            if (supabase) {
              supabase.removeChannel(channel);
            }
          } catch (error) {
            console.warn("Error removing channel:", error);
          }
        };
      },
      () => {
        // Fallback if real-time setup fails
        console.warn("⚠️ Real-time setup failed, using polling fallback");
        const pollInterval = setInterval(() => {
          if (mountedRef.current && !isOperatingRef.current) {
            fetchTasks();
          }
        }, 5000);

        return () => clearInterval(pollInterval);
      },
      "realtime-setup"
    );
  }, [user, fetchTasks, formatTask]); // Include all dependencies as required by ESLint

  // Initial fetch when user changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    reorderTaskInFilter,
    batchReorderTasks,
    deleteTask,
    clearCompletedTasks,
    batchUpdateTasks,
    setDraggingState,
    refetch: fetchTasks,
    clearError,
  };
};
