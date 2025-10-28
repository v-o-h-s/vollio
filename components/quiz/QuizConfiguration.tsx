"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Target, 
  Clock, 
  Users, 
  Crown,
  CheckCircle,
  Plus,
  Minus,
  Info,
  Zap,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionType {
  type: 'mcq' | 'true-false' | 'fill-blank' | 'short-answer';
  enabled: boolean;
  weight: number;
}

interface QuizConfigurationProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  questionTypes: QuestionType[];
  onQuestionTypesChange: (types: QuestionType[]) => void;
  difficulty: 'general' | 'detailed' | 'custom';
  onDifficultyChange: (difficulty: 'general' | 'detailed' | 'custom') => void;
  timeLimit?: number;
  onTimeLimitChange: (limit?: number) => void;
  isPremium?: boolean;
  className?: string;
}

const questionTypeOptions = [
  {
    type: 'mcq' as const,
    label: 'Multiple Choice (MCQ)',
    description: '1 correct answer + 3 distractors',
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    type: 'true-false' as const,
    label: 'True/False',
    description: 'Binary choice questions',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    type: 'fill-blank' as const,
    label: 'Fill-in-the-Blank',
    description: 'Complete the missing words',
    icon: Zap,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    type: 'short-answer' as const,
    label: 'Short Answer',
    description: 'Brief written responses',
    icon: BookOpen,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10'
  }
];

const difficultyOptions = [
  {
    value: 'general' as const,
    label: 'General',
    description: 'Big-picture focus, conceptual understanding',
    icon: Users,
    color: 'text-green-600 dark:text-green-400'
  },
  {
    value: 'detailed' as const,
    label: 'Detailed',
    description: 'Fact-level, exam-style questions',
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    value: 'custom' as const,
    label: 'Custom Exam-Style',
    description: 'Provide a sample quiz for AI to match',
    icon: Crown,
    color: 'text-purple-600 dark:text-purple-400',
    premium: true
  }
];

export function QuizConfiguration({
  questionCount,
  onQuestionCountChange,
  questionTypes,
  onQuestionTypesChange,
  difficulty,
  onDifficultyChange,
  timeLimit,
  onTimeLimitChange,
  isPremium = false,
  className
}: QuizConfigurationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQuestionTypeToggle = (type: QuestionType['type']) => {
    const updatedTypes = questionTypes.map(qt =>
      qt.type === type ? { ...qt, enabled: !qt.enabled } : qt
    );
    onQuestionTypesChange(updatedTypes);
  };

  const handleQuestionTypeWeight = (type: QuestionType['type'], weight: number) => {
    const updatedTypes = questionTypes.map(qt =>
      qt.type === type ? { ...qt, weight: Math.max(0, Math.min(100, weight)) } : qt
    );
    onQuestionTypesChange(updatedTypes);
  };

  const totalWeight = questionTypes.reduce((sum, qt) => qt.enabled ? sum + qt.weight : sum, 0);
  const maxQuestions = isPremium ? 50 : 20;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Question Count */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Number of Questions
            {!isPremium && (
              <Badge variant="outline" className="text-xs">
                Free Plan
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuestionCountChange(Math.max(1, questionCount - 1))}
                disabled={questionCount <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{questionCount}</div>
                <div className="text-sm text-muted-foreground">questions</div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuestionCountChange(Math.min(maxQuestions, questionCount + 1))}
                disabled={questionCount >= maxQuestions}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>1</span>
                <span>{maxQuestions}</span>
              </div>
              <Slider
                value={[questionCount]}
                onValueChange={([value]) => onQuestionCountChange(value)}
                max={maxQuestions}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {!isPremium && (
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Free plan: Up to 20 questions. 
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Upgrade for more
                  </Button>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle>Question Types</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select question types and their distribution
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionTypeOptions.map((option) => {
            const questionType = questionTypes.find(qt => qt.type === option.type);
            const Icon = option.icon;
            
            return (
              <div key={option.type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", option.bgColor)}>
                      <Icon className={cn("w-5 h-5", option.color)} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={questionType?.enabled || false}
                      onChange={() => handleQuestionTypeToggle(option.type)}
                      className="rounded"
                    />
                  </div>
                </div>
                
                {questionType?.enabled && (
                  <div className="ml-12 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Weight:</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={questionType.weight}
                        onChange={(e) => handleQuestionTypeWeight(option.type, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn("h-2 rounded-full transition-all duration-300", option.bgColor)}
                        style={{ width: `${(questionType.weight / Math.max(totalWeight, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {totalWeight !== 100 && questionTypes.some(qt => qt.enabled) && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Total weight: {totalWeight}%. Weights will be normalized automatically.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Level */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {difficultyOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = difficulty === option.value;
            const isDisabled = option.premium && !isPremium;
            
            return (
              <div
                key={option.value}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                  isSelected ? "border-primary bg-primary/5" : "border-border",
                  isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"
                )}
                onClick={() => !isDisabled && onDifficultyChange(option.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-5 h-5", option.color)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{option.label}</h4>
                        {option.premium && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Settings
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAdvanced && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="time-limit" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Limit (minutes)
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="time-limit"
                  type="number"
                  min="5"
                  max="180"
                  value={timeLimit || ''}
                  onChange={(e) => onTimeLimitChange(parseInt(e.target.value) || undefined)}
                  className="w-32"
                  placeholder="No limit"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTimeLimitChange(undefined)}
                >
                  Clear
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty for no time limit
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Duration</Label>
                <p className="text-sm text-muted-foreground">
                  ~{Math.ceil(questionCount * 1.5)} minutes
                </p>
              </div>
              <div>
                <Label>Question Distribution</Label>
                <div className="space-y-1">
                  {questionTypes
                    .filter(qt => qt.enabled)
                    .map(qt => {
                      const option = questionTypeOptions.find(opt => opt.type === qt.type);
                      const count = Math.round((qt.weight / Math.max(totalWeight, 1)) * questionCount);
                      return (
                        <p key={qt.type} className="text-sm text-muted-foreground">
                          {option?.label}: {count}
                        </p>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}