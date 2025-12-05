-- Add token_expiry column to user_google_classroom table
ALTER TABLE user_google_classroom 
ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP WITH TIME ZONE;
