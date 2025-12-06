/**
 * Google Classroom Button - Component Flow Diagram
 * 
 * This file documents the state transitions and user flow
 */

/*
┌─────────────────────────────────────────────────────────────────────┐
│                    GOOGLE CLASSROOM BUTTON FLOW                      │
└─────────────────────────────────────────────────────────────────────┘

INITIAL STATE (Not Authenticated)
┌──────────────────────────┐
│  [🎓 Add Classroom]      │ ← Button displayed in PDF toolbar
└──────────┬───────────────┘
           │ User clicks
           ▼
┌──────────────────────────┐
│  Check Token Status      │ ← API call to verify authentication
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │         │
   Invalid    Valid
      │         │
      ▼         ▼
┌─────────┐ ┌─────────────────────┐
│ Redirect│ │ Show Course Dialog  │
│ to OAuth│ │                     │
└────┬────┘ └─────────────────────┘
     │
     │ (User authenticates)
     │
     ▼
┌──────────────────────────┐
│ Return to App            │
│ Token Saved in Session   │
└──────────┬───────────────┘
           │
           ▼

AUTHENTICATED STATE
┌──────────────────────────┐
│ [🎓 Get from Classroom]  │ ← Button text changes
└──────────┬───────────────┘
           │ User clicks
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    COURSE SELECTION DIALOG                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 🎓 Select a Course                              [X]  │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ Choose a course to view its materials             │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ 📁 Mathematics 101                         ▶│    │     │
│  │  │    ACTIVE • Updated Mar 15, 2024           │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ 📁 Computer Science                        ▶│    │     │
│  │  │    ACTIVE • Updated Mar 14, 2024           │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ 📁 Physics                                 ▶│    │     │
│  │  │    ARCHIVED • Updated Feb 28, 2024         │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────┬──────────────────────────────────────┘
                        │ User selects a course
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   DOCUMENT SELECTION DIALOG                   │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 🎓 Mathematics 101 - Documents              [X]     │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │ ◀ Back to Courses                                  │     │
│  │ Select a document to add to your PDFs              │     │
│  ├─────────────────────────────────────────────────────┤     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ [📄] Calculus Notes - Chapter 1.pdf       │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ [📄] Homework Assignment 3.pdf             │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  │  ┌────────────────────────────────────────────┐    │     │
│  │  │ [📄] Exam Study Guide.pdf                  │    │     │
│  │  └────────────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────┬──────────────────────────────────────┘
                        │ User selects a document
                        ▼
┌──────────────────────────┐
│ Import File from Drive   │ ← API call to add file
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ ✓ Success Toast          │
│ "Calculus Notes added!"  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Dialog Closes            │
│ File Added to PDFs Page  │
└──────────────────────────┘


STATE MANAGEMENT DIAGRAM
═══════════════════════════

Component State:
  • isDialogOpen: boolean        → Controls modal visibility
  • isConnected: boolean          → Tracks auth status
  • isCheckingConnection: boolean → Loading state for token check
  • selectedCourse: Course | null → Currently selected course
  • dialogView: "courses" | "docs" → Current view in dialog

API Queries:
  • useCheckGoogleClassroomTokenStatusQuery → Validates token
  • useGetGoogleClassroomCoursesListQuery   → Fetches courses
  • useGetGoogleClassroomCourseContentQuery → Gets course materials
  • useAddFileFromGoogleDriveMutation       → Imports file


LOADING STATES
══════════════

Button States:
  [🎓 Add Classroom]        → Not authenticated
  [⟳ Add Classroom]         → Checking connection
  [🎓 Get from Classroom]   → Authenticated

Dialog Loading States:
  [⟳ Loading courses...]    → Fetching course list
  [⟳ Loading documents...]  → Fetching course content
  [⟳] on document           → Importing file

Empty States:
  [📁 No courses found]     → No courses available
  [📄 No documents found]   → Course has no materials


ERROR HANDLING
══════════════

Authentication Errors:
  → Invalid/expired token → Redirect to OAuth
  → CSRF validation fail  → Show error toast

Network Errors:
  → API timeout          → Show error toast
  → Server error         → Show error toast with message

Import Errors:
  → File not accessible  → Show error toast
  → Permission denied    → Show error toast
  → Unknown error        → Generic error message


DESIGN SYSTEM COMPLIANCE
════════════════════════

Colors:
  • Primary: OKLCH indigo/eggplant for icons and hover states
  • Accent: Light lavender for hover backgrounds
  • Muted: Secondary text colors
  • Foreground: Near-black text

Components:
  • Button: outline variant with sm size
  • Dialog: Radix UI with custom styling
  • ScrollArea: For overflow content
  • Icons: Lucide React (GraduationCap, FolderOpen, FileText)

Typography:
  • Headings: font-medium, proper sizing
  • Body: Default font with muted-foreground for secondary
  • Consistent spacing and line-height

Interactions:
  • Hover: bg-accent transition
  • Focus: ring-2 ring-ring with offset
  • Disabled: opacity-50 cursor-not-allowed
  • Loading: Spinning loader icons

Spacing:
  • Gap: 2, 3, 4 (8px, 12px, 16px)
  • Padding: p-4, p-6 for cards/dialog
  • Margins: Consistent with design system


ACCESSIBILITY FEATURES
═════════════════════

• Keyboard Navigation: Full support with Tab/Enter
• Focus Management: Visible focus rings (ring-2)
• Screen Readers: Semantic HTML, ARIA labels
• Loading Announcements: Screen readers detect state changes
• Color Contrast: WCAG AA compliant
• Error Messages: Clear, actionable feedback
*/
