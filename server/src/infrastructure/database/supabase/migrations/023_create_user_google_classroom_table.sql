-- Create user_google_classroom table
CREATE TABLE IF NOT EXISTS user_google_classroom (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_google_classroom_user_id ON user_google_classroom(user_id);

-- Enable Row Level Security
ALTER TABLE user_google_classroom ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own tokens
CREATE POLICY "Users can view their own Google Classroom tokens"
  ON user_google_classroom
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own tokens
CREATE POLICY "Users can insert their own Google Classroom tokens"
  ON user_google_classroom
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own tokens
CREATE POLICY "Users can update their own Google Classroom tokens"
  ON user_google_classroom
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own tokens
CREATE POLICY "Users can delete their own Google Classroom tokens"
  ON user_google_classroom
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_google_classroom_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on updates
CREATE TRIGGER trigger_update_user_google_classroom_updated_at
  BEFORE UPDATE ON user_google_classroom
  FOR EACH ROW
  EXECUTE FUNCTION update_user_google_classroom_updated_at();
