/**
 * Highlight type enum
 */
export type HighlightType = "text" | "area";

/**
 * Highlight visual style enum
 */
export type HighlightStyle = "highlight" | "tagged";

/**
 * Highlight content with optional text or image
 */
export interface HighlightContent {
  text?: string;
  image?: string;
}

/**
 * Rectangle coordinates for positioning
 */
export interface Scaled {
  height: number;
  pageNumber: number;
  width: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * Scaled position of the highlight
 */
export interface ScaledPosition {
  boundingRect: Scaled;
  rects: Scaled[];
  useDocumentCoordinates?: boolean;
}

/**
 * Highlight domain entity
 */
export class Highlight {
  private id: string;
  private userId: string;
  private documentId: string;
  private type: HighlightType;
  private content: HighlightContent;
  private position: ScaledPosition;
  private color?: string;
  private hasNote: boolean;
  private noteId?: string | null;
  private tags?: string[];
  private style?: HighlightStyle;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    documentId: string,
    type: HighlightType,
    content: HighlightContent,
    position: ScaledPosition,
    hasNote: boolean = false,
    createdAt?: Date,
    updatedAt?: Date,
    color?: string,
    noteId?: string | null,
    tags?: string[],
    style?: HighlightStyle
  ) {
    this.id = id;
    this.userId = userId;
    this.documentId = documentId;
    this.type = type;
    this.content = content;
    this.position = position;
    this.hasNote = hasNote;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.color = color;
    this.noteId = noteId;
    this.tags = tags;
    this.style = style;
  }

  /**
   * Get highlight ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Get user ID
   */
  public getUserId(): string {
    return this.userId;
  }

  /**
   * Get Document ID
   */
  public getDocumentId(): string {
    return this.documentId;
  }


  /**
   * Get highlight type
   */
  public getType(): HighlightType {
    return this.type;
  }

  /**
   * Get highlight content
   */
  public getContent(): HighlightContent {
    return this.content;
  }

  /**
   * Get highlight position
   */
  public getPosition(): ScaledPosition {
    return this.position;
  }

  /**
   * Get highlight color
   */
  public getColor(): string | undefined {
    return this.color;
  }

  /**
   * Set highlight color
   */
  public setColor(color: string | undefined): void {
    this.color = color;
    this.updatedAt = new Date();
  }

  /**
   * Check if highlight has note
   */
  public hasNoteAttached(): boolean {
    return this.hasNote;
  }

  /**
   * Get has note flag
   */
  public getHasNote(): boolean {
    return this.hasNote;
  }
  /**
   * Set has note flag
   */
  public setHasNote(hasNote: boolean): void {
    this.hasNote = hasNote;
    this.updatedAt = new Date();
  }

  /**
   * Get note ID
   */
  public getNoteId(): string | null | undefined {
    return this.noteId;
  }

  /**
   * Set note ID
   */
  public setNoteId(noteId: string | null | undefined): void {
    this.noteId = noteId;
    this.updatedAt = new Date();
  }

  /**
   * Get tags
   */
  public getTags(): string[] | undefined {
    return this.tags;
  }

  /**
   * Set tags
   */
  public setTags(tags: string[] | undefined): void {
    this.tags = tags;
    this.updatedAt = new Date();
  }

  /**
   * Get visual style
   */
  public getStyle(): HighlightStyle | undefined {
    return this.style;
  }

  /**
   * Set visual style
   */
  public setStyle(style: HighlightStyle | undefined): void {
    this.style = style;
    this.updatedAt = new Date();
  }

  /**
   * Get creation date
   */
  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Get last update date
   */
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Convert to plain object
   */
  public toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      document_id: this.documentId,
      type: this.type,
      content: this.content,
      position: this.position,
      color: this.color,
      has_note: this.hasNote,
      note_id: this.noteId,
      tags: this.tags,
      style: this.style,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
