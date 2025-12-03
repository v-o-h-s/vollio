"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";

interface PremiumUpgradeProps {
  feature: string;
  description: string;
  onUpgrade?: () => void;
}

export function PremiumUpgrade({ feature, description, onUpgrade }: PremiumUpgradeProps) {
  const premiumFeatures = [
    "AI-powered flashcard generation",
    "Advanced analytics and insights",
    "Unlimited document storage",
    "Priority customer support",
    "Export to multiple formats",
    "Collaborative workspaces",
  ];

  return (
    <Card className="border-2 border-dashed border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <Crown className="w-12 h-12 text-amber-500" />
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
            Premium Feature
          </span>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          {feature} is available with Noto Premium
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        </div>

        {/* Premium Features List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            What you get with Premium:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Button */}
        <div className="space-y-3">
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium hover:scale-105 transition-all duration-200"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Start your free trial • Cancel anytime • No commitment
          </p>
        </div>

        {/* Pricing Info */}
        <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-bold text-foreground">$9.99</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            or $99/year (save 17%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}