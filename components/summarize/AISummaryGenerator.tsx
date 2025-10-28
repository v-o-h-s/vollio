"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  FileText,
  Download,
  Copy,
  Share2,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SelectedDocument {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
  fileSize: number;
  pageCount?: number;
  selectedPages?: number[];
}

interface AISummaryGeneratorProps {
  selectedDocuments: SelectedDocument[];
  onGenerationComplete: () => void;
  selectedTemplate?: any;
}

interface SummarySettings {
  summaryType: "brief" | "detailed" | "bullet-points" | "executive";
  length: "short" | "medium" | "long";
  focus: "key-points" | "methodology" | "conclusions" | "comprehensive";
  tone: "academic" | "professional" | "casual" | "technical";
}

interface GenerationProgress {
  stage:
    | "preparing"
    | "extracting"
    | "analyzing"
    | "generating"
    | "complete"
    | "error";
  progress: number;
  currentDocument?: string;
  message: string;
}

export function AISummaryGenerator({
  selectedDocuments,
  onGenerationComplete,
  selectedTemplate,
}: AISummaryGeneratorProps) {
  const [settings, setSettings] = useState<SummarySettings>({
    summaryType: "detailed",
    length: "medium",
    focus: "key-points",
    tone: "professional",
  });

  // Update settings when template is selected
  useEffect(() => {
    if (selectedTemplate?.settings) {
      setSettings(selectedTemplate.settings);
      setCustomPrompt(selectedTemplate.customPrompt || "");
    }
  }, [selectedTemplate]);

  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    stage: "preparing",
    progress: 0,
    message: "Ready to generate summary",
  });
  const [generatedSummary, setGeneratedSummary] = useState<string>("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress({
      stage: "preparing",
      progress: 10,
      message: "Preparing documents for processing...",
    });

    try {
      // Simulate document processing stages
      await simulateProgress();

      // Generate mock summary based on settings
      const mockSummary = generateMockSummary();
      setGeneratedSummary(mockSummary);

      setProgress({
        stage: "complete",
        progress: 100,
        message: "Summary generated successfully!",
      });

      toast.success("Summary generated successfully!");
      onGenerationComplete();
    } catch (error) {
      console.error("Summary generation error:", error);
      setProgress({
        stage: "error",
        progress: 0,
        message: "Failed to generate summary. Please try again.",
      });
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateProgress = async () => {
    const stages = [
      {
        stage: "extracting" as const,
        progress: 30,
        message: "Extracting text from documents...",
      },
      {
        stage: "analyzing" as const,
        progress: 60,
        message: "Analyzing document content...",
      },
      {
        stage: "generating" as const,
        progress: 90,
        message: "Generating AI summary...",
      },
    ];

    for (const stageData of stages) {
      setProgress(stageData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  };

  const generateMockSummary = () => {
    const documentTitles = selectedDocuments.map(doc => doc.title).join(", ");
    const totalPages = selectedDocuments.reduce((sum, doc) => sum + (doc.pageCount || 1), 0);
    
    let summary = "";
    
    switch (settings.summaryType) {
      case "executive":
        summary = `# Executive Summary

This executive summary covers ${selectedDocuments.length} document(s): ${documentTitles}.

## Key Findings
- The documents contain comprehensive information across ${totalPages} pages
- Main themes focus on ${settings.focus.replace("-", " ")}
- Analysis reveals significant insights relevant to the subject matter

## Recommendations
- Further analysis of the key concepts is recommended
- Implementation of the discussed methodologies should be considered
- Regular review of the findings will ensure continued relevance

## Conclusion
The reviewed documents provide valuable insights that can inform decision-making and strategic planning.`;
        break;
        
      case "bullet-points":
        summary = `# Summary: ${documentTitles}

## Key Points
• Documents analyzed: ${selectedDocuments.length} files (${totalPages} total pages)
• Primary focus: ${settings.focus.replace("-", " ")}
• Tone: ${settings.tone}
• Length: ${settings.length}

## Main Findings
• Comprehensive coverage of the subject matter
• Well-structured presentation of information
• Clear methodology and approach
• Relevant examples and case studies
• Actionable insights and recommendations

## Important Takeaways
• The content provides valuable insights for understanding the topic
• Multiple perspectives are presented throughout the documents
• Practical applications are discussed in detail
• Future research directions are identified
• Implementation strategies are outlined`;
        break;
        
      case "detailed":
        summary = `# Detailed Analysis: ${documentTitles}

## Overview
This detailed analysis examines ${selectedDocuments.length} document(s) totaling ${totalPages} pages. The analysis focuses on ${settings.focus.replace("-", " ")} with a ${settings.tone} tone.

## Document Structure and Content
The reviewed documents present information in a structured manner, covering various aspects of the subject matter. Each document contributes unique perspectives and insights that collectively provide a comprehensive understanding of the topic.

## Key Themes and Concepts
Several important themes emerge from the analysis:

1. **Foundational Concepts**: The documents establish clear foundational knowledge
2. **Methodological Approaches**: Various methodologies are discussed and compared
3. **Practical Applications**: Real-world applications and case studies are presented
4. **Future Directions**: Potential areas for further research and development

## Analysis and Interpretation
The content demonstrates a thorough understanding of the subject matter, with clear explanations and well-supported arguments. The authors present balanced viewpoints and acknowledge different perspectives where appropriate.

## Conclusions and Implications
The analysis reveals significant insights that have practical implications for the field. The findings suggest several areas where further investigation would be beneficial, and the recommendations provide actionable steps for implementation.

## Recommendations for Further Study
Based on this analysis, several recommendations emerge for future research and practical application of the concepts discussed in these documents.`;
        break;
        
      default: // brief
        summary = `# Brief Summary: ${documentTitles}

This summary covers ${selectedDocuments.length} document(s) with ${totalPages} total pages.

The documents provide comprehensive coverage of the subject matter with a focus on ${settings.focus.replace("-", " ")}. Key insights include practical applications, methodological approaches, and recommendations for implementation.

The analysis reveals important findings that can inform decision-making and provide direction for future work. The content is well-structured and presents information in a clear, accessible manner.

Overall, these documents serve as valuable resources for understanding the topic and provide actionable insights for practical application.`;
    }

    // Add custom prompt context if provided
    if (customPrompt.trim()) {
      summary += `\n\n## Additional Context\nBased on the specific requirements: "${customPrompt.trim()}", this summary has been tailored to address those particular aspects and considerations.`;
    }

    return summary;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedSummary);
      toast.success("Summary copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy summary");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedSummary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Summary Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="summaryType">Summary Type</Label>
              <Select
                value={settings.summaryType}
                onValueChange={(value: any) =>
                  setSettings((prev) => ({ ...prev, summaryType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief Overview</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="bullet-points">Bullet Points</SelectItem>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select
                value={settings.length}
                onValueChange={(value: any) =>
                  setSettings((prev) => ({ ...prev, length: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 paragraphs)</SelectItem>
                  <SelectItem value="medium">
                    Medium (3-5 paragraphs)
                  </SelectItem>
                  <SelectItem value="long">Long (6+ paragraphs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus">Focus Area</Label>
              <Select
                value={settings.focus}
                onValueChange={(value: any) =>
                  setSettings((prev) => ({ ...prev, focus: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="key-points">Key Points</SelectItem>
                  <SelectItem value="methodology">Methodology</SelectItem>
                  <SelectItem value="conclusions">Conclusions</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={settings.tone}
                onValueChange={(value: any) =>
                  setSettings((prev) => ({ ...prev, tone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Add any specific instructions for the AI summary generation..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {progress.stage === "error" ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : progress.stage === "complete" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  <span className="font-medium">{progress.message}</span>
                </div>
                <Badge
                  variant={
                    progress.stage === "error" ? "destructive" : "secondary"
                  }
                >
                  {progress.progress}%
                </Badge>
              </div>
              <Progress value={progress.progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Summary */}
      {generatedSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Summary
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {generatedSummary}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {!generatedSummary && (
        <div className="flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedDocuments.length === 0}
            size="lg"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isGenerating ? "Generating Summary..." : "Generate AI Summary"}
          </Button>
        </div>
      )}
    </div>
  );
}
