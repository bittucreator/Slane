-- Fix task ordering to work separately for each filter view
-- Each filter view will have its own ordering system

-- Drop the existing order_position column and recreate with better structure
ALTER TABLE tasks DROP COLUMN IF EXISTS order_position;

-- Add separate order positions for each filter view
ALTER TABLE tasks ADD COLUMN all_tasks_order INTEGER;
ALTER TABLE tasks ADD COLUMN todo_order INTEGER;
ALTER TABLE tasks ADD COLUMN in_progress_order INTEGER;
ALTER TABLE tasks ADD COLUMN completed_order INTEGER;
ALTER TABLE tasks ADD COLUMN canceled_order INTEGER;

-- Set initial order positions for "All Tasks" view (shows all tasks)
UPDATE tasks SET all_tasks_order = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id
);

-- Set initial order positions for "Todo" view (shows only todo tasks)
UPDATE tasks SET todo_order = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id AND t2.status = 'todo'
)
WHERE status = 'todo';

-- Set initial order positions for "In Progress" view (shows only in_progress tasks)
UPDATE tasks SET in_progress_order = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id AND t2.status = 'in_progress'
)
WHERE status = 'in_progress';

-- Set initial order positions for "Completed" view (shows only completed tasks)
UPDATE tasks SET completed_order = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id AND t2.status = 'completed'
)
WHERE status = 'completed';

-- Set initial order positions for "Canceled" view (shows only canceled tasks)
UPDATE tasks SET canceled_order = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id AND t2.status = 'canceled'
)
WHERE status = 'canceled';

-- Set defaults for new tasks
ALTER TABLE tasks ALTER COLUMN all_tasks_order SET DEFAULT 1;
ALTER TABLE tasks ALTER COLUMN todo_order SET DEFAULT 1;
ALTER TABLE tasks ALTER COLUMN in_progress_order SET DEFAULT 1;
ALTER TABLE tasks ALTER COLUMN completed_order SET DEFAULT 1;
ALTER TABLE tasks ALTER COLUMN canceled_order SET DEFAULT 1;

-- Create indexes for better performance
CREATE INDEX idx_tasks_all_tasks_order ON tasks(user_id, all_tasks_order);
CREATE INDEX idx_tasks_todo_order ON tasks(user_id, todo_order) WHERE status = 'todo';
CREATE INDEX idx_tasks_in_progress_order ON tasks(user_id, in_progress_order) WHERE status = 'in_progress';
CREATE INDEX idx_tasks_completed_order ON tasks(user_id, completed_order) WHERE status = 'completed';
CREATE INDEX idx_tasks_canceled_order ON tasks(user_id, canceled_order) WHERE status = 'canceled';

-- Drop old indexes
DROP INDEX IF EXISTS idx_tasks_user_status_order;
DROP INDEX IF EXISTS idx_tasks_order_position;

-- Function to automatically set order positions for new tasks
CREATE OR REPLACE FUNCTION set_task_order_positions()
RETURNS TRIGGER AS $$
BEGIN
    -- Set all_tasks_order (for "All Tasks" filter)
    IF NEW.all_tasks_order IS NULL THEN
        SELECT COALESCE(MAX(all_tasks_order), 0) + 1
        INTO NEW.all_tasks_order
        FROM tasks 
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- Set status-specific order based on the task status
    IF NEW.status = 'todo' AND NEW.todo_order IS NULL THEN
        SELECT COALESCE(MAX(todo_order), 0) + 1
        INTO NEW.todo_order
        FROM tasks 
        WHERE user_id = NEW.user_id AND status = 'todo';
    END IF;
    
    IF NEW.status = 'in_progress' AND NEW.in_progress_order IS NULL THEN
        SELECT COALESCE(MAX(in_progress_order), 0) + 1
        INTO NEW.in_progress_order
        FROM tasks 
        WHERE user_id = NEW.user_id AND status = 'in_progress';
    END IF;
    
    IF NEW.status = 'completed' AND NEW.completed_order IS NULL THEN
        SELECT COALESCE(MAX(completed_order), 0) + 1
        INTO NEW.completed_order
        FROM tasks 
        WHERE user_id = NEW.user_id AND status = 'completed';
    END IF;
    
    IF NEW.status = 'canceled' AND NEW.canceled_order IS NULL THEN
        SELECT COALESCE(MAX(canceled_order), 0) + 1
        INTO NEW.canceled_order
        FROM tasks 
        WHERE user_id = NEW.user_id AND status = 'canceled';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS set_task_order_position_trigger ON tasks;
CREATE TRIGGER set_task_order_positions_trigger
    BEFORE INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_order_positions();
