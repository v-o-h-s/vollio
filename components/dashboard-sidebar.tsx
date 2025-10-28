"use client";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  NotebookPen,
  Brain,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "@/hooks/use-theme";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics",
    gradient: "from-blue-500 to-cyan-500",
    hoverColor: "hover:bg-blue-500/10 hover:border-blue-500/20",
  },
  {
    name: "My files",
    href: "/dashboard/pdfs",
    icon: FileText,
    description: "View and manage all your PDFs",
    gradient: "from-emerald-500 to-teal-500",
    hoverColor: "hover:bg-emerald-500/10 hover:border-emerald-500/20",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
    description: "Create and manage rich text notes",
    gradient: "from-purple-500 to-pink-500",
    hoverColor: "hover:bg-purple-500/10 hover:border-purple-500/20",
  },
  {
    name: "Quizzes",
    href: "/dashboard/quizzes",
    icon: Brain,
    description: "Test your knowledge with interactive quizzes",
    gradient: "from-orange-500 to-red-500",
    hoverColor: "hover:bg-orange-500/10 hover:border-orange-500/20",
  },
  {
    name: "Flashcards",
    href: "/dashboard/flashcards",
    icon: CreditCard,
    description: "Study with spaced repetition flashcards",
    gradient: "from-pink-500 to-rose-500",
    hoverColor: "hover:bg-pink-500/10 hover:border-pink-500/20",
  },
];

export function DashboardSidebar({ className }: SidebarProps) {
  const user = useUser();
  const { theme, setTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const settingsRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Close settings dropdown when clicking outside

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-6 left-6 z-50 flex lg:hidden items-center justify-center w-10 h-10 bg-background border border-border rounded-lg shadow-sm text-foreground"
      >
        {isMobileOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border z-40 flex flex-col shadow-xl",
          // Desktop styles with smooth width transition
          "lg:relative lg:translate-x-0 lg:transition-[width] lg:duration-300 lg:ease-out",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile styles with transform transition
          "w-64 transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        style={{
          minWidth: isCollapsed ? "4rem" : "16rem",
          maxWidth: isCollapsed ? "4rem" : "16rem",
        }}
      >
        {/* Branding Section */}
        <div
          className={cn(
            "border-b border-sidebar-border transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-2 py-8" : "px-6 py-8"
          )}
        >
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {isCollapsed ? (
              // Collapse button replaces logo when collapsed
              <button
                onClick={toggleCollapse}
                title="Expand sidebar"
                className="w-8 h-8 bg-sidebar-accent rounded-xl flex items-center justify-center shadow-lg hover:bg-sidebar-accent/80 transition-colors duration-200"
              >
                <PanelLeftOpen
                  size={16}
                  className="text-sidebar-accent-foreground"
                />
              </button>
            ) : (
              // Logo and collapse button when expanded
              <>
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="logo" width={40} height={40} />
                  <div>
                    <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">
                      Noto
                    </h1>
                  </div>
                </div>
                <button
                  onClick={toggleCollapse}
                  title="Collapse sidebar"
                  className="hidden lg:flex w-7 h-7 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg items-center justify-center transition-colors duration-200"
                >
                  <PanelLeftClose
                    size={14}
                    className="text-sidebar-foreground/70"
                  />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav
          className={cn(
            "flex-1 py-6 transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-2" : "px-4"
          )}
        >
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center rounded-xl transition-colors duration-200 relative",
                    "hover:bg-sidebar-accent/50",
                    isCollapsed ? "gap-3 px-3 py-3" : "gap-3 px-3 py-3",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "flex-shrink-0",
                      isActive
                        ? "text-white"
                        : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="font-semibold text-sm">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                  {isActive && isCollapsed && (
                    <div className="absolute right-1 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div
          className={cn(
            "border-t border-sidebar-border relative transition-[padding] duration-300 ease-out",
            isCollapsed ? "px-2 py-4" : "px-4 py-4"
          )}
          ref={settingsRef}
        >
          <div
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            {/* User Avatar */}
            {isCollapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title="User menu"
                    className="bg-sidebar-accent rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 w-9 h-9"
                  >
                    {user.user && user && user.user.imageUrl ? (
                      <Image
                        src={user.user?.imageUrl}
                        width={36}
                        height={36}
                        alt="image"
                        className="rounded-2xl"
                      />
                    ) : (
                      <User
                        size={18}
                        className="text-sidebar-accent-foreground"
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="start"
                  side="right"
                >
                  <DropdownMenuLabel>{user.user?.fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help & Support
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SignOutButton redirectUrl="/">
                      <div className="flex flex-row gap-2 items-center text-red-500">
                        <LogOut className="mr-2 h-4 w-4 text-red-500" />
                        Log out
                      </div>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                title="John Doe"
                className="bg-sidebar-accent rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 w-9 h-9"
              >
                {user.user && user && user.user.imageUrl ? (
                  <Image
                    src={user.user?.imageUrl}
                    width={36}
                    height={36}
                    alt="image"
                    className="rounded-2xl"
                  />
                ) : (
                  <User size={18} className="text-sidebar-accent-foreground" />
                )}
              </button>
            )}

            {/* User Info & Settings - Only visible when expanded */}
            {!isCollapsed && (
              <>
                {/* User Info */}
                <div className="flex-1 min-w-0 max-w-[calc(16rem-6rem)]">
                  <div className="font-semibold text-sm text-sidebar-foreground truncate">
                    {user.user?.fullName}
                  </div>
                  <div
                    className="text-xs text-sidebar-foreground/60 truncate"
                    title={user.user?.emailAddresses[0].emailAddress}
                  >
                    {user.user?.emailAddresses[0].emailAddress}
                  </div>
                </div>

                {/* Settings Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      title="Settings"
                      className={cn(
                        "p-1.5 rounded-lg transition-colors duration-200 hover:bg-sidebar-accent/50",
                        "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Settings size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" side="top">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Preferences
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <div className="flex items-center">
                            {theme === "dark" ? (
                              <Moon className="mr-2 h-4 w-4" />
                            ) : (
                              <Sun className="mr-2 h-4 w-4" />
                            )}
                            Theme
                          </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => setTheme("light")}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Sun className="mr-2 h-4 w-4" />
                              Light
                            </div>
                            {theme === "light" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTheme("dark")}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <Moon className="mr-2 h-4 w-4" />
                              Dark
                            </div>
                            {theme === "dark" && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem>
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Help & Support
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <SignOutButton redirectUrl="/">
                        <div className="flex flex-row gap-2 items-center text-red-500">
                          <LogOut className="mr-2 h-4 w-4 text-red-500" />
                          Log out
                        </div>
                      </SignOutButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
