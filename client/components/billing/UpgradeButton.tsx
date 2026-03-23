"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { toast } from "react-toastify";

interface UpgradeButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  onClick?: () => void;
}

export function UpgradeButton({
  className,
  variant = "default",
  size = "default",
  children,
  onClick,
}: UpgradeButtonProps) {
  const handleUpgrade = () => {
    if (onClick) {
      onClick();
      return;
    }

    toast.info("Upgrade flow is not configured yet.");
  };

  return (
    <Button
      onClick={handleUpgrade}
      className={className}
      variant={variant}
      size={size}
    >
      {children || (
        <>
          Upgrade to Pro
          <Zap className="ml-2 w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
        </>
      )}
    </Button>
  );
}
