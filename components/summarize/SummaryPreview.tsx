"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Copy,
  Download,
  Share2,
  Edit3,
  BookOpen,
  Clock,
  User,
  Settings,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface SummaryPreviewProps {
  summary: {
    id: string;
    title: string;
    content: string;
    documentCount: number;
    documentTitles: string[];
    wordCount: number;
    createdAt: string;
    settings: {
      summaryType: string;
      length: string;
      focus: string;
      tone: string;
    };
  };
  onClose: () => void;
  onEdit?: () => void;
}

export function SummaryPreview({ summary, onClose, onEdit }: SummaryPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(summary.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.content);
      toast.success("Summary copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: summary.title,
          text: summary.content,
        });
      } catch (error) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSaveEdit = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    toast.success("Summary updated!");
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

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${
      isFullscreen ? "p-0" : ""
    }`}>
      <Card className={`w-full overflow-hidden ${
        isFullscreen 
          ? "h-full max-w-none rounded-none" 
          : "max-w-4xl max-h-[90vh]"
      }`}>
        <CardHeader className="border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">{summary.title}</CardTitle>
                <Badge className={getSummaryTypeColor(summary.settings.summaryType)}>
                  {summary.settings.summaryType}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {summary.documentCount} document{summary.documentCount !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {summary.wordCount} words
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Source Documents:</p>
            <div className="flex flex-wrap gap-1">
              {summary.documentTitles.slice(0, 5).map((title, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {title.length > 25 ? `${title.substring(0, 25)}...` : title}
                </Badge>
              ))}
              {summary.documentTitles.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{summary.documentTitles.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto p-6">
          {/* Summary Settings Info */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Generation Settings</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium">{summary.settings.summaryType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Length:</span>
                <span className="ml-2 font-medium">{summary.settings.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Focus:</span>
                <span className="ml-2 font-medium">{summary.settings.focus}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tone:</span>
                <span className="ml-2 font-medium">{summary.settings.tone}</span>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Summary Content */}
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit Summary</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 p-4 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Edit your summary..."
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap leading-relaxed">
                {summary.content}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}