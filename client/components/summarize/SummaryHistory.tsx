"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Copy,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { SummaryPreview } from "./SummaryPreview";

interface SummaryHistoryItem {
  id: string;
  title: string;
  documentCount: number;
  documentTitles: string[];
  summaryType: string;
  length: string;
  createdAt: string;
  wordCount: number;
  summary: string;
  settings: {
    summaryType: string;
    length: string;
    focus: string;
    tone: string;
  };
}

export function SummaryHistory() {
  const [summaries, setSummaries] = useState<SummaryHistoryItem[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<
    SummaryHistoryItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title" | "documents"
  >("newest");
  const [filterType, setFilterType] = useState<
    "all" | "brief" | "detailed" | "bullet-points" | "executive"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] =
    useState<SummaryHistoryItem | null>(null);

  useEffect(() => {
    loadSummaryHistory();
  }, []);

  useEffect(() => {
    filterAndSortSummaries();
  }, [summaries, searchQuery, sortBy, filterType]);

  const loadSummaryHistory = async () => {
    try {
      // For now, use dummy data. Replace with actual API call
      const dummyData: SummaryHistoryItem[] = [
        {
          id: "1",
          title: "Research Paper Analysis",
          documentCount: 3,
          documentTitles: [
            "Machine Learning Fundamentals.pdf",
            "Deep Learning Applications.pdf",
            "Neural Networks.pdf",
          ],
          summaryType: "detailed",
          length: "medium",
          createdAt: "2024-01-15T10:30:00Z",
          wordCount: 450,
          summary:
            "This comprehensive analysis covers the fundamental concepts of machine learning...",
          settings: {
            summaryType: "detailed",
            length: "medium",
            focus: "key-points",
            tone: "academic",
          },
        },
        {
          id: "2",
          title: "Project Documentation Summary",
          documentCount: 5,
          documentTitles: [
            "Project Plan.pdf",
            "Requirements.pdf",
            "Architecture.pdf",
            "Testing.pdf",
            "Deployment.pdf",
          ],
          summaryType: "executive",
          length: "short",
          createdAt: "2024-01-14T15:45:00Z",
          wordCount: 280,
          summary:
            "Executive summary of the project documentation covering all phases...",
          settings: {
            summaryType: "executive",
            length: "short",
            focus: "conclusions",
            tone: "professional",
          },
        },
        {
          id: "3",
          title: "Literature Review",
          documentCount: 8,
          documentTitles: [
            "Paper1.pdf",
            "Paper2.pdf",
            "Paper3.pdf",
            "Paper4.pdf",
            "Paper5.pdf",
            "Paper6.pdf",
            "Paper7.pdf",
            "Paper8.pdf",
          ],
          summaryType: "bullet-points",
          length: "long",
          createdAt: "2024-01-13T09:15:00Z",
          wordCount: 650,
          summary: "• Key findings from recent literature in the field...",
          settings: {
            summaryType: "bullet-points",
            length: "long",
            focus: "comprehensive",
            tone: "academic",
          },
        },
      ];

      setSummaries(dummyData);
    } catch (error) {
      console.error("Failed to load summary history:", error);
      toast.error("Failed to load summary history");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortSummaries = () => {
    let filtered = summaries.filter((summary) => {
      const matchesSearch =
        summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.documentTitles.some((title) =>
          title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter =
        filterType === "all" || summary.settings.summaryType === filterType;

      return matchesSearch && matchesFilter;
    });

    // Sort summaries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "documents":
          return b.documentCount - a.documentCount;
        default:
          return 0;
      }
    });

    setFilteredSummaries(filtered);
  };

  const handleView = (summary: SummaryHistoryItem) => {
    setSelectedSummary(summary);
  };

  const handleCopy = async (summary: SummaryHistoryItem) => {
    try {
      await navigator.clipboard.writeText(summary.summary);
      toast.success("Summary copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownload = (summary: SummaryHistoryItem) => {
    const blob = new Blob([summary.summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${summary.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  };

  const handleDelete = async (summaryId: string) => {
    try {
      // Replace with actual API call
      setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
      toast.success("Summary deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete summary");
    }
  };

  const getSummaryTypeColor = (type: string) => {
    switch (type) {
      case "brief":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "detailed":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "bullet-points":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "executive":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value: any) => setFilterType(value)}
              >
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="bullet-points">Bullet Points</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary List */}
      <div className="space-y-4">
        {filteredSummaries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No summaries found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Generate your first summary to see it here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSummaries.map((summary) => (
            <Card
              key={summary.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{summary.title}</h3>
                      <Badge
                        className={getSummaryTypeColor(
                          summary.settings.summaryType
                        )}
                      >
                        {summary.settings.summaryType}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {summary.documentCount} document
                        {summary.documentCount !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(summary.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {summary.wordCount} words
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Documents:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {summary.documentTitles
                          .slice(0, 3)
                          .map((title, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {title.length > 20
                                ? `${title.substring(0, 20)}...`
                                : title}
                            </Badge>
                          ))}
                        {summary.documentTitles.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{summary.documentTitles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {summary.summary.substring(0, 150)}...
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(summary)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Summary
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(summary)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(summary)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(summary.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Detail Modal */}
      {selectedSummary && (
        <SummaryPreview
          summary={{
            id: selectedSummary.id,
            title: selectedSummary.title,
            content: selectedSummary.summary,
            documentCount: selectedSummary.documentCount,
            documentTitles: selectedSummary.documentTitles,
            wordCount: selectedSummary.wordCount,
            createdAt: selectedSummary.createdAt,
            settings: selectedSummary.settings,
          }}
          onClose={() => setSelectedSummary(null)}
        />
      )}
    </div>
  );
}
