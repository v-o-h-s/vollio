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
} from "@/components/ui/dropdown-menu";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "My PDFs",
    href: "/dashboard/pdfs",
    icon: FileText,
    description: "View and manage all your PDFs",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
    description: "Create and manage rich text notes",
  },
  {
    name: "Editor Test",
    href: "/dashboard/editor-test",
    icon: FileText,
    description: "Test the Notion-like editor",
  },
];

export function DashboardSidebar({ className }: SidebarProps) {
  const user = useUser();

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
        {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
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
          "w-64 lg:w-auto transition-transform duration-300 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
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
                className="w-9 h-9 bg-sidebar-accent rounded-xl flex items-center justify-center shadow-lg hover:bg-sidebar-accent/80 transition-colors duration-200"
              >
                <PanelLeftOpen size={18} className="text-sidebar-accent-foreground" />
              </button>
            ) : (
              // Logo and collapse button when expanded
              <>
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="logo" width={50} height={50} />
                  <div>
                    <h1 className="font-bold text-xl text-sidebar-foreground tracking-tight">
                      Noto
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium">
                      Productivity Suite
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleCollapse}
                  title="Collapse sidebar"
                  className="hidden lg:flex w-8 h-8 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg items-center justify-center transition-colors duration-200"
                >
                  <PanelLeftClose size={16} className="text-sidebar-foreground/70" />
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
                    size={20}
                    className={cn(
                      "flex-shrink-0",
                      isActive
                        ? "text-white"
                        : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/80"
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span
                        className={cn(
                          "text-xs",
                          isActive
                            ? "text-blue-100"
                            : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground/70"
                        )}
                      >
                        {item.description}
                      </span>
                    </div>
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
                    className="bg-sidebar-accent rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 w-10 h-10"
                  >
                    {user.user && user && user.user.imageUrl ? (
                      <Image
                        src={user.user?.imageUrl}
                        width={40}
                        height={40}
                        alt="image"
                        className="rounded-2xl"
                      />
                    ) : (
                      <User size={20} className="text-sidebar-accent-foreground" />
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
                className="bg-sidebar-accent rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200 w-10 h-10"
              >
                {user.user && user && user.user.imageUrl ? (
                  <Image
                    src={user.user?.imageUrl}
                    width={40}
                    height={40}
                    alt="image"
                    className="rounded-2xl"
                  />
                ) : (
                  <User size={20} className="text-sidebar-accent-foreground" />
                )}
              </button>
            )}

            {/* User Info & Settings - Only visible when expanded */}
            {!isCollapsed && (
              <>
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-sidebar-foreground truncate">
                    {user.user?.fullName}
                  </div>
                  <div className="text-xs text-sidebar-foreground/60 truncate">
                    {user.user?.emailAddresses[0].emailAddress}
                  </div>
                </div>

                {/* Theme Toggle Button */}
                <ThemeToggle variant="button" size="sm" className="p-2" />

                {/* Settings Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      title="Settings"
                      className={cn(
                        "p-2 rounded-lg transition-colors duration-200 hover:bg-sidebar-accent/50",
                        "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <Settings size={16} />
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
                      <DropdownMenuItem className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">Theme</span>
                        </div>
                        <ThemeToggle variant="dropdown" size="sm" />
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
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
