"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { PremiumUpgrade } from "@/components/ui/premium-upgrade";
import {
  Crown,
  Sparkles,
  Zap,
  BarChart3,
  Cloud,
  Headphones,
  FileText,
  Brain,
  AlertCircle,
} from "lucide-react";

export default function PremiumDemoPage() {
  const { isPremium, features, togglePremium } = useSubscription();

  const premiumFeatures = [
    {
      id: "ai-generation",
      name: "AI Generation",
      description: "Generate flashcards and quizzes automatically using AI",
      icon: Brain,
      enabled: features.aiGeneration,
    },
    {
      id: "advanced-analytics",
      name: "Advanced Analytics",
      description: "Detailed insights and performance tracking",
      icon: BarChart3,
      enabled: features.advancedAnalytics,
    },
    {
      id: "unlimited-storage",
      name: "Unlimited Storage",
      description: "Store unlimited documents and notes",
      icon: Cloud,
      enabled: features.unlimitedStorage,
    },
    {
      id: "priority-support",
      name: "Priority Support",
      description: "Get help faster with priority customer support",
      icon: Headphones,
      enabled: features.prioritySupport,
    },
  ];

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold">Premium Features Demo</h1>
            <PremiumBadge variant="crown" size="lg" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This demo shows how premium features are gated and displayed to users.
            Use the toggle in the top-right corner to switch between free and premium modes.
          </p>
        </div>

        {/* Current Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  You are currently using: {isPremium ? "Premium" : "Free"} plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPremium
                    ? "You have access to all premium features"
                    : "Upgrade to unlock premium features"}
                </p>
              </div>
              <Button
                onClick={togglePremium}
                variant={isPremium ? "default" : "outline"}
                className={
                  isPremium
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    : ""
                }
              >
                {isPremium ? "Switch to Free" : "Switch to Premium"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premiumFeatures.map((feature) => {
            const Icon = feature.icon;
            
            if (!feature.enabled) {
              return (
                <div key={feature.id}>
                  <PremiumUpgrade
                    feature={feature.name}
                    description={feature.description}
                    onUpgrade={() => {
                      console.log(`Upgrade clicked for ${feature.name}`);
                    }}
                  />
                </div>
              );
            }

            return (
              <Card key={feature.id} className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-green-600" />
                    {feature.name}
                    <PremiumBadge variant="star" size="sm" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="flex items-center gap-2 text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Feature Available</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Flashcard Generator Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              AI Flashcard Generator Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This shows how the AI flashcard generator appears based on your subscription status.
            </p>
            
            {!features.aiGeneration ? (
              <PremiumUpgrade
                feature="AI Flashcard Generation"
                description="Automatically generate high-quality flashcards from your documents or any topic using advanced AI."
                onUpgrade={() => {
                  console.log("Upgrade to premium for AI features");
                }}
              />
            ) : (
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">AI Generation Available</span>
                  <PremiumBadge variant="zap" size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You can now generate flashcards automatically using AI from your documents or any topic.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="w-5 h-5" />
              How to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Use the premium toggle button in the top-right corner to switch between free and premium modes</li>
              <li>Notice how the feature cards change based on your subscription status</li>
              <li>Try navigating to the flashcard creation page to see the AI generator in action</li>
              <li>The premium status is saved in localStorage and persists across page reloads</li>
              <li>In production, this would be connected to your actual subscription system</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}