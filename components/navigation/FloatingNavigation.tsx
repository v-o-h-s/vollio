"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  Home,
  FileText,
  NotebookPen,
  Brain,
  CreditCard,
  FileBarChart,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics",
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    name: "Files",
    href: "/dashboard/pdfs",
    icon: FileText,
    description: "View and manage PDFs",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
    description: "Create and manage notes",
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
  },
  {
    name: "Summarize",
    href: "/dashboard/summarize",
    icon: FileBarChart,
    description: "AI-powered document summaries",
    gradient: "from-indigo-500 to-purple-500",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
  },
  {
    name: "Quizzes",
    href: "/dashboard/quizzes",
    icon: Brain,
    description: "Interactive knowledge tests",
    gradient: "from-orange-500 to-red-500",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
  },
  {
    name: "Flashcards",
    href: "/dashboard/flashcards",
    icon: CreditCard,
    description: "Study with spaced repetition",
    gradient: "from-pink-500 to-rose-500",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
  },
];

interface FloatingNavigationProps {
  className?: string;
}

export function FloatingNavigation({ className }: FloatingNavigationProps) {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering user-dependent content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const currentItem = navigationItems.find((item) => item.href === pathname);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div
        className={cn(
          "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
          "translate-y-0 opacity-100",
          className
        )}
      >
        <div className="relative floating-nav-glass rounded-2xl shadow-2xl px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10">
              <div className="w-6 h-6 bg-muted rounded-lg animate-pulse" />
              <span className="font-semibold text-sm text-foreground">
                Noto
              </span>
            </div>
            <div className="flex items-center gap-1">
              {navigationItems.map((item, index) => (
                <div
                  key={index}
                  className="p-2.5 rounded-xl bg-muted/50 animate-pulse"
                >
                  <div className="w-5 h-5 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
            <div className="p-1 rounded-xl bg-muted/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        className
      )}
    >
      {/* Main Navigation Bar */}
      <div
        className={cn(
          "relative floating-nav-glass rounded-2xl shadow-2xl transition-all duration-300 ease-out theme-transition",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
          isExpanded ? "px-4 py-3" : "px-3 py-2",
          "floating-nav-enter"
        )}
      >
        {/* Collapsed State - Floating Dock */}
        {!isExpanded && (
          <div className="flex items-center gap-2">
            {/* Logo/Brand */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-200 group"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Noto"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
              </div>
              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                Noto
              </span>
              <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            {/* Quick Navigation Icons */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative p-2.5 rounded-xl transition-all duration-200 group floating-nav-item floating-nav-focus",
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                        : `${item.bgColor} ${item.color} nav-icon-scale`
                    )}
                    title={item.name}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full pulse-glow" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-1 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 group">
                  {!isMounted || !isLoaded ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      width={32}
                      height={32}
                      alt="Profile"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mb-2 floating-nav-glass border-0 shadow-2xl"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-4 border-b border-white/10">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {!isMounted || !isLoaded
                        ? "Loading..."
                        : user?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!isMounted || !isLoaded
                        ? ""
                        : user?.emailAddresses[0]?.emailAddress || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuGroup className="p-2">
                  <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                    <User className="mr-3 h-4 w-4 text-blue-400" />
                    <span className="text-foreground">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                    <Settings className="mr-3 h-4 w-4 text-emerald-400" />
                    <span className="text-foreground">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                      {theme === "dark" ? (
                        <Moon className="mr-3 h-4 w-4 text-purple-400" />
                      ) : (
                        <Sun className="mr-3 h-4 w-4 text-yellow-400" />
                      )}
                      <span className="text-foreground">Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="floating-nav-glass border-0 shadow-2xl ml-2">
                      <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3"
                      >
                        <Sun className="mr-3 h-4 w-4 text-yellow-400" />
                        <span className="text-foreground">Light</span>
                        {theme === "light" && (
                          <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3"
                      >
                        <Moon className="mr-3 h-4 w-4 text-purple-400" />
                        <span className="text-foreground">Dark</span>
                        {theme === "dark" && (
                          <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                    <Bell className="mr-3 h-4 w-4 text-orange-400" />
                    <span className="text-foreground">Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                    <HelpCircle className="mr-3 h-4 w-4 text-indigo-400" />
                    <span className="text-foreground">Help & Support</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <div className="border-t border-white/10 p-2">
                  <DropdownMenuItem asChild>
                    <SignOutButton redirectUrl="/">
                      <div className="flex items-center text-red-400 hover:text-red-300 cursor-pointer rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 transition-all duration-200 p-3 w-full">
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </SignOutButton>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Expanded State - Full Navigation */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Noto"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Noto</h2>
                  <p className="text-xs text-muted-foreground">
                    PDF Annotation & Notes
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 rounded-lg"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsExpanded(false)}
                    className={cn(
                      "relative p-4 rounded-xl transition-all duration-200 group border",
                      isActive
                        ? `bg-gradient-to-r ${item.gradient} text-white border-transparent shadow-lg`
                        : "bg-card/50 hover:bg-card border-border/50 hover:border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive ? "bg-white/20" : item.bgColor
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive ? "text-white" : item.color
                          )}
                        />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-sm",
                            isActive ? "text-white" : "text-foreground"
                          )}
                        >
                          {item.name}
                        </h3>
                        <p
                          className={cn(
                            "text-xs",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <Sparkles className="w-4 h-4 text-white/80" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Section */}
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                {!isMounted || !isLoaded ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                ) : user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    width={40}
                    height={40}
                    alt="Profile"
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {!isMounted || !isLoaded
                      ? "Loading..."
                      : user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {!isMounted || !isLoaded
                      ? ""
                      : user?.emailAddresses[0]?.emailAddress || ""}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mb-2 floating-nav-glass border-0 shadow-2xl"
                    align="end"
                  >
                    <DropdownMenuGroup className="p-2">
                      <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                        <User className="mr-3 h-4 w-4 text-blue-400" />
                        <span className="text-foreground">Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                        <Settings className="mr-3 h-4 w-4 text-emerald-400" />
                        <span className="text-foreground">Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                          {theme === "dark" ? (
                            <Moon className="mr-3 h-4 w-4 text-purple-400" />
                          ) : (
                            <Sun className="mr-3 h-4 w-4 text-yellow-400" />
                          )}
                          <span className="text-foreground">Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="floating-nav-glass border-0 shadow-2xl ml-2">
                          <DropdownMenuItem
                            onClick={() => setTheme("light")}
                            className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3"
                          >
                            <Sun className="mr-3 h-4 w-4 text-yellow-400" />
                            <span className="text-foreground">Light</span>
                            {theme === "light" && (
                              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTheme("dark")}
                            className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3"
                          >
                            <Moon className="mr-3 h-4 w-4 text-purple-400" />
                            <span className="text-foreground">Dark</span>
                            {theme === "dark" && (
                              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                        <Bell className="mr-3 h-4 w-4 text-orange-400" />
                        <span className="text-foreground">Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg hover:bg-white/10 focus:bg-white/10 transition-all duration-200 p-3">
                        <HelpCircle className="mr-3 h-4 w-4 text-indigo-400" />
                        <span className="text-foreground">Help & Support</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <div className="border-t border-white/10 p-2">
                      <DropdownMenuItem asChild>
                        <SignOutButton redirectUrl="/">
                          <div className="flex items-center text-red-400 hover:text-red-300 cursor-pointer rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 transition-all duration-200 p-3 w-full">
                            <LogOut className="mr-3 h-4 w-4" />
                            <span>Log out</span>
                          </div>
                        </SignOutButton>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
