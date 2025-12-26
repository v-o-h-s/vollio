import { JSONSchemaType } from "ajv";

/**
 * Rectangle schema for positioning
 */
interface Scaled {
  height: number;
  pageNumber: number;
  width: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * Scaled position schema
 */
interface ScaledPosition {
  boundingRect: Scaled;
  rects: Scaled[];
  usePdfCoordinates?: boolean;
}

/**
 * Highlight content schema
 */
export interface HighlightContent {
  text?: string;
  image?: string;
}

/**
 * DTO for creating a highlight
 */
export interface CreateHighlightDTO {
  id: string;
  documentId: string;
  type?: "text" | "area";
  content?: HighlightContent;
  position: ScaledPosition;
  color?: string;
  hasNote?: boolean;
  noteId?: string | null;
  tags?: string[];
  style?: "highlight" | "tagged";
}

const scaledSchema: JSONSchemaType<Scaled> = {
  type: "object",
  properties: {
    height: { type: "number" },
    pageNumber: { type: "integer" },
    width: { type: "number" },
    x1: { type: "number" },
    x2: { type: "number" },
    y1: { type: "number" },
    y2: { type: "number" },
  },
  required: ["height", "pageNumber", "width", "x1", "x2", "y1", "y2"],
  additionalProperties: false,
} as any;

const scaledPositionSchema: JSONSchemaType<ScaledPosition> = {
  type: "object",
  properties: {
    boundingRect: scaledSchema,
    rects: {
      type: "array",
      items: scaledSchema,
    },
    usePdfCoordinates: {
      type: "boolean",
      nullable: true,
    },
  },
  required: ["boundingRect", "rects"],
  additionalProperties: false,
} as any;

const contentSchema: JSONSchemaType<HighlightContent> = {
  type: "object",
  properties: {
    text: {
      type: "string",
      nullable: true,
    },
    image: {
      type: "string",
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
} as any;

export const createHighlightSchema: JSONSchemaType<CreateHighlightDTO> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    type: {
      type: "string",
      enum: ["text", "area"],
      nullable: true,
    },
    content: {
      ...contentSchema,
      nullable: true,
    },
    position: scaledPositionSchema,
    color: {
      type: "string",
      nullable: true,
    },
    hasNote: {
      type: "boolean",
      nullable: true,
    },
    noteId: {
      type: "string",
      nullable: true,
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    style: {
      type: "string",
      enum: ["highlight", "tagged"],
      nullable: true,
    },
  },
  required: ["id", "documentId", "position"],
  additionalProperties: false,
} as any;

/**
 * DTO for updating a highlight
 */
export interface UpdateHighlightDTO {
  color?: string;
  content?: HighlightContent;
  hasNote?: boolean;
  noteId?: string | null;
  position?: ScaledPosition;
  type?: "text" | "area";
  documentId?: string;
  tags?: string[];
  style?: "highlight" | "tagged";
}

export const updateHighlightSchema: JSONSchemaType<UpdateHighlightDTO> = {
  type: "object",
  properties: {
    color: {
      type: "string",
      nullable: true,
    },
    content: {
      ...contentSchema,
      nullable: true,
    },
    hasNote: {
      type: "boolean",
      nullable: true,
    },
    noteId: {
      type: "string",
      nullable: true,
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    position: {
      ...scaledPositionSchema,
      nullable: true,
    },
    type: {
      type: "string",
      enum: ["text", "area"],
      nullable: true,
    },
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      nullable: true,
    },
    tags: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    style: {
      type: "string",
      enum: ["highlight", "tagged"],
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
} as any;

/**
 * DTO for highlight ID params
 */
export interface HighlightIdParams {
  id: string;
}

export const highlightIdParamsSchema: JSONSchemaType<HighlightIdParams> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["id"],
  additionalProperties: false,
} as any;

/**
 * Query parameters for getting highlights
 */
export interface GetHighlightsQuery {
  documentId?: string;
}

export const getHighlightsQuerySchema: JSONSchemaType<GetHighlightsQuery> = {
  type: "object",
  properties: {
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
} as any;

/**
 * DTO for highlight document ID params
 */
export interface HighlightDocumentIdParams {
  documentId: string;
}

export const highlightDocumentIdParamsSchema: JSONSchemaType<HighlightDocumentIdParams> = {
  type: "object",
  properties: {
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["documentId"],
  additionalProperties: false,
} as any;
