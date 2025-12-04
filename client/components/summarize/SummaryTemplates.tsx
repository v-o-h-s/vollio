"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface SummaryTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "academic" | "business" | "research" | "general";
  settings: {
    summaryType: "brief" | "detailed" | "bullet-points" | "executive";
    length: "short" | "medium" | "long";
    focus: "key-points" | "methodology" | "conclusions" | "comprehensive";
    tone: "academic" | "professional" | "casual" | "technical";
  };
  customPrompt: string;
  tags: string[];
}

interface SummaryTemplatesProps {
  onTemplateSelect: (template: SummaryTemplate) => void;
  selectedTemplateId?: string;
}

export function SummaryTemplates({ onTemplateSelect, selectedTemplateId }: SummaryTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const templates: SummaryTemplate[] = [
    {
      id: "academic-research",
      name: "Academic Research Summary",
      description: "Comprehensive summary focusing on methodology, findings, and conclusions",
      icon: <GraduationCap className="w-5 h-5" />,
      category: "academic",
      settings: {
        summaryType: "detailed",
        length: "long",
        focus: "methodology",
        tone: "academic",
      },
      customPrompt: "Focus on research methodology, key findings, statistical significance, and academic implications. Include citations and theoretical framework.",
      tags: ["research", "methodology", "findings", "academic"],
    },
    {
      id: "executive-brief",
      name: "Executive Brief",
      description: "High-level overview for decision makers and stakeholders",
      icon: <Briefcase className="w-5 h-5" />,
      category: "business",
      settings: {
        summaryType: "executive",
        length: "short",
        focus: "conclusions",
        tone: "professional",
      },
      customPrompt: "Create a concise executive summary highlighting key decisions, recommendations, and business impact. Focus on actionable insights.",
      tags: ["executive", "business", "decisions", "recommendations"],
    },
    {
      id: "literature-review",
      name: "Literature Review",
      description: "Systematic review of multiple sources with comparative analysis",
      icon: <BookOpen className="w-5 h-5" />,
      category: "research",
      settings: {
        summaryType: "detailed",
        length: "long",
        focus: "comprehensive",
        tone: "academic",
      },
      customPrompt: "Synthesize information from multiple sources, identify common themes, contradictions, and research gaps. Provide comparative analysis.",
      tags: ["literature", "review", "synthesis", "comparison"],
    },
    {
      id: "key-insights",
      name: "Key Insights & Takeaways",
      description: "Bullet-point summary of main ideas and actionable insights",
      icon: <Lightbulb className="w-5 h-5" />,
      category: "general",
      settings: {
        summaryType: "bullet-points",
        length: "medium",
        focus: "key-points",
        tone: "professional",
      },
      customPrompt: "Extract the most important insights, key takeaways, and actionable recommendations in a clear, bullet-point format.",
      tags: ["insights", "takeaways", "actionable", "key-points"],
    },
    {
      id: "project-overview",
      name: "Project Overview",
      description: "Comprehensive project summary including goals, progress, and outcomes",
      icon: <Target className="w-5 h-5" />,
      category: "business",
      settings: {
        summaryType: "detailed",
        length: "medium",
        focus: "comprehensive",
        tone: "professional",
      },
      customPrompt: "Summarize project objectives, current status, key milestones, challenges, and expected outcomes. Include timeline and resource information.",
      tags: ["project", "goals", "progress", "outcomes"],
    },
    {
      id: "meeting-notes",
      name: "Meeting Summary",
      description: "Structured summary of meeting discussions, decisions, and action items",
      icon: <Users className="w-5 h-5" />,
      category: "business",
      settings: {
        summaryType: "bullet-points",
        length: "short",
        focus: "key-points",
        tone: "professional",
      },
      customPrompt: "Organize meeting content into: key discussions, decisions made, action items with owners, and next steps. Use clear bullet points.",
      tags: ["meeting", "decisions", "action-items", "discussions"],
    },
    {
      id: "technical-analysis",
      name: "Technical Analysis",
      description: "In-depth technical summary with implementation details",
      icon: <FileText className="w-5 h-5" />,
      category: "research",
      settings: {
        summaryType: "detailed",
        length: "long",
        focus: "methodology",
        tone: "technical",
      },
      customPrompt: "Focus on technical specifications, implementation details, system architecture, and technical challenges. Include code examples if relevant.",
      tags: ["technical", "implementation", "architecture", "specifications"],
    },
    {
      id: "market-analysis",
      name: "Market Analysis",
      description: "Business-focused summary of market trends and opportunities",
      icon: <TrendingUp className="w-5 h-5" />,
      category: "business",
      settings: {
        summaryType: "executive",
        length: "medium",
        focus: "conclusions",
        tone: "professional",
      },
      customPrompt: "Analyze market trends, competitive landscape, opportunities, and risks. Focus on business implications and strategic recommendations.",
      tags: ["market", "trends", "competitive", "opportunities"],
    },
  ];

  const categories = [
    { id: "all", name: "All Templates", count: templates.length },
    { id: "academic", name: "Academic", count: templates.filter(t => t.category === "academic").length },
    { id: "business", name: "Business", count: templates.filter(t => t.category === "business").length },
    { id: "research", name: "Research", count: templates.filter(t => t.category === "research").length },
    { id: "general", name: "General", count: templates.filter(t => t.category === "general").length },
  ];

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "business":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "research":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "general":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Summary Templates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose from predefined templates to generate targeted summaries
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplateId === template.id
                  ? "ring-2 ring-primary/50 bg-primary/5"
                  : "hover:bg-muted/30"
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <Badge className={getCategoryColor(template.category)} variant="outline">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplateId === template.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>

                {/* Template Settings Preview */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-1 font-medium">{template.settings.summaryType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length:</span>
                    <span className="ml-1 font-medium">{template.settings.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Focus:</span>
                    <span className="ml-1 font-medium">{template.settings.focus}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tone:</span>
                    <span className="ml-1 font-medium">{template.settings.tone}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}