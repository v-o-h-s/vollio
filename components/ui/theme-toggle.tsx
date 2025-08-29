"use client";

import React, { forwardRef } from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/types/theme";

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "switch";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * Theme toggle component with multiple variants and accessibility support
 *
 * Features:
 * - Multiple variants: button (cycles themes), dropdown (select specific), switch (light/dark only)
 * - Size options: sm, md, lg
 * - Smooth icon transitions
 * - Full accessibility support with ARIA labels and keyboard navigation
 * - Screen reader announcements for theme changes
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ variant = "button", size = "md", showLabel = false, className }, ref) => {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

    // Size classes for different variants
    const sizeClasses = {
      sm: {
        button: "h-8 w-8",
        icon: "h-3 w-3",
        text: "text-xs",
      },
      md: {
        button: "h-9 w-9",
        icon: "h-4 w-4",
        text: "text-sm",
      },
      lg: {
        button: "h-10 w-10",
        icon: "h-5 w-5",
        text: "text-base",
      },
    };

    const currentSize = sizeClasses[size];

    // Get current theme icon with smooth transitions
    const getThemeIcon = () => {
      const iconClass = cn(
        currentSize.icon,
        "transition-all duration-300 ease-in-out"
      );

      switch (theme) {
        case "light":
          return <Sun className={cn(iconClass, "rotate-0 scale-100")} />;
        case "dark":
          return <Moon className={cn(iconClass, "rotate-0 scale-100")} />;
        case "system":
          return <Monitor className={cn(iconClass, "rotate-0 scale-100")} />;
        default:
          return <Sun className={cn(iconClass, "rotate-0 scale-100")} />;
      }
    };

    // Get theme label for accessibility
    const getThemeLabel = (themeMode: ThemeMode) => {
      switch (themeMode) {
        case "light":
          return "Light mode";
        case "dark":
          return "Dark mode";
        case "system":
          return "System preference";
        default:
          return "Light mode";
      }
    };

    // Announce theme changes to screen readers
    const announceThemeChange = (newTheme: ThemeMode) => {
      const announcement = `Theme changed to ${getThemeLabel(newTheme)}`;

      // Create temporary element for screen reader announcement
      const ariaLive = document.createElement("div");
      ariaLive.setAttribute("aria-live", "polite");
      ariaLive.setAttribute("aria-atomic", "true");
      ariaLive.textContent = announcement;
      ariaLive.style.position = "absolute";
      ariaLive.style.left = "-10000px";
      ariaLive.style.width = "1px";
      ariaLive.style.height = "1px";
      ariaLive.style.overflow = "hidden";

      document.body.appendChild(ariaLive);

      // Clean up after announcement
      setTimeout(() => {
        if (document.body.contains(ariaLive)) {
          document.body.removeChild(ariaLive);
        }
      }, 1000);
    };

    // Handle theme change with announcement
    const handleThemeChange = (newTheme: ThemeMode) => {
      setTheme(newTheme);
      announceThemeChange(newTheme);
    };

    // Handle toggle with announcement
    const handleToggle = () => {
      const currentTheme = theme;
      toggleTheme();

      // Determine next theme for announcement
      let nextTheme: ThemeMode;
      switch (currentTheme) {
        case "light":
          nextTheme = "dark";
          break;
        case "dark":
          nextTheme = "system";
          break;
        case "system":
          nextTheme = "light";
          break;
        default:
          nextTheme = "light";
      }

      // Delay announcement to ensure state has updated
      setTimeout(() => announceThemeChange(nextTheme), 50);
    };

    // Button variant - cycles through themes
    if (variant === "button") {
      return (
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={cn(
            currentSize.button,
            "relative overflow-hidden transition-colors duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label={`Current theme: ${getThemeLabel(
            theme
          )}. Click to cycle to next theme.`}
          title={`Current: ${getThemeLabel(theme)} (resolved: ${getThemeLabel(
            resolvedTheme as ThemeMode
          )})`}
        >
          <div className="relative flex items-center justify-center">
            {getThemeIcon()}
          </div>
          {showLabel && (
            <span className={cn("ml-2", currentSize.text)}>
              {getThemeLabel(theme)}
            </span>
          )}
        </Button>
      );
    }

    // Switch variant - toggles between light and dark only
    if (variant === "switch") {
      const isLight = resolvedTheme === "light";

      return (
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          onClick={() => handleThemeChange(isLight ? "dark" : "light")}
          className={cn(
            currentSize.button,
            "relative overflow-hidden transition-colors duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          aria-label={`Switch to ${
            isLight ? "dark" : "light"
          } mode. Currently using ${getThemeLabel(
            resolvedTheme as ThemeMode
          )}.`}
          title={`Switch to ${isLight ? "dark" : "light"} mode`}
        >
          <div className="relative flex items-center justify-center">
            <Sun
              className={cn(
                currentSize.icon,
                "absolute transition-all duration-500 ease-in-out",
                isLight
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0"
              )}
            />
            <Moon
              className={cn(
                currentSize.icon,
                "absolute transition-all duration-500 ease-in-out",
                !isLight
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              )}
            />
          </div>
          {showLabel && (
            <span className={cn("ml-2", currentSize.text)}>
              {isLight ? "Light" : "Dark"}
            </span>
          )}
        </Button>
      );
    }

    // Dropdown variant - allows selecting specific theme
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn(
              currentSize.button,
              "transition-colors duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className
            )}
            aria-label={`Theme menu. Current theme: ${getThemeLabel(theme)}`}
            title={`Current: ${getThemeLabel(theme)}`}
          >
            {getThemeIcon()}
            {showLabel && (
              <span className={cn("ml-2", currentSize.text)}>
                {getThemeLabel(theme)}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[160px]"
          aria-label="Theme selection menu"
        >
          <DropdownMenuItem
            onClick={() => handleThemeChange("light")}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
            aria-label="Switch to light mode"
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme === "light" && (
              <Check className="ml-auto h-4 w-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("dark")}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
            aria-label="Switch to dark mode"
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme === "dark" && (
              <Check className="ml-auto h-4 w-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("system")}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
            aria-label="Use system preference"
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme === "system" && (
              <Check className="ml-auto h-4 w-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

ThemeToggle.displayName = "ThemeToggle";
