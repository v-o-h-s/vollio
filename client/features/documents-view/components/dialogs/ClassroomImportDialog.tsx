/**
 * @document ClassroomImportDialog.tsx
 * @description Dialog component for importing documents from Google Classroom.
 * Uses Google Classroom API to fetch courses and materials.
 * Allows selection and import of materials into the application.
 * Requires Google Classroom integration to be connected.
 * Displays loading states and handles errors gracefully.
 * Built with React, TypeScript, and UI components from the design system.
 */
"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  School,
  RefreshCcw,
  ArrowRightCircle,
  FileText,
  FolderOpen,
} from "lucide-react";
import {
  useAddDocumentFromGoogleDriveMutation,
  useGetGoogleClassroomConnectionStatusQuery,
  useGetGoogleClassroomCoursesListQuery,
  useGetGoogleClassroomCourseContentQuery,
} from "@/lib/store/apiSlice";
import { CourseContent, CourseListResponse } from "@vollio/shared";
interface ClassroomImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

interface DriveMaterial {
  id: string;
  title: string;
  source: "announcement" | "coursework";
  courseId: string;
}

export function ClassroomImportDialog({
  open,
  onOpenChange,
  onImported,
}: ClassroomImportDialogProps) {
  const { data: classroomStatus, isLoading: isChecking } =
    useGetGoogleClassroomConnectionStatusQuery();

  const isConnected = classroomStatus?.data?.isConnected;
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useGetGoogleClassroomCoursesListQuery(undefined, {
    skip: !open || !isConnected,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const courseContentQuery = useGetGoogleClassroomCourseContentQuery(
    selectedCourseId || "",
    {
      skip: !open || !isConnected || !selectedCourseId,
    }
  );
  const courseContent = courseContentQuery.data;
  const isLoadingContent = courseContentQuery.isLoading;
  const isFetchingContent = courseContentQuery.isFetching;
  const refetchContent = courseContentQuery.refetch;

  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(
    new Set()
  );
  const [isImporting, setIsImporting] = useState(false);
  const [addDocumentFromDrive] = useAddDocumentFromGoogleDriveMutation();

  const materials: DriveMaterial[] = useMemo(() => {
    if (!courseContent?.data) return [];
    const content: CourseContent = courseContent.data;
    const fromAnnouncements = content.announcements.flatMap((a) =>
      (a.materials?.driveDocuments || []).map((f) => ({
        id: f.id,
        title: f.title,
        source: "announcement" as const,
        courseId: a.courseId,
      }))
    );
    const fromCourseWork = content.materials.flatMap((m) =>
      (m.materials?.driveDocuments || []).map((f) => ({
        id: f.id,
        title: f.title,
        source: "coursework" as const,
        courseId: m.courseId,
      }))
    );
    return [...fromAnnouncements, ...fromCourseWork];
  }, [courseContent]);

  const toggleMaterial = (id: string) => {
    setSelectedMaterialIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (selectedMaterialIds.size === 0) return;
    setIsImporting(true);
    try {
      const ids = Array.from(selectedMaterialIds);
      for (const documentGoogleDriveId of ids) {
        await addDocumentFromDrive({ documentGoogleDriveId }).unwrap();
      }
      setSelectedMaterialIds(new Set());
      if (onImported) onImported();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to import from Classroom", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/v1/integrations/lms/google-classroom/connect";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Google Classroom
          </DialogTitle>
          <DialogDescription>
            Import course materials directly from your Classroom.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Connect to Google Classroom</AlertTitle>
              <AlertDescription>
                Authenticate with your Google account to browse courses and
                import materials.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleConnect}
              disabled={isChecking}
              className="gap-2"
            >
              {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect Classroom
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Courses
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchCourses()}
                  className="gap-1"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              <div className="border rounded-lg h-[420px] overflow-hidden">
                {isLoadingCourses ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : coursesData?.data?.length ? (
                  <ScrollArea className="h-[420px]">
                    <div className="divide-y">
                      {coursesData.data.map((course: CourseListResponse) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            setSelectedCourseId(course.id);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition ${
                            selectedCourseId === course.id
                              ? "bg-primary/10"
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">
                              {course.name}
                            </span>
                            <Badge
                              variant={
                                course.courseState === "ACTIVE"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {course.courseState}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Updated{" "}
                            {new Date(course.updateTime).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-3 text-center">
                    No courses found.
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {selectedCourseId
                      ? "Materials"
                      : "Select a course to view materials"}
                  </p>
                </div>
                {selectedCourseId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchContent()}
                    className="gap-1"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
              </div>
              <div className="border rounded-lg h-[420px] overflow-hidden relative">
                {!selectedCourseId ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-3 text-center">
                    Choose a course to see its materials.
                  </div>
                ) : isLoadingContent && !courseContent?.data ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : materials.length ? (
                  <ScrollArea className="h-[420px]">
                    <div className="divide-y">
                      {materials.map((m) => (
                        <label
                          key={m.id}
                          className="flex items-start gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedMaterialIds.has(m.id)}
                            onCheckedChange={() => toggleMaterial(m.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {m.title || "Untitled document"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {m.source === "announcement"
                                ? "Announcement"
                                : "Course work"}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground px-3 text-center">
                    No materials with Drive documents in this course.
                  </div>
                )}

                {isFetchingContent && courseContent?.data && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={selectedMaterialIds.size === 0 || isImporting}
                  className="gap-2"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRightCircle className="h-4 w-4" />
                  )}
                  Import Selected ({selectedMaterialIds.size})
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
