"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, Loader2, FolderOpen, FileText, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  useCheckGoogleClassroomTokenStatusQuery,
  useGetGoogleClassroomCoursesListQuery,
  useGetGoogleClassroomCourseContentQuery,
  useAddFileFromGoogleDriveMutation,
} from "@/lib/store/apiSlice";
import { CourseListResponse, DriveFile } from "@/lib/types/server-respones/classroomRouteResponses";
import { cn } from "@/lib/utils";

type DialogView = "courses" | "documents";

export function GoogleClassroomButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseListResponse | null>(null);
  const [dialogView, setDialogView] = useState<DialogView>("courses");

  // RTK Query hooks
  const { data: tokenStatus, isLoading: isCheckingToken, refetch: refetchTokenStatus } = 
    useCheckGoogleClassroomTokenStatusQuery(undefined, {
      skip: !isCheckingConnection,
    });

  const { data: coursesData, isLoading: isLoadingCourses } = 
    useGetGoogleClassroomCoursesListQuery(undefined, {
      skip: !isConnected || !isDialogOpen || dialogView !== "courses",
    });

  const { data: courseContent, isLoading: isLoadingContent } = 
    useGetGoogleClassroomCourseContentQuery(selectedCourse?.id || "", {
      skip: !selectedCourse || dialogView !== "documents",
    });

  const [addFileFromGoogleDrive, { isLoading: isAddingFile }] = useAddFileFromGoogleDriveMutation();

  // Check connection status when token data changes
  useEffect(() => {
    if (tokenStatus?.success && tokenStatus.data?.isValid) {
      setIsConnected(true);
      setIsCheckingConnection(false);
    } else if (tokenStatus !== undefined) {
      setIsConnected(false);
      setIsCheckingConnection(false);
    }
  }, [tokenStatus]);

  // Handle button click
  const handleButtonClick = async () => {
    if (isCheckingConnection) return;
    
    if (!isConnected) {
      // Check if already authenticated before redirecting
      setIsCheckingConnection(true);
      await refetchTokenStatus();
      
      // If still not connected after check, redirect to OAuth
      if (!isConnected) {
        window.location.href = "/api/v1/integrations/lms/google-classroom/connect";
      } else {
        // Connected, open dialog
        setDialogView("courses");
        setSelectedCourse(null);
        setIsDialogOpen(true);
      }
    } else {
      // Open the courses dialog
      setDialogView("courses");
      setSelectedCourse(null);
      setIsDialogOpen(true);
    }
  };

  // Handle course selection
  const handleCourseSelect = (course: CourseListResponse) => {
    setSelectedCourse(course);
    setDialogView("documents");
  };

  // Handle document selection and add to files
  const handleDocumentSelect = async (driveFile: DriveFile) => {
    try {
      const result = await addFileFromGoogleDrive({
        fileGoogleDriveId: driveFile.id,
      }).unwrap();

      toast.success(`"${driveFile.title}" added successfully!`);
      setIsDialogOpen(false);
      setSelectedCourse(null);
      setDialogView("courses");
    } catch (error: any) {
      console.error("Error adding file:", error);
      toast.error(error?.data?.message || "Failed to add file from Google Classroom");
    }
  };

  // Go back to courses list
  const handleBackToCourses = () => {
    setDialogView("courses");
    setSelectedCourse(null);
  };

  // Get all documents from course content
  const getAllDocuments = (): DriveFile[] => {
    if (!courseContent?.success || !courseContent.data) return [];

    const documents: DriveFile[] = [];

    // Collect documents from announcements
    courseContent.data.announcements.forEach((announcement) => {
      documents.push(...announcement.materials.driveFiles);
    });

    // Collect documents from coursework/materials
    courseContent.data.materials.forEach((material) => {
      documents.push(...material.materials.driveFiles);
    });

    return documents;
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isCheckingConnection}
        className="gap-2"
      >
        {isCheckingConnection ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GraduationCap className="h-4 w-4" />
        )}
        {isConnected ? "Get from Classroom" : "Add Classroom"}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {dialogView === "courses" ? "Select a Course" : `${selectedCourse?.name} - Documents`}
            </DialogTitle>
            <DialogDescription>
              {dialogView === "courses"
                ? "Choose a course to view its materials"
                : "Select a document to add to your PDFs"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
            {dialogView === "courses" ? (
              // Courses List View
              <div className="space-y-2 pr-4">
                {isLoadingCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading courses...</span>
                  </div>
                ) : coursesData?.success && coursesData.data.length > 0 ? (
                  coursesData.data.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={cn(
                        "w-full p-4 rounded-lg border bg-card hover:bg-accent transition-all",
                        "flex items-center justify-between group",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{course.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course.courseState} • Updated{" "}
                            {new Date(course.updateTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground">
                      You don't have any courses available in Google Classroom
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Documents List View
              <div className="space-y-4 pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCourses}
                  className="mb-2 -ml-2"
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                  Back to Courses
                </Button>

                <div className="space-y-2">
                  {isLoadingContent ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Loading documents...</span>
                    </div>
                  ) : getAllDocuments().length > 0 ? (
                    getAllDocuments().map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDocumentSelect(doc)}
                        disabled={isAddingFile}
                        className={cn(
                          "w-full p-4 rounded-lg border bg-card hover:bg-accent transition-all",
                          "flex items-center gap-3 group",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        {doc.thumbnailUrl ? (
                          <img
                            src={doc.thumbnailUrl}
                            alt={doc.title}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="p-2 rounded-md bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {doc.title}
                          </h4>
                        </div>
                        {isAddingFile && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No documents found</h3>
                      <p className="text-muted-foreground">
                        This course doesn't have any documents available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
