export type EmbeddingItem = {
    object: 'embedding';
    embedding: number[];
    index?: number;
    metadata?: Record<string, any> | null;
};

export type EmbeddingListResponse = {
    object: 'list';
    data: EmbeddingItem[];
};
