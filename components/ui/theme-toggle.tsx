"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "switch";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = "dropdown",
  size = "md",
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        className={cn(
          !showLabel && sizeClasses[size],
          showLabel && "px-3",
          className
        )}
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {showLabel && (
          <span className="ml-2 text-sm">
            {theme === "light" ? "Dark" : "Light"}
          </span>
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "switch") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {showLabel && (
          <span className="text-sm font-medium">
            {theme === "light" ? "Light" : "Dark"}
          </span>
        )}
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          className={cn(
            sizeClasses[size],
            theme === "dark" && "bg-primary text-primary-foreground"
          )}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
          className={cn(
            !showLabel && sizeClasses[size],
            showLabel && "px-3",
            className
          )}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {showLabel && (
            <span className="ml-2 text-sm capitalize">{theme}</span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
