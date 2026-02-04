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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  School,
  RefreshCcw,
  ArrowRightCircle,
  FileText,
  FolderOpen,
  Search,
  Filter,
  X,
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
    isFetching: isFetchingCourses,
  } = useGetGoogleClassroomCoursesListQuery(undefined, {
    skip: !open || !isConnected,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const courseContentQuery = useGetGoogleClassroomCourseContentQuery(
    selectedCourseId || "",
    {
      skip: !open || !isConnected || !selectedCourseId,
    },
  );
  const courseContent = courseContentQuery.data;
  const isLoadingContent = courseContentQuery.isLoading;
  const isFetchingContent = courseContentQuery.isFetching;
  const refetchContent = courseContentQuery.refetch;

  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(
    new Set(),
  );
  const [isImporting, setIsImporting] = useState(false);
  const [addDocumentFromDrive] = useAddDocumentFromGoogleDriveMutation();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "announcement" | "coursework"
  >("all");

  const { materials, filteredMaterials } = useMemo(() => {
    if (!courseContent?.data) return { materials: [], filteredMaterials: [] };
    const content: CourseContent = courseContent.data;

    // Process all materials
    const fromAnnouncements = content.announcements.flatMap((a) =>
      (a.materials?.driveDocuments || []).map((f) => ({
        id: f.id,
        title: f.title,
        source: "announcement" as const,
        courseId: a.courseId,
      })),
    );
    const fromCourseWork = content.materials.flatMap((m) =>
      (m.materials?.driveDocuments || []).map((f) => ({
        id: f.id,
        title: f.title,
        source: "coursework" as const,
        courseId: m.courseId,
      })),
    );

    const allMaterials = [...fromAnnouncements, ...fromCourseWork];

    // Apply filters
    const filtered = allMaterials.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || item.source === filterType;
      return matchesSearch && matchesType;
    });

    return { materials: allMaterials, filteredMaterials: filtered };
  }, [courseContent, searchTerm, filterType]);

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
    window.location.href =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/v1/integrations/lms/google-classroom/connect"
        : `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/lms/google-classroom/connect`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-none">
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            Google Classroom Import
          </DialogTitle>
          <DialogDescription>
            Select a course to browse and import materials directly into your
            workspace.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="bg-muted/50 p-6 rounded-full">
              <School className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-semibold">
                Connect to Google Classroom
              </h3>
              <p className="text-muted-foreground">
                Authenticate with your Google account to access your courses and
                materials.
              </p>
            </div>
            <Button
              onClick={handleConnect}
              disabled={isChecking}
              className="gap-2 cursor-pointer"
              size="lg"
            >
              {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect Account
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0">
            {/* Courses Sidebar */}
            <div className="w-[450px] border-r flex flex-col bg-muted/10 overflow-y-scroll">
              <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <span className="text-sm font-semibold">My Courses</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchCourses()}
                  disabled={isFetchingCourses || isFetchingContent}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCcw
                    className={`h-4 w-4 ${
                      isFetchingCourses || isFetchingContent
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                {isLoadingCourses ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : coursesData?.data?.length ? (
                  <div className="p-2 space-y-1 ">
                    {coursesData.data.map((course: CourseListResponse) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`w-full text-left px-3 py-3 rounded-md transition-all duration-200 cursor-pointer group relative ${
                          selectedCourseId === course.id
                            ? "bg-primary text-primary-foreground shadow-md font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="wrap-break-word pr-2">
                            {course.name}
                          </span>
                          <div
                            className={`flex items-center justify-between text-xs ${
                              selectedCourseId === course.id
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground/70"
                            }`}
                          >
                            <span>
                              {new Date(course.updateTime).toLocaleDateString()}
                            </span>
                            {course.courseState === "ACTIVE" && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  selectedCourseId === course.id
                                    ? "bg-white"
                                    : "bg-green-500"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No courses found
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-background relative ">
              {/* Toolbar */}
              <div className="p-4 border-b flex flex-col gap-4">
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        3333333
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedCourseId
                          ? isLoadingContent
                            ? "Loading..."
                            : `${materials.length} items available`
                          : "No course selected"}
                      </span>
                    </div>
                  </div>
                  {selectedCourseId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchContent()}
                      disabled={isFetchingContent}
                      className="gap-1.5 h-8 text-xs font-medium"
                    >
                      <RefreshCcw
                        className={`h-3.5 w-3.5 ${isFetchingContent ? "animate-spin" : ""}`}
                      />
                      Refresh List
                    </Button>
                  )}
                </div>

                {/* Filters */}
                {selectedCourseId && (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        className="pl-9 h-9 bg-muted/30 border-muted-foreground/20 focus-visible:bg-background transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select
                      value={filterType}
                      onValueChange={(
                        v: "all" | "announcement" | "coursework",
                      ) => setFilterType(v)}
                    >
                      <SelectTrigger className="w-[180px] h-9 bg-muted/30 border-muted-foreground/20">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Filter className="h-3.5 w-3.5" />
                          <span className="text-foreground">
                            <SelectValue placeholder="All Types" />
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Materials</SelectItem>
                        <SelectItem value="coursework">Course Work</SelectItem>
                        <SelectItem value="announcement">
                          Announcements
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 bg-muted/5">
                {!selectedCourseId ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 p-12 space-y-6">
                    <div className="h-24 w-24 rounded-2xl bg-muted/30 flex items-center justify-center">
                      <ArrowRightCircle className="h-10 w-10 opacity-40" />
                    </div>
                    <div className="text-center max-w-xs">
                      <h4 className="text-lg font-medium text-foreground opacity-70 mb-1">
                        No Selection
                      </h4>
                      <p>
                        Select a course from the sidebar to view filtering and
                        import options
                      </p>
                    </div>
                  </div>
                ) : !isLoadingContent && filteredMaterials.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 space-y-4">
                    <div className="bg-muted/30 p-4 rounded-full">
                      <Search className="h-8 w-8 opacity-20" />
                    </div>
                    <p className="text-sm">No materials match your filters</p>
                    {(searchTerm || filterType !== "all") && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterType("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 grid gap-2 h-[100px]">
                    {filteredMaterials.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                          selectedMaterialIds.has(m.id)
                            ? "bg-primary/5 border-primary/30 shadow-sm"
                            : "bg-background border-border/40 hover:border-primary/20 hover:shadow-sm"
                        }`}
                      >
                        <div className="pt-0.5">
                          <Checkbox
                            checked={selectedMaterialIds.has(m.id)}
                            onCheckedChange={() => toggleMaterial(m.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`font-medium transition-colors ${
                                selectedMaterialIds.has(m.id)
                                  ? "text-foreground"
                                  : "text-foreground/80 group-hover:text-foreground"
                              }`}
                            >
                              {m.title || "Untitled Document"}
                            </p>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-[10px] h-5 px-1.5 uppercase tracking-wide border-0 ${
                                m.source === "coursework"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                                  : "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 font-semibold"
                              }`}
                            >
                              {m.source}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span className="truncate">Google Doc</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-background flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedMaterialIds.size > 0 ? (
                    <>
                      <Badge
                        variant="secondary"
                        className="h-6 px-2 text-foreground font-medium rounded-md"
                      >
                        {selectedMaterialIds.size}
                      </Badge>
                      <span>items selected</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs ml-2"
                        onClick={() => setSelectedMaterialIds(new Set())}
                      >
                        Clear selection
                      </Button>
                    </>
                  ) : (
                    <span>Select items to import</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={selectedMaterialIds.size === 0 || isImporting}
                    className="gap-2 min-w-[140px] shadow-sm"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRightCircle className="h-4 w-4" />
                    )}
                    Import Selected
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
