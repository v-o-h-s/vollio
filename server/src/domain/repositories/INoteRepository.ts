import { Note } from "../Note";

export interface INoteRepository {
    createNote(note: Note): Promise<Note>;
    updateNote(note: Note): Promise<Note>;
    deleteNote(noteId: string): Promise<void>;
    getNoteById(noteId: string): Promise<Note | null>;
    getNotesByUserId(userId: string): Promise<Note[]>;
}
