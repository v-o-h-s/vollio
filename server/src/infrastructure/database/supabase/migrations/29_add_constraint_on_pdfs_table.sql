ALTER TABLE pdfs ADD CONSTRAINT unique_user_google_file UNIQUE(user_id, google_file_id);
