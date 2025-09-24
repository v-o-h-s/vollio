"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatShortcut } from "@/hooks/use-keyboard-shortcuts";
import { QUIZ_SHORTCUTS, type QuizKeyboardShortcut } from "@/hooks/use-quiz-keyboard-shortcuts";
import { 
  Keyboard, 
  Navigation, 
  MousePointer, 
  Zap, 
  HelpCircle,
  X
} from "lucide-react";

interface QuizKeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentQuestionType?: 'mcq' | 'truefalse' | 'fillblank';
  isCompleted?: boolean;
}

export function QuizKeyboardShortcutsDialog({ 
  open, 
  onOpenChange,
  currentQuestionType,
  isCompleted = false
}: QuizKeyboardShortcutsDialogProps) {
  
  // Group shortcuts by category
  const groupedShortcuts = QUIZ_SHORTCUTS.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = [];
    }
    groups[shortcut.category].push(shortcut);
    return groups;
  }, {} as Record<string, QuizKeyboardShortcut[]>);

  // Filter shortcuts based on current context
  const getRelevantShortcuts = (shortcuts: QuizKeyboardShortcut[]) => {
    return shortcuts.filter(shortcut => {
      // Show answer selection shortcuts only for MCQ and True/False
      if (shortcut.category === 'answers') {
        if (currentQuestionType === 'fillblank') return false;
        
        // Show True/False shortcuts only for True/False questions
        if ((shortcut.key === 't' || shortcut.key === 'f') && currentQuestionType !== 'truefalse') {
          return false;
        }
        
        // Show number/letter shortcuts only for MCQ
        if (['1', '2', '3', '4', 'a', 'b', 'c', 'd'].includes(shortcut.key) && currentQuestionType !== 'mcq') {
          return false;
        }
      }
      
      // Show result-specific shortcuts only when completed
      if (shortcut.description.includes('(on results)') && !isCompleted) {
        return false;
      }
      
      // Show quiz submission shortcuts only when not completed
      if (shortcut.description.includes('Submit quiz') && isCompleted) {
        return false;
      }
      
      return true;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return <Navigation className="h-4 w-4" />;
      case 'answers':
        return <MousePointer className="h-4 w-4" />;
      case 'actions':
        return <Zap className="h-4 w-4" />;
      case 'help':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Keyboard className="h-4 w-4" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Navigation';
      case 'answers':
        return 'Answer Selection';
      case 'actions':
        return 'Actions';
      case 'help':
        return 'Help & Accessibility';
      default:
        return category;
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'Move between questions and navigate the quiz';
      case 'answers':
        return 'Select answers using keyboard shortcuts';
      case 'actions':
        return 'Perform quiz actions like submit or exit';
      case 'help':
        return 'Access help and accessibility features';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Quiz Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Use these keyboard shortcuts to navigate and interact with the quiz more efficiently.
            {currentQuestionType && (
              <span className="block mt-1">
                Currently showing shortcuts for{' '}
                <Badge variant="outline" className="ml-1">
                  {currentQuestionType === 'mcq' ? 'Multiple Choice' : 
                   currentQuestionType === 'truefalse' ? 'True/False' : 
                   'Fill in the Blank'}
                </Badge>
                {' '}questions.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => {
            const relevantShortcuts = getRelevantShortcuts(shortcuts);
            
            if (relevantShortcuts.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <h3 className="text-lg font-semibold">
                    {getCategoryTitle(category)}
                  </h3>
                </div>
                
                {getCategoryDescription(category) && (
                  <p className="text-sm text-muted-foreground">
                    {getCategoryDescription(category)}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {relevantShortcuts.map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono shadow-sm">
                        {formatShortcut(shortcut.key)}
                      </kbd>
                    </div>
                  ))}
                </div>

                <Separator />
              </div>
            );
          })}

          {/* Additional Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Tips</h3>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> to navigate between interactive elements</p>
              <p>• Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to activate buttons and select options</p>
              <p>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> to close dialogs and exit modes</p>
              {currentQuestionType === 'fillblank' && (
                <p>• For fill-in-the-blank questions, type your answer directly in the input field</p>
              )}
              <p>• Screen reader users: All quiz content is announced automatically</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}