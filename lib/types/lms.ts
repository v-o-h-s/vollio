/**
 * LMS (Learning Management System) Types
 * Comprehensive type definitions for LMS integration
 */

// Base LMS Provider Interface
export interface LMSProvider {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "connecting" | "error";
  lastConnected?: string;
  connectionError?: string;
}

// Google Classroom Types
export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState: string;
  alternateLink?: string;
  teacherFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
}

export interface CourseMaterial {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  source: string;
  courseWorkTitle: string;
  courseWorkId?: string;
  description?: string;
  alternateLink?: string;
}

export interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: CourseMaterial[];
  state: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
}

// OAuth Token Types
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
}

export interface StoredOAuthTokens extends OAuthTokens {
  id: string;
  userId: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// API Response Types
export interface LMSConnectionResponse {
  success: boolean;
  provider: LMSProvider;
  authUrl?: string;
  error?: string;
}

export interface LMSCoursesResponse {
  success: boolean;
  courses: GoogleClassroomCourse[];
  totalCount: number;
  error?: string;
}

export interface LMSCourseMaterialsResponse {
  success: boolean;
  materials: CourseMaterial[];
  courseWork: CourseWork[];
  totalCount: number;
  error?: string;
}

export interface LMSImportResponse {
  success: boolean;
  pdf?: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
  };
  error?: string;
}

export interface LMSTokenStatusResponse {
  success: boolean;
  hasTokens: boolean;
  provider?: string;
  expiresAt?: string;
  error?: string;
}

export interface LMSConnectionStatusResponse {
  success: boolean;
  isConnected: boolean;
  connectionInfo?: {
    connectedAt: string;
    lastUpdated: string;
    scope?: string;
    email?: string;
  } | null;
  error?: string;
}

// Import Request Types
export interface ImportFileRequest {
  fileId: string;
  fileName: string;
  folderId?: string;
  courseId?: string;
  courseWorkId?: string;
}

export interface BatchImportRequest {
  files: ImportFileRequest[];
  folderId?: string;
}

export interface BatchImportResponse {
  success: boolean;
  results: {
    fileId: string;
    fileName: string;
    status: "success" | "error";
    pdf?: {
      id: string;
      filename: string;
      fileSize: number;
      uploadedAt: string;
    };
    error?: string;
  }[];
  totalImported: number;
  totalFailed: number;
}

// Connection Management Types
export interface LMSConnectionStatus {
  provider: string;
  connected: boolean;
  lastSync?: string;
  error?: string;
  tokenExpiry?: string;
}

export interface LMSSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  defaultFolder?: string;
  enabledProviders: string[];
  notificationSettings: {
    onImportComplete: boolean;
    onConnectionError: boolean;
    onTokenExpiry: boolean;
  };
}

// Future LMS Provider Types (for extensibility)
export interface MoodleCourse {
  id: number;
  fullname: string;
  shortname: string;
  categoryid: number;
  summary?: string;
  summaryformat: number;
  startdate: number;
  enddate: number;
  visible: boolean;
  enrollmentmethods?: string[];
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  account_id: number;
  start_at?: string;
  end_at?: string;
  enrollment_term_id: number;
  is_public: boolean;
  course_format: string;
}

// Generic LMS Course Interface (for multi-provider support)
export interface LMSCourse {
  id: string;
  name: string;
  provider: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  enrollmentCount?: number;
  alternateLink?: string;
  metadata?: Record<string, any>;
}

// Error Types
export interface LMSError {
  code: string;
  message: string;
  provider: string;
  details?: Record<string, any>;
  retryable: boolean;
}

// Sync Status Types
export interface LMSSyncStatus {
  provider: string;
  lastSync: string;
  status: "idle" | "syncing" | "success" | "error";
  coursesCount: number;
  materialsCount: number;
  error?: string;
}

// Analytics Types
export interface LMSUsageAnalytics {
  provider: string;
  totalImports: number;
  totalFiles: number;
  totalSize: number;
  lastImport?: string;
  popularCourses: {
    courseId: string;
    courseName: string;
    importCount: number;
  }[];
}