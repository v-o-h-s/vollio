-- Add folders table for organizing Documents
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT folders_user_id_check CHECK (char_length(user_id) > 0),
  CONSTRAINT folders_name_check CHECK (char_length(name) > 0),
  CONSTRAINT folders_no_self_parent CHECK (id != parent_id)
);

-- Add folder_id column to Documents table
ALTER TABLE documents ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- Enable Row Level Security for folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders table
CREATE POLICY "Users can only view their own folders" ON folders
  FOR SELECT USING (user_id = requesting_user_id());

CREATE POLICY "Users can only create their own folders" ON folders
  FOR INSERT WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can only update their own folders" ON folders
  FOR UPDATE USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can only delete their own folders" ON folders
  FOR DELETE USING (user_id = requesting_user_id());

-- Indexes for performance
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_created_at ON folders(created_at DESC);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);

-- Update trigger for folders table
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get folder path (breadcrumb)
CREATE OR REPLACE FUNCTION get_folder_path(folder_uuid UUID)
RETURNS TABLE(id UUID, name TEXT, parent_id UUID, level INTEGER)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE folder_path AS (
    -- Base case: start with the given folder
    SELECT f.id, f.name, f.parent_id, 0 as level
    FROM folders f
    WHERE f.id = folder_uuid
    
    UNION ALL
    
    -- Recursive case: get parent folders
    SELECT f.id, f.name, f.parent_id, fp.level + 1
    FROM folders f
    INNER JOIN folder_path fp ON f.id = fp.parent_id
  )
  SELECT fp.id, fp.name, fp.parent_id, fp.level
  FROM folder_path fp
  ORDER BY fp.level DESC;
$$;

-- Function to count Documents in a folder (including subfolders)
CREATE OR REPLACE FUNCTION count_documents_in_folder(folder_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE folder_tree AS (
    -- Base case: start with the given folder
    SELECT id FROM folders WHERE id = folder_uuid
    
    UNION ALL
    
    -- Recursive case: get all subfolders
    SELECT f.id
    FROM folders f
    INNER JOIN folder_tree ft ON f.parent_id = ft.id
  )
  SELECT COUNT(*)::INTEGER
  FROM documents p
  WHERE p.folder_id IN (SELECT id FROM folder_tree);
$$;

-- Function to get folder descendants (for circular reference prevention)
CREATE OR REPLACE FUNCTION get_folder_descendants(folder_uuid UUID)
RETURNS TABLE(id UUID, name TEXT, parent_id UUID, level INTEGER)
LANGUAGE SQL
STABLE
AS $$
  WITH RECURSIVE folder_descendants AS (
    -- Base case: start with direct children
    SELECT f.id, f.name, f.parent_id, 1 as level
    FROM folders f
    WHERE f.parent_id = folder_uuid
    
    UNION ALL
    
    -- Recursive case: get descendants
    SELECT f.id, f.name, f.parent_id, fd.level + 1
    FROM folders f
    INNER JOIN folder_descendants fd ON f.parent_id = fd.id
  )
  SELECT fd.id, fd.name, fd.parent_id, fd.level
  FROM folder_descendants fd
  ORDER BY fd.level, fd.name;
$$;