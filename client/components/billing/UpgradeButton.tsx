"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { usePaddle } from "@/components/providers/PaddleProvider";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";

interface UpgradeButtonProps {
  className?: string;
  priceId?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function UpgradeButton({
  className,
  priceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID,
  variant = "default",
  size = "default",
  children,
}: UpgradeButtonProps) {
  const { paddle, isLoaded } = usePaddle();
  const [isOpening, setIsOpening] = useState(false);
  const supabase = createClient();

  const handleUpgrade = async () => {
    if (!isLoaded || !paddle) {
      toast.error("Paddle is still loading. Please try again in a moment.");
      return;
    }

    setIsOpening(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("You must be logged in to upgrade.");
        return;
      }

      const userId = session.user.id;

      paddle.Checkout.open({
        items: [
          {
            priceId: priceId,
            quantity: 1,
          },
        ],
        customData: {
          userId: userId,
        },
        customer: {
          email: session.user.email,
        },
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast.error("Failed to open checkout. Please try again.");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isOpening || !isLoaded}
      className={className}
      variant={variant}
      size={size}
    >
      {isOpening ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        children || (
          <>
            Upgrade to Pro
            <Zap className="ml-2 w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
          </>
        )
      )}
    </Button>
  );
}
