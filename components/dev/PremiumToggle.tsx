"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, User } from "lucide-react";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";

export function PremiumToggle() {
  const { isPremium, togglePremium } = useSubscription();

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={togglePremium}
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${
          isPremium
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 hover:from-amber-600 hover:to-orange-600"
            : "bg-background text-foreground hover:bg-muted"
        }`}
      >
        {isPremium ? (
          <>
            <Crown className="w-4 h-4" />
            <span>Premium User</span>
            <Badge className="bg-white/20 text-white">Pro</Badge>
          </>
        ) : (
          <>
            <User className="w-4 h-4" />
            <span>Free User</span>
            <Badge variant="secondary">Free</Badge>
          </>
        )}
      </Button>
    </div>
  );
}