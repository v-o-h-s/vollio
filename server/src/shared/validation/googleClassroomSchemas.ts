import { JSONSchemaType } from "ajv";
import {
  ClassroomAnnouncementResponse,
  AnnouncementState,
  ClassroomCourseWorkResponse,
  CourseWorkState,
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

// Schema for a single Drive Document in materials
const DriveDocumentSchema = {
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
    driveDocuments: {
      type: "array",
      items: DriveDocumentSchema,
    },
  },
  required: ["driveDocuments"],
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

// Schema for ClassroomCourseWorkResponse
export const ClassroomCourseWorkResponseSchema: JSONSchemaType<ClassroomCourseWorkResponse> =
  {
    type: "object",
    properties: {
      id: { type: "string" },
      courseId: { type: "string" },
      title: { type: "string", nullable: true },
      state: { type: "string", enum: Object.values(CourseWorkState) },
      alternateLink: { type: "string" },
      updatedAt: { type: "string" },
      materials: MaterialsSchema as any,
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
  } as any;

// Schema for Course Content
export const ClassroomContentResponseSchema = {
  type: "object",
  properties: {
    announcements: {
      type: "array",
      items: ClassroomAnnouncementResponseSchema,
    },
    materials: {
      type: "array",
      items: ClassroomCourseWorkResponseSchema,
    },
  },
  required: ["announcements", "materials"],
  additionalProperties: false,
};

// Schema for Course without Content (Basic Course Info)
export const ClassroomCourseResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    updateTime: { type: "string" },
    courseState: { type: "string" },
    alternateLink: { type: "string", nullable: true },
  },
  required: ["id", "name", "updateTime", "courseState"],
  additionalProperties: false,
};

// Schema for Course with Content (Full Sync)
export const ClassroomCourseWithContentResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    updateTime: { type: "string" },
    courseState: { type: "string" },
    alternateLink: { type: "string" },
    content: ClassroomContentResponseSchema,
  },
  required: ["id", "name", "content"], // Add other required fields as needed based on ClassroomCourse
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
