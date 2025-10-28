"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  NotebookPen,
  Brain,
  CreditCard,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Upload,
  BookOpen,
  Target,
  Zap,
  Award,
  Activity,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for dashboard
const recentActivity = [
  {
    id: 1,
    type: "pdf",
    title: "Advanced Calculus Notes",
    action: "uploaded",
    time: "2 hours ago",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    type: "note",
    title: "Machine Learning Concepts",
    action: "created",
    time: "4 hours ago",
    icon: NotebookPen,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 3,
    type: "quiz",
    title: "React Hooks Quiz",
    action: "completed",
    time: "1 day ago",
    icon: Brain,
    color: "text-orange-600 dark:text-orange-400",
  },
];

const quickStats = [
  {
    title: "Total Files",
    value: "24",
    change: "+3 this week",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500",
  },
  {
    title: "Notes Created",
    value: "18",
    change: "+5 this week",
    icon: NotebookPen,
    gradient: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500",
  },
  {
    title: "Quizzes Taken",
    value: "12",
    change: "+2 this week",
    icon: Brain,
    gradient: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-500",
  },
  {
    title: "Study Streak",
    value: "7 days",
    change: "Keep it up!",
    icon: Award,
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    borderColor: "border-green-200 dark:border-green-800",
    iconBg: "bg-green-500",
  },
];

const quickActions = [
  {
    title: "Upload PDF",
    description: "Add new documents to annotate",
    icon: Upload,
    href: "/dashboard/pdfs",
    gradient: "from-blue-500 to-blue-600",
    hoverGradient: "hover:from-blue-600 hover:to-blue-700",
  },
  {
    title: "Create Note",
    description: "Start writing your thoughts",
    icon: Plus,
    href: "/dashboard/notes/new",
    gradient: "from-purple-500 to-purple-600",
    hoverGradient: "hover:from-purple-600 hover:to-purple-700",
  },
  {
    title: "Take Quiz",
    description: "Test your knowledge",
    icon: Brain,
    href: "/dashboard/quizzes",
    gradient: "from-orange-500 to-orange-600",
    hoverGradient: "hover:from-orange-600 hover:to-orange-700",
  },
  {
    title: "Study Flashcards",
    description: "Review with spaced repetition",
    icon: CreditCard,
    href: "/dashboard/flashcards",
    gradient: "from-pink-500 to-rose-600",
    hoverGradient: "hover:from-pink-600 hover:to-rose-700",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-full">
          <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Welcome to Noto
          </span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Your Learning Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your PDFs, create notes, and test your knowledge all in one place.
          Your personalized learning experience starts here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                stat.bgColor,
                stat.borderColor
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-full", stat.iconBg)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-border"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                      action.gradient
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                      Get started
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg bg-background", activity.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => router.push("/dashboard/activity")}
            >
              View all activity
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Learning Progress
            </CardTitle>
            <CardDescription>
              Your study progress this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly Goal</span>
                  <span className="font-medium text-foreground">7/10 hours</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: "70%" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">85%</p>
                  <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Notes Created</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard/analytics")}
            >
              View detailed analytics
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}