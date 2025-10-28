"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Search,
  Filter,
  FolderPlus,
  FileText,
  NotebookPen,
  Brain,
  Settings,
  MoreHorizontal,
  RefreshCw,
  SortAsc,
  Grid3X3,
  LayoutGrid,
  Star,
  Target,
  Bookmark,
  FileBarChart,
  Sparkles,
  History,
  Download,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "primary" | "secondary" | "destructive";
  disabled?: boolean;
  badge?: string | number;
  shortcut?: string;
}

interface FloatingSidebarProps {
  className?: string;
}

export function FloatingSidebar({ className }: FloatingSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get page-specific actions based on current route
  const getPageActions = (): QuickAction[] => {
    const basePath = pathname.split("/").slice(0, 3).join("/"); // /dashboard/[page]

    switch (basePath) {
      case "/dashboard/pdfs":
        return [
          {
            id: "upload-pdf",
            label: "Upload PDF",
            icon: Upload,
            onClick: () => {
              // Trigger upload action - could emit event or call a function
              const uploadEvent = new CustomEvent("trigger-pdf-upload");
              window.dispatchEvent(uploadEvent);
            },
            variant: "primary",
            shortcut: "Ctrl+U",
          },
          {
            id: "create-folder",
            label: "New Folder",
            icon: FolderPlus,
            onClick: () => {
              const folderEvent = new CustomEvent("trigger-folder-create");
              window.dispatchEvent(folderEvent);
            },
          },
          {
            id: "search-files",
            label: "Search Files",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-file-search");
              window.dispatchEvent(searchEvent);
            },
            shortcut: "Ctrl+F",
          },
          {
            id: "filter-files",
            label: "Filter & Sort",
            icon: Filter,
            onClick: () => {
              const filterEvent = new CustomEvent("trigger-file-filter");
              window.dispatchEvent(filterEvent);
            },
          },
          {
            id: "view-mode",
            label: "View Mode",
            icon: Grid3X3,
            onClick: () => {
              const viewEvent = new CustomEvent("trigger-view-toggle");
              window.dispatchEvent(viewEvent);
            },
          },
          {
            id: "refresh-files",
            label: "Refresh",
            icon: RefreshCw,
            onClick: () => {
              window.location.reload();
            },
            shortcut: "F5",
          },
        ];

      case "/dashboard/notes":
        return [
          {
            id: "create-note",
            label: "New Note",
            icon: Plus,
            onClick: () => router.push("/dashboard/notes/new"),
            variant: "primary",
            shortcut: "Ctrl+N",
          },
          {
            id: "search-notes",
            label: "Search Notes",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-notes-search");
              window.dispatchEvent(searchEvent);
            },
            shortcut: "Ctrl+F",
          },
          {
            id: "filter-notes",
            label: "Filter Notes",
            icon: Filter,
            onClick: () => {
              const filterEvent = new CustomEvent("trigger-notes-filter");
              window.dispatchEvent(filterEvent);
            },
          },
          {
            id: "sort-notes",
            label: "Sort Options",
            icon: SortAsc,
            onClick: () => {
              const sortEvent = new CustomEvent("trigger-notes-sort");
              window.dispatchEvent(sortEvent);
            },
          },
          {
            id: "view-mode-notes",
            label: "View Mode",
            icon: LayoutGrid,
            onClick: () => {
              const viewEvent = new CustomEvent("trigger-notes-view-toggle");
              window.dispatchEvent(viewEvent);
            },
          },
          {
            id: "starred-notes",
            label: "Starred Notes",
            icon: Star,
            onClick: () => {
              const starredEvent = new CustomEvent("trigger-starred-filter");
              window.dispatchEvent(starredEvent);
            },
          },
        ];

      case "/dashboard/summarize":
        return [
          {
            id: "select-documents",
            label: "Select Documents",
            icon: FileText,
            onClick: () => {
              const selectEvent = new CustomEvent("trigger-document-select");
              window.dispatchEvent(selectEvent);
            },
            variant: "primary",
            shortcut: "Ctrl+O",
          },
          {
            id: "generate-summary",
            label: "Generate Summary",
            icon: Sparkles,
            onClick: () => {
              const generateEvent = new CustomEvent("trigger-summary-generate");
              window.dispatchEvent(generateEvent);
            },
            variant: "primary",
            shortcut: "Ctrl+G",
          },
          {
            id: "summary-templates",
            label: "Templates",
            icon: Target,
            onClick: () => {
              const templatesEvent = new CustomEvent("trigger-summary-templates");
              window.dispatchEvent(templatesEvent);
            },
            shortcut: "Ctrl+T",
          },
          {
            id: "summary-history",
            label: "View History",
            icon: History,
            onClick: () => {
              const historyEvent = new CustomEvent("trigger-summary-history");
              window.dispatchEvent(historyEvent);
            },
          },
          {
            id: "search-summaries",
            label: "Search Summaries",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-summary-search");
              window.dispatchEvent(searchEvent);
            },
            shortcut: "Ctrl+F",
          },
          {
            id: "filter-summaries",
            label: "Filter Type",
            icon: Filter,
            onClick: () => {
              const filterEvent = new CustomEvent("trigger-summary-filter");
              window.dispatchEvent(filterEvent);
            },
          },
          {
            id: "export-summary",
            label: "Export Summary",
            icon: Download,
            onClick: () => {
              const exportEvent = new CustomEvent("trigger-summary-export");
              window.dispatchEvent(exportEvent);
            },
          },
          {
            id: "copy-summary",
            label: "Copy to Clipboard",
            icon: Copy,
            onClick: () => {
              const copyEvent = new CustomEvent("trigger-summary-copy");
              window.dispatchEvent(copyEvent);
            },
            shortcut: "Ctrl+C",
          },
        ];

      case "/dashboard/quizzes":
        return [
          {
            id: "create-quiz",
            label: "Create Quiz",
            icon: Plus,
            onClick: () => router.push("/dashboard/quizzes/create"),
            variant: "primary",
            shortcut: "Ctrl+N",
          },
          {
            id: "search-quizzes",
            label: "Search Quizzes",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-quiz-search");
              window.dispatchEvent(searchEvent);
            },
            shortcut: "Ctrl+F",
          },
          {
            id: "filter-category",
            label: "Filter Category",
            icon: Filter,
            onClick: () => {
              const filterEvent = new CustomEvent("trigger-category-filter");
              window.dispatchEvent(filterEvent);
            },
          },
          {
            id: "filter-difficulty",
            label: "Difficulty Filter",
            icon: Target,
            onClick: () => {
              const difficultyEvent = new CustomEvent(
                "trigger-difficulty-filter"
              );
              window.dispatchEvent(difficultyEvent);
            },
          },
          {
            id: "bookmarked-quizzes",
            label: "Bookmarked",
            icon: Bookmark,
            onClick: () => {
              const bookmarkEvent = new CustomEvent("trigger-bookmark-filter");
              window.dispatchEvent(bookmarkEvent);
            },
          },
          {
            id: "quiz-stats",
            label: "Statistics",
            icon: Brain,
            onClick: () => {
              const statsEvent = new CustomEvent("trigger-quiz-stats");
              window.dispatchEvent(statsEvent);
            },
          },
        ];

      case "/dashboard":
      default:
        return [
          {
            id: "quick-upload",
            label: "Quick Upload",
            icon: Upload,
            onClick: () => router.push("/dashboard/pdfs"),
            variant: "primary",
          },
          {
            id: "new-note",
            label: "New Note",
            icon: NotebookPen,
            onClick: () => router.push("/dashboard/notes/new"),
          },
          {
            id: "create-quiz",
            label: "Create Quiz",
            icon: Brain,
            onClick: () => router.push("/dashboard/quizzes/create"),
          },
          {
            id: "recent-files",
            label: "Recent Files",
            icon: FileText,
            onClick: () => router.push("/dashboard/pdfs"),
          },
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {
              // Open settings modal or navigate to settings
              console.log("Open settings");
            },
          },
        ];
    }
  };

  const actions = getPageActions();
  const primaryActions = actions.filter(
    (action) => action.variant === "primary"
  );
  const secondaryActions = actions.filter(
    (action) => action.variant !== "primary"
  );

  // Get page title for display
  const getPageTitle = () => {
    const basePath = pathname.split("/").slice(0, 3).join("/");
    switch (basePath) {
      case "/dashboard/pdfs":
        return "Files";
      case "/dashboard/notes":
        return "Notes";
      case "/dashboard/summarize":
        return "Summarize";
      case "/dashboard/quizzes":
        return "Quizzes";
      case "/dashboard":
        return "Dashboard";
      default:
        return "Quick Actions";
    }
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "fixed left-6 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ease-out",
          "translate-x-0 opacity-100",
          className
        )}
      >
        {/* Main Sidebar */}
        <div
          className={cn(
            "relative floating-nav-glass rounded-2xl shadow-2xl transition-all duration-300 ease-out theme-transition",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",
            isExpanded ? "w-64 px-4 py-4" : "w-14 px-2 py-3",
            "floating-nav-enter"
          )}
        >
          {/* Collapsed State - Icon Stack */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-2">
              {/* Expand Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(true)}
                    className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{getPageTitle()} Actions</p>
                </TooltipContent>
              </Tooltip>

              <Separator className="w-6 bg-border/50" />

              {/* Primary Actions */}
              {primaryActions.slice(0, 2).map((action) => {
                const Icon = action.icon;
                return (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          "h-10 w-10 rounded-xl transition-all duration-200",
                          action.variant === "primary"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {action.badge && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {action.badge}
                          </div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                      {action.shortcut && (
                        <p className="text-xs text-muted-foreground">
                          {action.shortcut}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* Secondary Actions */}
              {secondaryActions.slice(0, 3).map((action) => {
                const Icon = action.icon;
                return (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>{action.label}</p>
                      {action.shortcut && (
                        <p className="text-xs text-muted-foreground">
                          {action.shortcut}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* More Actions Indicator */}
              {actions.length > 5 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded(true)}
                      className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>More actions</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Expanded State - Full Action List */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {getPageTitle()}
                  </h3>
                  <p className="text-xs text-muted-foreground">Quick Actions</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Primary Actions */}
              {primaryActions.length > 0 && (
                <div className="space-y-2">
                  {primaryActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          "w-full justify-start gap-3 h-10 px-3 rounded-xl transition-all duration-200",
                          action.variant === "primary"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                            : "bg-muted/50 hover:bg-muted text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {action.label}
                        </span>
                        {action.shortcut && (
                          <span className="ml-auto text-xs opacity-60">
                            {action.shortcut}
                          </span>
                        )}
                        {action.badge && (
                          <div className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {action.badge}
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Separator */}
              {primaryActions.length > 0 && secondaryActions.length > 0 && (
                <Separator className="bg-border/50" />
              )}

              {/* Secondary Actions */}
              {secondaryActions.length > 0 && (
                <div className="space-y-1">
                  {secondaryActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="w-full justify-start gap-3 h-9 px-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{action.label}</span>
                        {action.shortcut && (
                          <span className="ml-auto text-xs opacity-60">
                            {action.shortcut}
                          </span>
                        )}
                        {action.badge && (
                          <div className="ml-auto w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {action.badge}
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  {actions.length} action{actions.length !== 1 ? "s" : ""}{" "}
                  available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
