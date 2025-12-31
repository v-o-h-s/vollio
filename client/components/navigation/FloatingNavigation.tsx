"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Brain,
  CreditCard,
  DocumentBarChart,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { LuNotebookPen as NotebookPen } from "react-icons/lu";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
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
  },

  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
    description: "Create and manage notes",
  },
  {
    name: "Knowledge Test",
    href: "/dashboard/knowledge-test",
    icon: Brain,
    description: "Interactive knowledge tests",
  },
];

interface FloatingNavigationProps {
  className?: string;
}

export function FloatingNavigation({ className }: FloatingNavigationProps) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoaded(true);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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
    return null;
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
          "relative floating-nav-glass rounded-2xl shadow-2xl transition-all duration-500 ease-out theme-transition",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
          "backdrop-blur-xl bg-background/80 border border-border/50",
          isExpanded ? "px-4 py-3 scale-105" : "px-3 py-2 scale-100",
          "floating-nav-enter transform-gpu"
        )}
      >
        {/* Collapsed State - Floating Dock */}
        {!isExpanded && (
          <div className="flex items-center gap-2 transition-all duration-300 ease-out">
            {/* Logo/Brand */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 group hover:scale-105 active:scale-95"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Vollio"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              </div>
              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                Vollio
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
                      "relative p-2.5 rounded-xl transition-all duration-300 group floating-nav-item floating-nav-focus",
                      "hover:backdrop-blur-sm hover:shadow-lg transform-gpu",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground nav-icon-scale hover:scale-110"
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
                  {!isLoaded ? (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : user?.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      width={32}
                      height={32}
                      alt="Prodocument"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mb-2 bg-popover border-border shadow-2xl"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-4 border-b border-border">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {!isLoaded
                        ? "Loading..."
                        : user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!isLoaded ? "" : user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuGroup className="p-2">
                  <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                    <User className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Prodocument</span>
                  </DropdownMenuItem>
                  <Link href="/dashboard/settings" className="w-full">
                    <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3 cursor-pointer">
                      <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                      {theme === "dark" ? (
                        <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-foreground">Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-popover border-border shadow-2xl ml-2">
                      <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3"
                      >
                        <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Light</span>
                        {theme === "light" && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3"
                      >
                        <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Dark</span>
                        {theme === "dark" && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                    <Bell className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                    <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">Help & Support</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <div className="border-t border-border p-2">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center text-red-400 hover:text-red-300 cursor-pointer rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 transition-all duration-200 p-3 w-full">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Expanded State - Full Navigation */}
        {isExpanded && (
          <div className="space-y-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Vollio"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Vollio</h2>
                  <p className="text-xs text-muted-foreground">
                    Document Annotation & Notes
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsExpanded(false)}
                    className={cn(
                      "relative p-4 rounded-xl transition-all duration-300 group border animate-in fade-in slide-in-from-bottom-2 transform-gpu",
                      "hover:scale-105 hover:shadow-lg hover:backdrop-blur-sm",
                      isActive
                        ? "bg-primary text-primary-foreground border-transparent shadow-lg scale-105"
                        : "bg-card/50 hover:bg-card border-border/50 hover:border-border"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive ? "bg-primary-foreground/10" : "bg-muted"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-sm",
                            isActive
                              ? "text-primary-foreground"
                              : "text-foreground"
                          )}
                        >
                          {item.name}
                        </h3>
                        <p
                          className={cn(
                            "text-xs",
                            isActive
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <RobotIcon className="w-4 h-4 text-primary-foreground/60" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Section */}
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                {!isLoaded ? (
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    width={40}
                    height={40}
                    alt="Prodocument"
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {!isLoaded
                      ? "Loading..."
                      : user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {!isLoaded ? "" : user?.email || ""}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mb-2 bg-popover border-border shadow-2xl"
                    align="end"
                  >
                    <DropdownMenuGroup className="p-2">
                      <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Prodocument</span>
                      </DropdownMenuItem>
                      <Link href="/dashboard/settings" className="w-full">
                        <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3 cursor-pointer">
                          <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                          {theme === "dark" ? (
                            <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-foreground">Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-popover border-border shadow-2xl ml-2">
                          <DropdownMenuItem
                            onClick={() => setTheme("light")}
                            className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3"
                          >
                            <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">Light</span>
                            {theme === "light" && (
                              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTheme("dark")}
                            className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3"
                          >
                            <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">Dark</span>
                            {theme === "dark" && (
                              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                        <Bell className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg hover:bg-muted focus:bg-muted transition-all duration-200 p-3">
                        <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Help & Support</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <div className="border-t border-border p-2">
                      <DropdownMenuItem onClick={handleSignOut}>
                        <div className="flex items-center text-red-400 hover:text-red-300 cursor-pointer rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 transition-all duration-200 p-3 w-full">
                          <LogOut className="mr-3 h-4 w-4" />
                          <span>Log out</span>
                        </div>
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
