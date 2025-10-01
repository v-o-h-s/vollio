"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Database,
  Trash2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChunkPerformanceMetrics {
  totalChunks: number;
  averageQuality: number;
  highQualityChunks: number;
  lowQualityChunks: number;
  mostUsedChunks: Array<{
    chunkId: string;
    usageCount: number;
    averageRelevance: number;
  }>;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  usageStatistics: {
    totalUsage: number;
    averageUsage: number;
    peakUsage: number;
  };
}

interface DeduplicationResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  spaceFreed: number;
  duplicateGroups: Array<{
    representativeChunk: string;
    duplicates: string[];
    similarity: number;
  }>;
}

interface CleanupResult {
  chunksProcessed: number;
  chunksRemoved: number;
  versionsRemoved: number;
  analyticsUpdated: number;
  spaceFreed: number;
}

interface ChunkManagementPanelProps {
  documentIds?: string[];
  onMetricsUpdate?: (metrics: ChunkPerformanceMetrics) => void;
}

export function ChunkManagementPanel({
  documentIds,
  onMetricsUpdate,
}: ChunkManagementPanelProps) {
  const [metrics, setMetrics] = useState<ChunkPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load performance metrics
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ action: "metrics" });
      if (documentIds && documentIds.length > 0) {
        params.append("documentIds", documentIds.join(","));
      }

      const response = await fetch(`/api/chunks/management?${params}`);
      const data = await response.json();

      if (data.success) {
        setMetrics(data.data);
        setLastUpdate(new Date());
        onMetricsUpdate?.(data.data);
      } else {
        toast.error("Failed to load chunk metrics");
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast.error("Failed to load chunk metrics");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform deduplication
  const handleDeduplication = async () => {
    setIsDeduplicating(true);
    try {
      const response = await fetch("/api/chunks/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deduplicate",
          documentIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result: DeduplicationResult = data.data;
        toast.success(data.message || "Deduplication completed successfully");

        // Reload metrics after deduplication
        await loadMetrics();
      } else {
        toast.error(data.error || "Deduplication failed");
      }
    } catch (error) {
      console.error("Error during deduplication:", error);
      toast.error("An error occurred during deduplication");
    } finally {
      setIsDeduplicating(false);
    }
  };

  // Perform cleanup
  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const response = await fetch("/api/chunks/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cleanup",
          removeOrphanedChunks: true,
          removeOldVersions: true,
          updateQualityScores: true,
          removeUnusedChunks: false,
          maxAge: 30,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const result: CleanupResult = data.data;
        toast.success(data.message || "Cleanup completed successfully");

        // Reload metrics after cleanup
        await loadMetrics();
      } else {
        toast.error(data.error || "Cleanup failed");
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
      toast.error("An error occurred during cleanup");
    } finally {
      setIsCleaning(false);
    }
  };

  // Update quality scores
  const handleQualityUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chunks/usage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recalculate-quality",
          documentIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Quality scores updated successfully");
        await loadMetrics();
      } else {
        toast.error(data.error || "Quality update failed");
      }
    } catch (error) {
      console.error("Error updating quality scores:", error);
      toast.error("An error occurred while updating quality scores");
    } finally {
      setIsLoading(false);
    }
  };

  // Load metrics on component mount
  useEffect(() => {
    loadMetrics();
  }, [documentIds]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 0.8) return "bg-green-500";
    if (quality >= 0.6) return "bg-yellow-500";
    if (quality >= 0.4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getQualityLabel = (quality: number): string => {
    if (quality >= 0.9) return "Excellent";
    if (quality >= 0.7) return "Good";
    if (quality >= 0.5) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chunk Management</h2>
          <p className="text-muted-foreground">
            Monitor and optimize document chunk performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadMetrics}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Chunks
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalChunks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {documentIds?.length || "all"} documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Quality
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.averageQuality * 100).toFixed(1)}%
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-2 w-16 rounded-full ${getQualityColor(
                    metrics.averageQuality
                  )}`}
                />
                <span className="text-xs text-muted-foreground">
                  {getQualityLabel(metrics.averageQuality)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Quality
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.highQualityChunks}
              </div>
              <p className="text-xs text-muted-foreground">
                {(
                  (metrics.highQualityChunks / metrics.totalChunks) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Quality</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.lowQualityChunks}
              </div>
              <p className="text-xs text-muted-foreground">
                {(
                  (metrics.lowQualityChunks / metrics.totalChunks) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quality Distribution */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quality Distribution
            </CardTitle>
            <CardDescription>
              Distribution of chunk quality scores across your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.qualityDistribution).map(
                ([level, count]) => {
                  const percentage = (count / metrics.totalChunks) * 100;
                  const colors = {
                    excellent: "bg-green-500",
                    good: "bg-blue-500",
                    fair: "bg-yellow-500",
                    poor: "bg-red-500",
                  };

                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              colors[level as keyof typeof colors]
                            }`}
                          />
                          <span className="text-sm font-medium capitalize">
                            {level}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {count} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
            <CardDescription>
              How your chunks are being utilized in quiz generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.usageStatistics.totalUsage}
                </div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.usageStatistics.averageUsage.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground">Average Usage</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.usageStatistics.peakUsage}
                </div>
                <p className="text-sm text-muted-foreground">Peak Usage</p>
              </div>
            </div>

            {metrics.mostUsedChunks.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="text-sm font-medium mb-3">Most Used Chunks</h4>
                  <div className="space-y-2">
                    {metrics.mostUsedChunks.slice(0, 5).map((chunk, index) => (
                      <div
                        key={chunk.chunkId}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="text-sm font-mono">
                            {chunk.chunkId.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{chunk.usageCount} uses</span>
                          <span className="text-muted-foreground">
                            {(chunk.averageRelevance * 100).toFixed(1)}%
                            relevance
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Management Actions</CardTitle>
          <CardDescription>
            Optimize your chunk storage and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={handleDeduplication}
              disabled={isDeduplicating || isLoading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Trash2
                className={`h-5 w-5 ${isDeduplicating ? "animate-pulse" : ""}`}
              />
              <div className="text-center">
                <div className="font-medium">Deduplicate</div>
                <div className="text-xs text-muted-foreground">
                  Remove duplicate chunks
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleCleanup}
              disabled={isCleaning || isLoading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <RefreshCw
                className={`h-5 w-5 ${isCleaning ? "animate-spin" : ""}`}
              />
              <div className="text-center">
                <div className="font-medium">Cleanup</div>
                <div className="text-xs text-muted-foreground">
                  Remove old versions
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleQualityUpdate}
              disabled={isLoading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <TrendingUp
                className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""}`}
              />
              <div className="text-center">
                <div className="font-medium">Update Quality</div>
                <div className="text-xs text-muted-foreground">
                  Recalculate scores
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={loadMetrics}
              disabled={isLoading}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3
                className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""}`}
              />
              <div className="text-center">
                <div className="font-medium">Analyze</div>
                <div className="text-xs text-muted-foreground">
                  Refresh metrics
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
