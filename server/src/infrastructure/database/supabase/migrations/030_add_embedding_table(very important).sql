

begin
-- 2️⃣ Create embeddings table with foreign key to pdfs and owner user
create table embeddings (
    id uuid primary key default gen_random_uuid(),          -- unique ID for each embedding chunk
    user_id uuid not null,                                  -- owner (references auth.users)
    document_id uuid not null,                              -- foreign key to pdfs table
    content text not null,                                  -- the actual chunk text
    embedding vector(512) not null,                         -- vector embedding (dimension 512 for Qwen3)
    chunk_index int not null,                               -- order of chunk within document
    token_count int,                                        -- token count for this chunk
    metadata jsonb,                                         -- chunk metadata: pageRange, heading, etc.
    created_at timestamptz default now(),                   -- creation timestamp
    updated_at timestamptz default now(),                   -- last update timestamp
    
    -- Constraints
    constraint embeddings_user_id_fk foreign key (user_id) references auth.users(id) on delete cascade,
    constraint embeddings_document_id_fk foreign key (document_id) references pdfs(id) on delete cascade,
    constraint embeddings_chunk_index_check check (chunk_index >= 0),
    constraint embeddings_token_count_check check (token_count > 0 or token_count is null),
    constraint embeddings_content_check check (char_length(content) > 0)
);

-- 3️⃣ Create indexes for fast similarity search and queries
create index idx_embeddings_user_id on embeddings(user_id);
create index idx_embeddings_document_id on embeddings(document_id);
create index idx_embeddings_created_at on embeddings(created_at);
create index idx_embeddings_embedding on embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 4️⃣ Create function for similarity search
create or replace function search_embeddings(
    query_embedding vector(512),
    match_threshold float default 0.7,
    match_count int default 10
)
returns table (
    id uuid,
    user_id uuid,
    document_id uuid,
    content text,
    similarity float,
    chunk_index int,
    metadata jsonb
) as $$

    return query
    select
        embeddings.id,
        embeddings.user_id,
        embeddings.document_id,
        embeddings.content,
        (1 - (embeddings.embedding <=> query_embedding))::float as similarity,
        embeddings.chunk_index,
        embeddings.metadata
    from embeddings
    where (1 - (embeddings.embedding <=> query_embedding)) > match_threshold
    order by embeddings.embedding <=> query_embedding
    limit match_count;
end;
$$ language plpgsql;
