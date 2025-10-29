"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Download, 
  Search, 
  RefreshCw,
  FileText,
  ExternalLink,
  FolderOpen
} from "lucide-react";
import { useGetLMSCoursesQuery, useImportLMSContentMutation } from "@/lib/store/apiSlice";
import toast from "react-hot-toast";

interface Course {
  id: string;
  name: string;
  description?: string;
  section?: string;
  enrollmentCode?: string;
  courseState: string;
  creationTime: string;
  updateTime: string;
  teacherFolder?: {
    id: string;
    title: string;
  };
  alternateLink: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  state: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  materials?: Array<{
    driveFile?: {
      id: string;
      title: string;
      alternateLink: string;
    };
    link?: {
      url: string;
      title: string;
    };
  }>;
}

interface CourseBrowserProps {
  onContentImport?: (courseId: string, contentType: string, contentId: string) => void;
}

export function CourseBrowser({ onContentImport }: CourseBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const { data: coursesData, isLoading, error, refetch } = useGetLMSCoursesQuery("google");
  const [importContent, { isLoading: isImporting }] = useImportLMSContentMutation();

  const courses = coursesData?.courses || [];
  const assignments = coursesData?.assignments || [];

  const filteredCourses = courses.filter((course: Course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.section?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportCourse = async (course: Course) => {
    try {
      await importContent({
        provider: "google",
        courseId: course.id,
        contentType: "course",
        contentId: course.id,
      }).unwrap();
      
      toast.success(`Course "${course.name}" imported successfully!`);
      onContentImport?.(course.id, "course", course.id);
    } catch (error) {
      console.error("Failed to import course:", error);
      toast.error("Failed to import course. Please try again.");
    }
  };

  const handleImportAssignment = async (courseId: string, assignment: Assignment) => {
    try {
      await importContent({
        provider: "google",
        courseId,
        contentType: "assignment",
        contentId: assignment.id,
      }).unwrap();
      
      toast.success(`Assignment "${assignment.title}" imported successfully!`);
      onContentImport?.(courseId, "assignment", assignment.id);
    } catch (error) {
      console.error("Failed to import assignment:", error);
      toast.error("Failed to import assignment. Please try again.");
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const getCourseAssignments = (courseId: string) => {
    return assignments.filter((assignment: Assignment & { courseId: string }) => 
      assignment.courseId === courseId
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDueDate = (dueDate: { year: number; month: number; day: number }) => {
    return new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Classroom Courses</CardTitle>
          <CardDescription>Loading your courses...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Classroom Courses</CardTitle>
          <CardDescription>Failed to load courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Unable to load your Google Classroom courses. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Google Classroom Courses
        </CardTitle>
        <CardDescription>
          Browse and import content from your Google Classroom courses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Courses List */}
        <div className="space-y-3">
          {filteredCourses.length === 0 ? (
            <Alert>
              <AlertDescription>
                {searchQuery ? "No courses match your search." : "No courses found in your Google Classroom account."}
              </AlertDescription>
            </Alert>
          ) : (
            filteredCourses.map((course: Course) => {
              const courseAssignments = getCourseAssignments(course.id);
              const isExpanded = expandedCourses.has(course.id);

              return (
                <Card key={course.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <button
                            onClick={() => toggleCourseExpansion(course.id)}
                            className="hover:bg-muted rounded p-1 -ml-1"
                          >
                            <FolderOpen className="h-4 w-4" />
                          </button>
                          {course.name}
                          {course.section && (
                            <Badge variant="secondary" className="text-xs">
                              {course.section}
                            </Badge>
                          )}
                        </CardTitle>
                        {course.description && (
                          <CardDescription className="mt-1">
                            {course.description}
                          </CardDescription>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(course.creationTime)}
                          </span>
                          {course.enrollmentCode && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Code: {course.enrollmentCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(course.alternateLink, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleImportCourse(course)}
                          disabled={isImporting}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Import
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Assignments */}
                  {isExpanded && courseAssignments.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Assignments ({courseAssignments.length})
                        </h4>
                        <div className="space-y-2">
                          {courseAssignments.map((assignment: Assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <h5 className="font-medium">{assignment.title}</h5>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {assignment.description.length > 100
                                      ? `${assignment.description.substring(0, 100)}...`
                                      : assignment.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Created {formatDate(assignment.creationTime)}</span>
                                  {assignment.dueDate && (
                                    <span>Due {formatDueDate(assignment.dueDate)}</span>
                                  )}
                                  {assignment.materials && assignment.materials.length > 0 && (
                                    <span>{assignment.materials.length} materials</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleImportAssignment(course.id, assignment)}
                                disabled={isImporting}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Import
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Courses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}