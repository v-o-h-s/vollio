-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.folders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) > 0),
  parent_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT folders_pkey PRIMARY KEY (id),
  CONSTRAINT folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.folders(id),
  CONSTRAINT folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.highlights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL,
  type character varying NOT NULL DEFAULT 'text'::character varying CHECK (type::text = ANY (ARRAY['text'::character varying, 'area'::character varying]::text[])),
  content jsonb DEFAULT '{}'::jsonb CHECK (jsonb_typeof(content) = 'object'::text),
  position jsonb NOT NULL CHECK (jsonb_typeof("position") = 'object'::text),
  color character varying,
  has_note boolean NOT NULL DEFAULT false,
  note_id uuid,
  tags ARRAY DEFAULT '{}'::text[],
  style character varying DEFAULT 'highlight'::character varying CHECK (style::text = ANY (ARRAY['highlight'::character varying, 'underline'::character varying, 'tagged'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT highlights_pkey PRIMARY KEY (id),
  CONSTRAINT highlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT highlights_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  content jsonb CHECK (content IS NULL OR content ? 'type'::text),
  document_id uuid,
  document_annotation_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false,
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notes_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  documentname text NOT NULL CHECK (char_length(documentname) > 0),
  document_size bigint NOT NULL CHECK (document_size > 0),
  storage_path text,
  mime_type text NOT NULL DEFAULT 'application/document'::text,
  uploaded_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  folder_id uuid,
  google_document_id text,
  user_id uuid NOT NULL,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL,
  main_points ARRAY DEFAULT '{}'::text[],
  attributes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT summaries_pkey PRIMARY KEY (id),
  CONSTRAINT summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT summaries_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.user_google_classroom (
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  scope text NOT NULL,
  token_type text NOT NULL,
  expires_in integer NOT NULL,
  connected_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_google_classroom_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_google_classroom_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);