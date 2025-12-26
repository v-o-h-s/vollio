ALTER TABLE documents ADD CONSTRAINT unique_user_google_document UNIQUE(user_id, google_document_id);
