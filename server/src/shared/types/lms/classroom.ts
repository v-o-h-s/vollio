///////////////////////////////////////////////////
// google
////////////////////////////////////////////////////

export interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_expiry: string;
  token_type: string;
}

// Error response from Google OAuth API
export interface GoogleOAuthErrorResponse {
  error: string;
  error_description?: string;
}

// Raw response from Google token endpoint (before we add token_expiry)
export type GoogleOAuthRawResponse =
  | Omit<GoogleOAuthTokenResponse, "token_expiry">
  | GoogleOAuthErrorResponse;

export interface Course {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: CourseState;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: DriveFolder;
  guardiansEnabled?: boolean;
  calendarId?: string;
  gradebookSettings?: GradebookSettings;
}

// Lightweight course response for list endpoints
export interface CourseListResponse {
  id: string;
  name: string;
  updateTime: string;
  courseState: CourseState;
  alternateLink?: string;
}

export interface DriveFolder {
  id: string;
  title?: string;
  alternateLink?: string;
}

export interface GradebookSettings {
  calculationType: CalculationType;
  displaySetting: DisplaySetting;
  gradeCategories?: GradeCategory[];
}

export interface GradeCategory {
  id: string;
  name?: string;
}

export enum CourseState {
  UNSPECIFIED = "COURSE_STATE_UNSPECIFIED",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  PROVISIONED = "PROVISIONED",
  DECLINED = "DECLINED",
  SUSPENDED = "SUSPENDED",
}

export enum CalculationType {
  UNSPECIFIED = "CALCULATION_TYPE_UNSPECIFIED",
  TOTAL_POINTS = "TOTAL_POINTS",
  WEIGHTED_CATEGORIES = "WEIGHTED_CATEGORIES",
}

export enum DisplaySetting {
  UNSPECIFIED = "DISPLAY_SETTING_UNSPECIFIED",
  SHOW_OVERALL_GRADE = "SHOW_OVERALL_GRADE",
  HIDE_OVERALL_GRADE = "HIDE_OVERALL_GRADE",
  SHOW_TEACHERS_ONLY = "SHOW_TEACHERS_ONLY",
}

// Optional: Deprecated courseMaterialSets
export interface CourseMaterialSet {
  title: string;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  driveFile?: DriveFile;
  youTubeVideo?: YouTubeVideo;
  link?: Link;
  form?: Form;
}

export interface DriveFile {
  id: string;
  title: string;
  alternateLink?: string;
  thumbnailUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  alternateLink: string;
}

export interface Link {
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface Form {
  formUrl: string;
  title?: string;
  alternateLink?: string;
}


export interface ClassroomCourseResponse {
  id: string;
  name: string;
  updateTime: string;
  courseState: string;
  alternateLink: string;
}

// classroom announcement
// https://developers.google.com/classroom/reference/rest/v1/courses.announcements
export interface ClassroomAnnouncement {
  id?: string;
  title?: string;
  text?: string;
  state?: string;
  creatorUserId?: string;
  courseId?: string;
  creationTime?: string;
  updateTime?: string;
}

export interface Announcement {
  courseId: string; // read-only
  id: string; // read-only
  text?: string;
  materials?: Material[];
  state?: AnnouncementState;
  alternateLink?: string; // read-only
  creationTime?: string; // read-only (RFC 3339)
  updateTime?: string; // read-only (RFC 3339)
  scheduledTime?: string; // RFC 3339
  assigneeMode?: AssigneeMode;
  individualStudentsOptions?: IndividualStudentsOptions;
  creatorUserId?: string; // read-only
}

// --------------------------------------

export interface Material {
  driveFile?: DriveFileMaterial;
  youtubeVideo?: YouTubeVideoMaterial;
  link?: LinkMaterial;
  form?: FormMaterial;
}

export interface DriveFileMaterial {
  driveFile: {
    id: string;
    title: string;
    alternateLink: string;
    thumbnailUrl?: string;
  };
}

export interface YouTubeVideoMaterial {
  id: string;
  title: string;
  alternateLink: string;
  thumbnailUrl?: string;
}

export interface LinkMaterial {
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface FormMaterial {
  formUrl: string;
  title?: string;
  thumbnailUrl?: string;
}

// --------------------------------------

export enum AnnouncementState {
  UNSPECIFIED = "ANNOUNCEMENT_STATE_UNSPECIFIED",
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  DELETED = "DELETED",
}

export enum AssigneeMode {
  ALL_STUDENTS = "ALL_STUDENTS",
  INDIVIDUAL_STUDENTS = "INDIVIDUAL_STUDENTS",
}

export interface IndividualStudentsOptions {
  studentIds?: string[];
}

// server response
export interface ClassroomAnnouncementResponse {
  id: string;
  courseId: string;
  state: AnnouncementState;
  alternateLink: string;
  updatedAt: string;

  materials: {
    driveFiles: {
      id: string;
      title: string;
    }[];
  };
}
////////////////////////////////////////////////////
// course work
////////////////////////////////////////////////////
export interface CourseWork {
  courseId: string;
  id: string;

  title: string;
  description?: string;

  materials?: Material[];

  state: CourseWorkState;
  alternateLink: string;

  creationTime: string;
  updateTime: string;

  dueDate?: DateObject;
  dueTime?: TimeOfDay;

  scheduledTime?: string;

  maxPoints?: number;
  workType: CourseWorkType;

  associatedWithDeveloper: boolean;

  assigneeMode: AssigneeMode;
  individualStudentsOptions?: IndividualStudentsOptions;

  submissionModificationMode: SubmissionModificationMode;

  creatorUserId: string;

  topicId?: string;

  gradeCategory?: GradeCategory;

  previewVersion?: PreviewVersion;

  // union
  assignment?: AssignmentDetails;
  multipleChoiceQuestion?: MultipleChoiceQuestion;

  gradingPeriodId?: string;
}

export interface DateObject {
  year: number;
  month: number;
  day: number;
}

export interface TimeOfDay {
  hours: number;
  minutes: number;
  seconds: number;
  nanos: number;
}

export enum CourseWorkState {
  UNSPECIFIED = "COURSE_WORK_STATE_UNSPECIFIED",
  PUBLISHED = "PUBLISHED",
  DRAFT = "DRAFT",
  DELETED = "DELETED",
}

export enum CourseWorkType {
  ASSIGNMENT = "ASSIGNMENT",
  SHORT_ANSWER = "SHORT_ANSWER_QUESTION",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE_QUESTION",
  MATERIAL = "MATERIAL",
}

export enum SubmissionModificationMode {
  UNSPECIFIED = "SUBMISSION_MODIFICATION_MODE_UNSPECIFIED",
  MODIFIABLE_UNTIL_TURNED_IN = "MODIFIABLE_UNTIL_TURNED_IN",
  MODIFIABLE = "MODIFIABLE",
}

export interface GradeCategory {
  id: string;
  name?: string;
}

export enum PreviewVersion {
  PREVIEW_V1 = "PREVIEW_V1",
}

export interface AssignmentDetails {
  studentWorkFolder?: {
    id: string;
    title?: string;
  };
}

export interface MultipleChoiceQuestion {
  choices: string[];
}

export interface ClassroomCourseWorkResponse {
  id: string;
  courseId: string;
  title?: string;
  state: CourseWorkState;
  alternateLink: string;
  updatedAt: string;
  materials: {
    driveFiles: {
      id: string;
      title: string;
      thumbnailUrl?: string;
    }[];
  };
}
