"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  BookOpen,
  Clock,
  Target,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: Question[];
}

const categories = ["Mathematics", "Programming", "History", "Chemistry", "Computer Science", "Language"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function CreateQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizForm>({
    title: "",
    description: "",
    category: "Mathematics",
    difficulty: "Medium",
    duration: 30,
    questions: []
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuestion = (questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving quiz:", quiz);
    router.push("/dashboard/quizzes");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Create New Quiz</h1>
                <p className="text-sm text-muted-foreground">Build an interactive quiz for your studies</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!quiz.title || quiz.questions.length === 0}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Quiz Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Quiz Settings
            </CardTitle>
            <CardDescription>
              Configure the basic settings for your quiz
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Title</label>
                <input
                  type="text"
                  placeholder="Enter quiz title..."
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={quiz.category}
                  onChange={(e) => setQuiz(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                placeholder="Describe what this quiz covers..."
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <div className="flex gap-2">
                  {difficulties.map(diff => (
                    <Button
                      key={diff}
                      variant={quiz.difficulty === diff ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQuiz(prev => ({ ...prev, difficulty: diff }))}
                      className={cn(
                        quiz.difficulty === diff && getDifficultyColor(diff)
                      )}
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={quiz.duration}
                  onChange={(e) => setQuiz(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Questions ({quiz.questions.length})
                </CardTitle>
                <CardDescription>
                  Add questions and multiple choice answers
                </CardDescription>
              </div>
              <Button onClick={addQuestion} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {quiz.questions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No questions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your quiz by adding your first question.
                </p>
                <Button onClick={addQuestion} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            ) : (
              quiz.questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question</label>
                      <textarea
                        placeholder="Enter your question..."
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Answer Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0",
                              question.correctAnswer === optionIndex
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-muted-foreground hover:border-green-500"
                            )}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                          </button>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option}
                            onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Click the letter to mark the correct answer
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Explanation (Optional)</label>
                      <textarea
                        placeholder="Explain why this is the correct answer..."
                        value={question.explanation}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        {quiz.title && quiz.questions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quiz Preview
              </CardTitle>
              <CardDescription>
                Here's how your quiz will appear to students
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="p-6 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{quiz.title}</h3>
                    <p className="text-muted-foreground">{quiz.description}</p>
                  </div>
                  <Badge className={cn("border", getDifficultyColor(quiz.difficulty))}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <div className="font-semibold">{quiz.questions.length}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <div className="font-semibold">{quiz.duration} min</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <div className="font-semibold">{quiz.category}</div>
                    <div className="text-sm text-muted-foreground">Category</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}