-- Add order_position field to tasks table for drag and drop reordering
-- This allows users to rearrange tasks within each status filter

-- Add the order_position column
ALTER TABLE tasks ADD COLUMN order_position INTEGER;

-- Set initial order positions based on created_at timestamp
-- Earlier tasks get lower numbers (appear first)
UPDATE tasks SET order_position = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY user_id, status 
        ORDER BY created_at ASC
    )
    FROM tasks t2 
    WHERE t2.id = tasks.id
);

-- Make order_position required with default
ALTER TABLE tasks ALTER COLUMN order_position SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN order_position SET DEFAULT 1;

-- Create index for better query performance on ordering
CREATE INDEX idx_tasks_user_status_order ON tasks(user_id, status, order_position);

-- Create index for reordering operations
CREATE INDEX idx_tasks_order_position ON tasks(order_position);

-- Function to automatically set order_position for new tasks
-- New tasks get the highest order_position + 1 within their status group
CREATE OR REPLACE FUNCTION set_task_order_position()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set order_position if it's not provided (for new inserts)
    IF NEW.order_position IS NULL THEN
        SELECT COALESCE(MAX(order_position), 0) + 1
        INTO NEW.order_position
        FROM tasks 
        WHERE user_id = NEW.user_id 
        AND status = NEW.status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set order_position for new tasks
CREATE TRIGGER set_task_order_position_trigger
    BEFORE INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_order_position();

-- Function to reorder tasks when one task's position changes
-- This ensures no gaps in order_position sequence
CREATE OR REPLACE FUNCTION reorder_tasks_after_position_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If order_position changed, reorder all tasks in the same user/status group
    IF OLD.order_position IS DISTINCT FROM NEW.order_position 
       OR OLD.status IS DISTINCT FROM NEW.status THEN
        
        -- If status changed, we need to reorder both old and new status groups
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            -- Reorder old status group
            WITH reordered AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY order_position) as new_position
                FROM tasks 
                WHERE user_id = OLD.user_id 
                AND status = OLD.status 
                AND id != NEW.id
            )
            UPDATE tasks 
            SET order_position = reordered.new_position
            FROM reordered 
            WHERE tasks.id = reordered.id;
        END IF;
        
        -- Reorder current status group
        WITH reordered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY order_position) as new_position
            FROM tasks 
            WHERE user_id = NEW.user_id 
            AND status = NEW.status
        )
        UPDATE tasks 
        SET order_position = reordered.new_position
        FROM reordered 
        WHERE tasks.id = reordered.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic reordering
CREATE TRIGGER reorder_tasks_trigger
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION reorder_tasks_after_position_change();
