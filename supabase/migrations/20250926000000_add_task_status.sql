-- Add status field to tasks table to replace simple completed boolean
-- This will allow for multiple task statuses: todo, in_progress, completed, canceled

-- First, add the new status column
ALTER TABLE tasks ADD COLUMN status TEXT;

-- Create a check constraint for valid status values
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'in_progress', 'completed', 'canceled'));

-- Set default status based on existing completed field
UPDATE tasks SET status = CASE 
    WHEN completed = true THEN 'completed'
    ELSE 'todo'
END;

-- Make status column required
ALTER TABLE tasks ALTER COLUMN status SET NOT NULL;

-- Set default value for new tasks
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'todo';

-- Index for better query performance on status
CREATE INDEX idx_tasks_status ON tasks(status);

-- We keep the completed column for now for backward compatibility
-- You can remove it later once all code is updated
-- ALTER TABLE tasks DROP COLUMN completed;
