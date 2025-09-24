"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuizConfiguration } from "@/lib/types";
import { 
  Settings, 
  Hash, 
  Target, 
  HelpCircle, 
  CheckCircle2, 
  Circle,
  ChevronDown,
  ChevronUp,
  FileText,
  Brain,
  Clock
} from "lucide-react";

interface MobileQuizConfigurationPanelProps {
  config: QuizConfiguration;
  onChange: (config: QuizConfiguration) => void;
  selectedDocuments: string[];
}

export function MobileQuizConfigurationPanel({
  config,
  onChange,
  selectedDocuments
}: MobileQuizConfigurationPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleQuestionCountChange = (count: number) => {
    onChange({ ...config, questionCount: count });
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleDifficultyChange = (difficulty: QuizConfiguration['difficulty']) => {
    onChange({ ...config, difficulty });
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleQuestionTypeToggle = (type: QuizConfiguration['questionTypes'][0]) => {
    const currentTypes = config.questionTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    // Ensure at least one type is selected
    if (newTypes.length > 0) {
      onChange({ ...config, questionTypes: newTypes });
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...config, notes });
  };

  const handlePageRangeChange = (pageRange: { start: number; end: number } | undefined) => {
    onChange({ ...config, pageRange });
  };

  const questionCountOptions = [5, 10, 15, 20, 25, 30];
  const difficultyOptions: Array<{ value: QuizConfiguration['difficulty']; label: string; description: string; icon: React.ReactNode }> = [
    { 
      value: 'easy', 
      label: 'Easy', 
      description: 'Basic concepts and definitions',
      icon: <Circle className="h-4 w-4" />
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Application and analysis',
      icon: <Target className="h-4 w-4" />
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      description: 'Complex reasoning and synthesis',
      icon: <Brain className="h-4 w-4" />
    },
  ];

  const questionTypeOptions = [
    { 
      value: 'mcq' as const, 
      label: 'Multiple Choice', 
      description: '4 options with 1 correct answer',
      icon: <CheckCircle2 className="h-4 w-4" />
    },
    { 
      value: 'truefalse' as const, 
      label: 'True/False', 
      description: 'Binary choice questions',
      icon: <HelpCircle className="h-4 w-4" />
    },
    { 
      value: 'fillblank' as const, 
      label: 'Fill in the Blank', 
      description: 'Type the correct answer',
      icon: <FileText className="h-4 w-4" />
    },
  ];

  return (
    <div className="space-y-4">
      {/* Question Count Section */}
      <Card>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('count')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Question Count</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{config.questionCount}</Badge>
              {expandedSection === 'count' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        
        {expandedSection === 'count' && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {questionCountOptions.map((count) => (
                <Button
                  key={count}
                  variant={config.questionCount === count ? "default" : "outline"}
                  onClick={() => handleQuestionCountChange(count)}
                  className="h-12 text-base font-medium"
                >
                  {count}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              More questions provide better coverage but take longer to complete
            </p>
          </CardContent>
        )}
      </Card>

      {/* Difficulty Section */}
      <Card>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('difficulty')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Difficulty Level</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{config.difficulty}</Badge>
              {expandedSection === 'difficulty' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        
        {expandedSection === 'difficulty' && (
          <CardContent className="pt-0 space-y-3">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDifficultyChange(option.value)}
                className={`w-full p-4 text-left border rounded-lg transition-all active:scale-[0.98] ${
                  config.difficulty === option.value
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    config.difficulty === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Question Types Section */}
      <Card>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('types')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Question Types</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{config.questionTypes?.length || 0} selected</Badge>
              {expandedSection === 'types' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        
        {expandedSection === 'types' && (
          <CardContent className="pt-0 space-y-3">
            {questionTypeOptions.map((option) => {
              const isSelected = config.questionTypes?.includes(option.value) || false;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleQuestionTypeToggle(option.value)}
                  className={`w-full p-4 text-left border rounded-lg transition-all active:scale-[0.98] ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4" /> : option.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            <p className="text-xs text-muted-foreground text-center mt-3">
              Select at least one question type. Mix types for variety.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Additional Notes Section */}
      <Card>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => toggleSection('notes')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Focus Areas</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {config.notes && (
                <Badge variant="secondary">Added</Badge>
              )}
              {expandedSection === 'notes' ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <CardDescription className="text-sm">
            Optional: Specify topics or areas to focus on
          </CardDescription>
        </CardHeader>
        
        {expandedSection === 'notes' && (
          <CardContent className="pt-0">
            <textarea
              value={config.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g., Focus on chapter 3, emphasize key concepts, include practical examples..."
              className="w-full p-3 border rounded-lg bg-background text-sm min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Help the AI understand what you want to focus on
              </p>
              <p className="text-xs text-muted-foreground">
                {config.notes?.length || 0}/500
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuration Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">Quiz Configuration</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions:</span>
              <span className="font-medium">{config.questionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium capitalize">{config.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Types:</span>
              <span className="font-medium">
                {config.questionTypes?.map(type => 
                  type === 'mcq' ? 'MCQ' : 
                  type === 'truefalse' ? 'T/F' : 
                  'Fill'
                ).join(', ') || 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Documents:</span>
              <span className="font-medium">{selectedDocuments.length}</span>
            </div>
            {config.notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Focus areas:</span>
                <span className="font-medium">Added</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Estimated Time</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ~{Math.ceil(config.questionCount * 1.5)} minutes to complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}