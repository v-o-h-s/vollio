import { JSONSchemaType } from "ajv";
import {
  ClassroomAnnouncementResponse,
  AnnouncementState,
} from "../types/lms/classroom";

export interface GoogleCallbackQuery {
  code: string;
  scope?: string;
  state?: string;
}

export const GoogleCallbackQuerySchema: JSONSchemaType<GoogleCallbackQuery> = {
  type: "object",
  properties: {
    code: { type: "string" },
    scope: { type: "string", nullable: true },
    state: { type: "string", nullable: true },
  },
  required: ["code"],
  additionalProperties: false,
};

// Schema for a single Drive File in materials
const DriveFileSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
  },
  required: ["id", "title"],
} as const;

// Schema for Materials
const MaterialsSchema = {
  type: "object",
  properties: {
    driveFiles: {
      type: "array",
      items: DriveFileSchema,
    },
  },
  required: ["driveFiles"],
} as const;

// Schema for ClassroomAnnouncementResponse
export const ClassroomAnnouncementResponseSchema: JSONSchemaType<ClassroomAnnouncementResponse> =
  {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      state: { type: "string", enum: Object.values(AnnouncementState) },
      alternateLink: { type: "string" },
      updatedAt: { type: "string" },
      materials: MaterialsSchema as any, // casting to any to avoid strict AJV type issues with nested objects if needed, or refine
    },
    required: [
      "id",
      "courseId",
      "state",
      "alternateLink",
      "updatedAt",
      "materials",
    ],
    additionalProperties: true,
  };

// Generic API Response Schema Wrapper
export const createApiResponseSchema = <T>(dataSchema: any) => ({
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: dataSchema,
    error: { type: "string", nullable: true },
  },
  required: ["success", "message", "data", "error"],
});
