"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MobileQuizGeneratorInterface, 
  MobileQuizPlayer, 
  MobileQuizConfigurationPanel 
} from "@/components/quiz";
import { useMobile, useIsMobile, useHasTouch } from "@/hooks/use-mobile";
import { Quiz, QuizQuestion, QuizConfiguration } from "@/lib/types";
import { QuizResults } from "@/lib/services/quiz-scoring-service";
import { 
  Smartphone, 
  Monitor, 
  TouchpadIcon as Touch, 
  Gamepad2,
  ArrowLeft,
  Play,
  Settings
} from "lucide-react";

export default function MobileQuizTestPage() {
  const [currentView, setCurrentView] = useState<'overview' | 'generator' | 'player' | 'config'>('overview');
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    questionCount: 10,
    difficulty: "medium",
    questionTypes: ["mcq", "truefalse"],
  });

  const mobile = useMobile();
  const isMobile = useIsMobile();
  const hasTouch = useHasTouch();

  // Mock quiz data for testing
  const mockQuiz: Quiz = {
    id: "test-quiz-1",
    userId: "test-user",
    title: "Mobile Quiz Test - Sample Questions",
    sourceDocumentIds: ["doc1", "doc2"],
    questionCount: 5,
    difficulty: "medium",
    questionTypes: ["mcq", "truefalse"],
    generationMethod: "rag",
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockQuestions: QuizQuestion[] = [
    {
      id: "q1",
      quizId: "test-quiz-1",
      questionText: "What is the primary benefit of using mobile-responsive design in quiz interfaces?",
      questionType: "mcq",
      options: [
        "Better performance on desktop computers",
        "Improved user experience across all device sizes",
        "Reduced development time",
        "Lower hosting costs"
      ],
      correctAnswer: "Improved user experience across all device sizes",
      explanation: "Mobile-responsive design ensures that the quiz interface adapts to different screen sizes and input methods, providing an optimal experience whether users are on phones, tablets, or desktops.",
      difficulty: "medium",
      orderIndex: 0,
      sourceChunks: [],
      sourcePages: [1, 2],
      createdAt: new Date().toISOString(),
    },
    {
      id: "q2",
      quizId: "test-quiz-1",
      questionText: "Touch gestures like swipe navigation enhance mobile quiz experiences.",
      questionType: "truefalse",
      correctAnswer: "True",
      explanation: "Touch gestures provide intuitive navigation methods that are natural for mobile users, making the quiz experience more engaging and efficient.",
      difficulty: "easy",
      orderIndex: 1,
      sourceChunks: [],
      sourcePages: [3],
      createdAt: new Date().toISOString(),
    },
    {
      id: "q3",
      quizId: "test-quiz-1",
      questionText: "Which mobile design pattern is most important for quiz interfaces?",
      questionType: "mcq",
      options: [
        "Complex multi-column layouts",
        "Small touch targets for precision",
        "Large, touch-friendly buttons and clear navigation",
        "Dense information display"
      ],
      correctAnswer: "Large, touch-friendly buttons and clear navigation",
      explanation: "Mobile interfaces require larger touch targets (minimum 44px) and clear navigation to accommodate finger-based interaction and smaller screens.",
      difficulty: "medium",
      orderIndex: 2,
      sourceChunks: [],
      sourcePages: [4, 5],
      createdAt: new Date().toISOString(),
    },
    {
      id: "q4",
      quizId: "test-quiz-1",
      questionText: "Haptic feedback improves mobile quiz interactions.",
      questionType: "truefalse",
      correctAnswer: "True",
      explanation: "Haptic feedback provides tactile confirmation of user actions, making interactions feel more responsive and helping users understand when they've successfully selected an answer.",
      difficulty: "easy",
      orderIndex: 3,
      sourceChunks: [],
      sourcePages: [6],
      createdAt: new Date().toISOString(),
    },
    {
      id: "q5",
      quizId: "test-quiz-1",
      questionText: "What is the recommended minimum size for touch targets on mobile devices?",
      questionType: "mcq",
      options: [
        "24px x 24px",
        "32px x 32px", 
        "44px x 44px",
        "56px x 56px"
      ],
      correctAnswer: "44px x 44px",
      explanation: "Apple's Human Interface Guidelines and Google's Material Design both recommend a minimum touch target size of 44px x 44px to ensure comfortable and accurate touch interactions.",
      difficulty: "hard",
      orderIndex: 4,
      sourceChunks: [],
      sourcePages: [7, 8],
      createdAt: new Date().toISOString(),
    },
  ];

  const handleQuizComplete = async (results: QuizResults) => {
    console.log('Quiz completed with results:', results);
    alert(`Quiz completed! Score: ${results.totalScore}%`);
    setCurrentView('overview');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
  };

  if (currentView === 'generator') {
    return (
      <div className="min-h-screen">
        <div className="p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" onClick={handleBackToOverview} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Overview
          </Button>
          <h1 className="text-xl font-bold">Mobile Quiz Generator Test</h1>
        </div>
        <MobileQuizGeneratorInterface />
      </div>
    );
  }

  if (currentView === 'player') {
    return (
      <div className="min-h-screen">
        <MobileQuizPlayer
          quiz={mockQuiz}
          questions={mockQuestions}
          onComplete={handleQuizComplete}
          onExit={handleBackToOverview}
        />
      </div>
    );
  }

  if (currentView === 'config') {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 border-b bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" onClick={handleBackToOverview} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test Overview
          </Button>
          <h1 className="text-xl font-bold">Mobile Configuration Panel Test</h1>
        </div>
        <div className="p-4">
          <MobileQuizConfigurationPanel
            config={quizConfig}
            onChange={setQuizConfig}
            selectedDocuments={["doc1", "doc2"]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Mobile Quiz Interface Test</h1>
        <p className="text-muted-foreground">
          Test the mobile-responsive quiz components with touch gestures and optimized layouts.
        </p>
      </div>

      {/* Device Detection Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isMobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            Device Detection
          </CardTitle>
          <CardDescription>
            Current device characteristics and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mobile.isMobile ? "📱" : "💻"}
              </div>
              <div className="text-sm font-medium">
                {mobile.isMobile ? "Mobile" : "Desktop"}
              </div>
              <div className="text-xs text-muted-foreground">
                {mobile.screenSize}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {hasTouch ? "👆" : "🖱️"}
              </div>
              <div className="text-sm font-medium">
                {hasTouch ? "Touch" : "Mouse"}
              </div>
              <div className="text-xs text-muted-foreground">
                Input method
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mobile.orientation === 'portrait' ? "📱" : "📱"}
              </div>
              <div className="text-sm font-medium capitalize">
                {mobile.orientation}
              </div>
              <div className="text-xs text-muted-foreground">
                Orientation
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {window.innerWidth}×{window.innerHeight}
              </div>
              <div className="text-sm font-medium">
                Screen Size
              </div>
              <div className="text-xs text-muted-foreground">
                Pixels
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Components */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mobile Quiz Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quiz Generator
            </CardTitle>
            <CardDescription>
              Mobile-optimized quiz creation interface with touch-friendly controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tabbed navigation for mobile screens</li>
                <li>• Touch-friendly document selection</li>
                <li>• Swipe gestures for navigation</li>
                <li>• Collapsible sections</li>
                <li>• Fixed bottom action bar</li>
              </ul>
            </div>
            <Button 
              onClick={() => setCurrentView('generator')} 
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Test Generator
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Quiz Player */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quiz Player
            </CardTitle>
            <CardDescription>
              Mobile-optimized quiz taking experience with swipe navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Swipe left/right for navigation</li>
                <li>• Large touch targets for answers</li>
                <li>• Question overview modal</li>
                <li>• Haptic feedback</li>
                <li>• Auto-save progress</li>
              </ul>
            </div>
            <Button 
              onClick={() => setCurrentView('player')} 
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Player ({mockQuestions.length} questions)
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Touch className="h-5 w-5" />
              Configuration Panel
            </CardTitle>
            <CardDescription>
              Touch-optimized settings with expandable sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Expandable configuration sections</li>
                <li>• Large touch-friendly buttons</li>
                <li>• Visual feedback for selections</li>
                <li>• Configuration summary</li>
                <li>• Estimated completion time</li>
              </ul>
            </div>
            <Button 
              onClick={() => setCurrentView('config')} 
              className="w-full"
            >
              <Touch className="h-4 w-4 mr-2" />
              Test Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Touch Gestures Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Touch Gestures
            </CardTitle>
            <CardDescription>
              Supported gestures and interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Swipe Left</Badge>
                <span className="text-sm">Next question</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Swipe Right</Badge>
                <span className="text-sm">Previous question</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Swipe Up</Badge>
                <span className="text-sm">Show settings</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Tap</Badge>
                <span className="text-sm">Select answer</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Long Press</Badge>
                <span className="text-sm">Show options</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">For Mobile Testing:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>1. Open this page on a mobile device or use browser dev tools</li>
              <li>2. Test touch interactions and swipe gestures</li>
              <li>3. Verify haptic feedback works (if supported)</li>
              <li>4. Check responsive layout at different screen sizes</li>
              <li>5. Test both portrait and landscape orientations</li>
            </ul>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">For Desktop Testing:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>1. Resize browser window to mobile sizes</li>
              <li>2. Use browser dev tools device emulation</li>
              <li>3. Test keyboard navigation as fallback</li>
              <li>4. Verify responsive breakpoints work correctly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}