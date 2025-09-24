"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuizConfiguration, QuizDifficulty, QuizQuestionType } from "@/lib/types";
import { 
  Settings, 
  HelpCircle, 
  Target, 
  BookOpen, 
  Plus, 
  X,
  Info
} from "lucide-react";

interface QuizConfigurationPanelProps {
  config: QuizConfiguration;
  onChange: (config: QuizConfiguration) => void;
  selectedDocuments: string[];
  className?: string;
}

export function QuizConfigurationPanel({ 
  config, 
  onChange, 
  selectedDocuments,
  className 
}: QuizConfigurationPanelProps) {
  const [newFocusArea, setNewFocusArea] = useState("");
  const [newLearningObjective, setNewLearningObjective] = useState("");

  const updateConfig = (updates: Partial<QuizConfiguration>) => {
    onChange({ ...config, ...updates });
  };

  const handleQuestionTypeToggle = (type: QuizQuestionType) => {
    const currentTypes = config.questionTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    // Ensure at least one question type is selected
    if (newTypes.length > 0) {
      updateConfig({ questionTypes: newTypes });
    }
  };

  const addFocusArea = () => {
    if (newFocusArea.trim()) {
      const currentAreas = config.focusAreas || [];
      updateConfig({ 
        focusAreas: [...currentAreas, newFocusArea.trim()] 
      });
      setNewFocusArea("");
    }
  };

  const removeFocusArea = (index: number) => {
    const currentAreas = config.focusAreas || [];
    updateConfig({ 
      focusAreas: currentAreas.filter((_, i) => i !== index) 
    });
  };

  const addLearningObjective = () => {
    if (newLearningObjective.trim()) {
      const currentObjectives = config.learningObjectives || [];
      updateConfig({ 
        learningObjectives: [...currentObjectives, newLearningObjective.trim()] 
      });
      setNewLearningObjective("");
    }
  };

  const removeLearningObjective = (index: number) => {
    const currentObjectives = config.learningObjectives || [];
    updateConfig({ 
      learningObjectives: currentObjectives.filter((_, i) => i !== index) 
    });
  };

  const questionTypeOptions: { type: QuizQuestionType; label: string; description: string }[] = [
    { 
      type: "mcq", 
      label: "Multiple Choice", 
      description: "Questions with 4 answer options" 
    },
    { 
      type: "truefalse", 
      label: "True/False", 
      description: "Binary true or false questions" 
    },
    { 
      type: "fillblank", 
      label: "Fill in the Blank", 
      description: "Questions with missing words or phrases" 
    },
  ];

  const difficultyOptions: { value: QuizDifficulty; label: string; description: string }[] = [
    { 
      value: "easy", 
      label: "Easy", 
      description: "Basic concepts and definitions" 
    },
    { 
      value: "medium", 
      label: "Medium", 
      description: "Application and analysis" 
    },
    { 
      value: "hard", 
      label: "Hard", 
      description: "Complex reasoning and synthesis" 
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quiz Configuration
        </CardTitle>
        <CardDescription>
          Customize your quiz parameters and learning objectives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Input
              id="questionCount"
              type="number"
              min="1"
              max="50"
              value={config.questionCount}
              onChange={(e) => updateConfig({ questionCount: parseInt(e.target.value) || 1 })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Between 1 and 50 questions
            </p>
          </div>

          <div>
            <Label>Difficulty Level</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateConfig({ difficulty: option.value })}
                  className={`p-3 text-left border rounded-lg transition-colors ${
                    config.difficulty === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Question Types</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {questionTypeOptions.map((option) => {
                const isSelected = config.questionTypes?.includes(option.type) || false;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleQuestionTypeToggle(option.type)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleQuestionTypeToggle(option.type)}
                        className="rounded border-border"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Separator />

        {/* Page Range */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <Label>Page Range (Optional)</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="pageStart" className="text-sm">Start Page</Label>
              <Input
                id="pageStart"
                type="number"
                min="1"
                placeholder="1"
                value={config.pageRange?.start || ""}
                onChange={(e) => {
                  const start = parseInt(e.target.value) || undefined;
                  updateConfig({
                    pageRange: start ? {
                      start,
                      end: config.pageRange?.end || start
                    } : undefined
                  });
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pageEnd" className="text-sm">End Page</Label>
              <Input
                id="pageEnd"
                type="number"
                min={config.pageRange?.start || 1}
                placeholder="Last"
                value={config.pageRange?.end || ""}
                onChange={(e) => {
                  const end = parseInt(e.target.value) || undefined;
                  updateConfig({
                    pageRange: config.pageRange?.start && end ? {
                      start: config.pageRange.start,
                      end
                    } : undefined
                  });
                }}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty to use entire document(s)
          </p>
        </div>

        <Separator />

        {/* Focus Areas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <Label>Focus Areas</Label>
            <div className="group relative">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                Specific topics or themes to emphasize in quiz questions
              </div>
            </div>
          </div>
          
          {config.focusAreas && config.focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.focusAreas.map((area, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {area}
                  <button
                    type="button"
                    onClick={() => removeFocusArea(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Machine Learning, Data Structures"
              value={newFocusArea}
              onChange={(e) => setNewFocusArea(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFocusArea()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFocusArea}
              disabled={!newFocusArea.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <Label>Learning Objectives</Label>
            <div className="group relative">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                What students should learn or be able to do after taking this quiz
              </div>
            </div>
          </div>
          
          {config.learningObjectives && config.learningObjectives.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.learningObjectives.map((objective, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {objective}
                  <button
                    type="button"
                    onClick={() => removeLearningObjective(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Understand key concepts, Apply algorithms"
              value={newLearningObjective}
              onChange={(e) => setNewLearningObjective(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addLearningObjective()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLearningObjective}
              disabled={!newLearningObjective.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Instructions</Label>
          <Textarea
            id="notes"
            placeholder="Any specific instructions or context for quiz generation..."
            value={config.notes || ""}
            onChange={(e) => updateConfig({ notes: e.target.value })}
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {(config.notes || "").length}/2000 characters
          </p>
        </div>

        {/* Multi-Document Configuration */}
        {selectedDocuments.length > 1 && (
          <div className="space-y-4">
            <Separator />
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Multi-Document Quiz Settings
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <p>• Questions will be generated from content across all {selectedDocuments.length} selected documents</p>
                <p>• The system will automatically balance content representation from each document</p>
                <p>• Cross-document synthesis will be used to create comprehensive questions</p>
                <p>• Source attribution will show which documents contributed to each question</p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        {selectedDocuments.length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Configuration Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• {config.questionCount} questions from {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''}</p>
              <p>• Difficulty: {config.difficulty}</p>
              <p>• Types: {config.questionTypes?.join(", ") || "None selected"}</p>
              {config.pageRange && selectedDocuments.length === 1 && (
                <p>• Pages: {config.pageRange.start}-{config.pageRange.end}</p>
              )}
              {config.pageRange && selectedDocuments.length > 1 && (
                <p>• Page range {config.pageRange.start}-{config.pageRange.end} applied to all documents</p>
              )}
              {config.focusAreas && config.focusAreas.length > 0 && (
                <p>• Focus areas: {config.focusAreas.length}</p>
              )}
              {config.learningObjectives && config.learningObjectives.length > 0 && (
                <p>• Learning objectives: {config.learningObjectives.length}</p>
              )}
              {selectedDocuments.length > 1 && (
                <p>• Multi-document synthesis enabled with balanced content representation</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}