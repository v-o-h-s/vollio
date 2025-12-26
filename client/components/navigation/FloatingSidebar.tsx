"use client";

import { useState } from "react";
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
  DocumentBarChart,
  Sparkles,
  History,
  Download,
  Copy,
  HardDrive,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  CreditCard,
  School,
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
import { usePageStatistics } from "@/hooks/use-page-statistics";

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
  const statistics = usePageStatistics();

  // Get page-specific actions based on current route
  const getPageActions = (): QuickAction[] => {
    const basePath = pathname.split("/").slice(0, 3).join("/"); // /dashboard/[page]

    switch (basePath) {
      case "/dashboard/documents":
        return [
          {
            id: "upload-document",
            label: "Upload Document",
            icon: Upload,
            onClick: () => {
              // Trigger upload action - could emit event or call a function
              const uploadEvent = new CustomEvent("trigger-document-upload");
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
            id: "search-documents",
            label: "Search Documents",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-document-search");
              window.dispatchEvent(searchEvent);
            },
            shortcut: "Ctrl+F",
          },
          {
            id: "filter-documents",
            label: "Filter & Sort",
            icon: Filter,
            onClick: () => {
              const filterEvent = new CustomEvent("trigger-document-filter");
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
            id: "refresh-documents",
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

      case "/dashboard/knowledge-test":
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
            id: "create-flashcards",
            label: "Create Flashcards",
            icon: Plus,
            onClick: () => router.push("/dashboard/flashcards/create"),
            variant: "primary",
            shortcut: "Ctrl+Shift+N",
          },
          {
            id: "search-knowledge",
            label: "Search",
            icon: Search,
            onClick: () => {
              const searchEvent = new CustomEvent("trigger-knowledge-search");
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
            id: "bookmarked",
            label: "Bookmarked",
            icon: Bookmark,
            onClick: () => {
              const bookmarkEvent = new CustomEvent("trigger-bookmark-filter");
              window.dispatchEvent(bookmarkEvent);
            },
          },
        ];

      // /dashboard/flashcards handled via knowledge-test

      case "/dashboard":
      default:
        return [
          {
            id: "quick-upload",
            label: "Quick Upload",
            icon: Upload,
            onClick: () => router.push("/dashboard/documents"),
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
            id: "recent-documents",
            label: "Recent Documents",
            icon: FileText,
            onClick: () => router.push("/dashboard/documents"),
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
      case "/dashboard/documents":
        return "Documents";
      case "/dashboard/notes":
        return "Notes";
      case "/dashboard/summarize":
        return "Summarize";
      case "/dashboard/quizzes":
      case "/dashboard/flashcards":
      case "/dashboard/knowledge-test":
        return "Knowledge";
      case "/dashboard":
        return "Dashboard";
      default:
        return "Quick Actions";
    }
  };

  // Get page-specific data sections
  const getDataSections = () => {
    const basePath = pathname.split("/").slice(0, 3).join("/");
    
    switch (basePath) {
      case "/dashboard/documents":
        return [
          {
            label: "Total Documents",
            value: statistics.loading ? "..." : statistics.totalItems.toString(),
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Recent Uploads",
            value: statistics.loading ? "..." : statistics.recentItems.toString(),
            icon: Upload,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Storage Used",
            value: statistics.loading ? "..." : statistics.storageUsed,
            icon: HardDrive,
            color: "text-purple-600 dark:text-purple-400",
          },
        ];

      case "/dashboard/notes":
        return [
          {
            label: "Total Notes",
            value: statistics.loading ? "..." : statistics.totalItems.toString(),
            icon: NotebookPen,
            color: "text-purple-600 dark:text-purple-400",
          },
          {
            label: "Recent Notes",
            value: statistics.loading ? "..." : statistics.recentItems.toString(),
            icon: Clock,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Content Size",
            value: statistics.loading ? "..." : statistics.storageUsed,
            icon: BarChart3,
            color: "text-blue-600 dark:text-blue-400",
          },
        ];

      case "/dashboard/quizzes":
      case "/dashboard/knowledge-test":
        return [
          {
            label: "Total Quizzes",
            value: statistics.loading ? "..." : statistics.totalItems.toString(),
            icon: Brain,
            color: "text-orange-600 dark:text-orange-400",
          },
          {
            label: "Avg Score",
            value: statistics.loading ? "..." : `${statistics.averageScore || 0}%`,
            icon: Target,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Study Streak",
            value: statistics.loading ? "..." : `${statistics.studyStreak || 0} days`,
            icon: Award,
            color: "text-yellow-600 dark:text-yellow-400",
          },
        ];
      // flashcards metrics are shown under knowledge as well

      case "/dashboard/summarize":
        return [
          {
            label: "Documents",
            value: statistics.loading ? "..." : statistics.totalItems.toString(),
            icon: FileText,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Recent Summaries",
            value: statistics.loading ? "..." : statistics.recentItems.toString(),
            icon: Sparkles,
            color: "text-purple-600 dark:text-purple-400",
          },
          {
            label: "Summary Size",
            value: statistics.loading ? "..." : statistics.storageUsed,
            icon: BarChart3,
            color: "text-green-600 dark:text-green-400",
          },
        ];

      case "/dashboard":
      default:
        return [
          {
            label: "Total Items",
            value: statistics.loading ? "..." : statistics.totalItems.toString(),
            icon: DocumentBarChart,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Recent Activity",
            value: statistics.loading ? "..." : statistics.recentItems.toString(),
            icon: TrendingUp,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Storage Used",
            value: statistics.loading ? "..." : statistics.storageUsed,
            icon: HardDrive,
            color: "text-purple-600 dark:text-purple-400",
          },
        ];
    }
  };

  const dataSections = getDataSections();

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
            "relative floating-nav-glass rounded-2xl shadow-2xl transition-all duration-500 ease-out theme-transition",
            "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",
            "backdrop-blur-xl bg-background/80 border border-border/50",
            isExpanded ? "w-64 px-4 py-4" : "w-14 px-2 py-3",
            "floating-nav-enter transform-gpu"
          )}
        >
          {/* Collapsed State - Icon Stack */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-2 transition-all duration-300 ease-out">
              {/* Expand Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(true)}
                    className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{getPageTitle()} Actions</p>
                </TooltipContent>
              </Tooltip>

              <Separator className="w-6 bg-border/50" />

              {/* Compact Data Indicator */}
              <div className="flex flex-col items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <BarChart3 className="w-3 h-3 text-primary mb-1" />
                      <span className="text-xs font-medium text-foreground">
                        {statistics.loading ? "..." : statistics.totalItems}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="space-y-1">
                      <p className="font-medium">{getPageTitle()} Statistics</p>
                      {dataSections.map((section, index) => (
                        <p key={index} className="text-xs">
                          {section.label}: {section.value}
                        </p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

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
                          "h-10 w-10 rounded-xl transition-all duration-300 transform-gpu",
                          "hover:scale-110 active:scale-95 hover:backdrop-blur-sm",
                          action.variant === "primary"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground hover:shadow-md"
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
            <div className="space-y-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-left-2">
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
                  className="h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* Data Sections */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Page Statistics
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {dataSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-3 h-3", section.color)} />
                          <span className="text-xs text-muted-foreground">
                            {section.label}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {section.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Separator */}
              <Separator className="bg-border/50" />

              {/* Primary Actions */}
              {primaryActions.length > 0 && (
                <div className="space-y-2">
                  {primaryActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          "w-full justify-start gap-3 h-10 px-3 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-left-2 transform-gpu",
                          "hover:scale-105 hover:shadow-lg",
                          action.variant === "primary"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-muted/50 hover:bg-muted text-foreground hover:backdrop-blur-sm"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
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
                  {secondaryActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className="w-full justify-start gap-3 h-9 px-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 animate-in fade-in slide-in-from-left-2 hover:scale-105 transform-gpu"
                        style={{ animationDelay: `${(primaryActions.length + index) * 50}ms` }}
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
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{actions.length} actions</span>
                  {statistics.error && (
                    <span className="text-red-500">Data error</span>
                  )}
                  {!statistics.error && !statistics.loading && (
                    <span className="text-green-500">Live data</span>
                  )}
                </div>
                {statistics.error && (
                  <p className="text-xs text-red-500 text-center">
                    {statistics.error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
