import { Note } from "../entities/Note";

export interface INoteRepository {
  createNote(note: Note): Promise<Note>;
  updateNote(note: Note): Promise<Note>;
  deleteNote(noteId: string): Promise<void>;
  getNoteById(noteId: string): Promise<Note | null>;
  getNotesByUserId(): Promise<Note[]>;
}
