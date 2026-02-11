"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Settings,
  User,
  LogOut,
  Sun,
  HelpCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { LuNotebookPen as NotebookPen } from "react-icons/lu";
import { GrTestDesktop } from "react-icons/gr";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";

// Helper to disable navigation
const DefaultLink = ({ children, style, ...props }: any) => (
  <div style={style} {...props}>
    {children}
  </div>
);

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "Notes",
    href: "/notes",
    icon: NotebookPen,
    description: "Create and manage notes",
  },
  {
    name: "Knowledge Test",
    href: "/knowledge-test",
    icon: GrTestDesktop,
    description: "Interactive knowledge tests",
  },
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
    description: "Get help or suggest features",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account and preferences",
  },
];

interface FloatingNavigationProps {
  className?: string; // Kept for interface compatibility but mostly ignored/mapped
  disableAnimation?: boolean;
}

export function FloatingNavigation({
  className,
  disableAnimation = false,
}: FloatingNavigationProps) {
  const pathname = "/";
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (disableAnimation) return;
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
  }, [lastScrollY, disableAnimation]);

  if (!isMounted) return null;

  const showNav = disableAnimation || isVisible;

  // Inline styles
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "1.5rem",
    left: "50%",
    transform: `translateX(-50%) ${showNav ? "translateY(0)" : "translateY(4rem)"}`,
    opacity: showNav ? 1 : 0,
    zIndex: 50,
    transition: disableAnimation ? "none" : "all 0.3s ease-out",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const navBoxStyle: React.CSSProperties = {
    position: "relative",
    borderRadius: "1rem",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: disableAnimation ? "none" : "all 0.5s ease-out",
    backdropFilter: "blur(24px)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    border: "1px solid #e5e5e5",
    padding: isExpanded ? "0.75rem 1rem" : "0.5rem 0.75rem",
    transform: isExpanded ? "scale(1.05)" : "scale(1)",
  };

  const buttonReset: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div style={containerStyle}>
      <div style={navBoxStyle}>
        {/* Collapsed State */}
        {!isExpanded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease-out",
            }}
          >
            {/* Logo/Brand */}
            <button
              onClick={() => setIsExpanded(true)}
              style={{
                ...buttonReset,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.75rem",
                backgroundColor: "#f5f5f5",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e5e5e5")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
            >
              <div style={{ position: "relative" }}>
                <img
                  src="/logo.png"
                  alt="Vollio"
                  width={24}
                  height={24}
                  style={{ borderRadius: "0.5rem" }}
                  onError={(e) => (e.currentTarget.style.display = "none")} // Hide if missing
                />
                <div
                  style={{
                    position: "absolute",
                    top: "-0.25rem",
                    right: "-0.25rem",
                    width: "0.75rem",
                    height: "0.75rem",
                    backgroundColor: "#171717",
                    borderRadius: "9999px",
                  }}
                />
              </div>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#171717",
                }}
              >
                Vollio
              </span>
              <ChevronUp size={16} color="#737373" />
            </button>

            {/* Quick Nav Icons */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <DefaultLink
                    key={item.name}
                    style={{
                      position: "relative",
                      padding: "0.625rem",
                      borderRadius: "0.75rem",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      backgroundColor: isActive
                        ? "#171717"
                        : "rgba(245, 245, 245, 0.5)",
                      color: isActive ? "#ffffff" : "#737373",
                      boxShadow: isActive
                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        : "none",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title={item.name}
                    // Simulate hover in JS is tricky for map, but for preview default styles are fine.
                  >
                    <Icon size={20} />
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-0.25rem",
                          right: "-0.25rem",
                          width: "0.5rem",
                          height: "0.5rem",
                          backgroundColor: "#ffffff",
                          borderRadius: "9999px",
                          boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                        }}
                      />
                    )}
                  </DefaultLink>
                );
              })}
            </div>

            {/* User Avatar - simple button no dropdown for preview simplicity or custom implementation */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  ...buttonReset,
                  position: "relative",
                  padding: "0.25rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(245, 245, 245, 0.5)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#171717",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={16} color="white" />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-0.25rem",
                    right: "-0.25rem",
                    width: "0.75rem",
                    height: "0.75rem",
                    backgroundColor: "#22c55e",
                    borderRadius: "9999px",
                    border: "2px solid white",
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src="/logo.png"
                    alt="Vollio"
                    width={32}
                    height={32}
                    style={{ borderRadius: "0.5rem" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "-0.25rem",
                      right: "-0.25rem",
                      width: "0.75rem",
                      height: "0.75rem",
                      backgroundColor: "#171717",
                      borderRadius: "9999px",
                    }}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "#171717",
                      margin: 0,
                    }}
                  >
                    Vollio
                  </h2>
                  <p
                    style={{ fontSize: "0.75rem", color: "#737373", margin: 0 }}
                  >
                    Document Annotation & Notes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  ...buttonReset,
                  height: "2rem",
                  width: "2rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#171717",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Nav Items Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <DefaultLink
                    key={item.name}
                    onClick={() => setIsExpanded(false)}
                    style={{
                      position: "relative",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      border: "1px solid",
                      borderColor: isActive ? "transparent" : "#e5e5e5",
                      backgroundColor: isActive ? "#171717" : "#f9fafb",
                      color: isActive ? "white" : "#171717",
                      cursor: "pointer",
                      display: "block",
                      boxShadow: isActive
                        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        : "none",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          backgroundColor: isActive
                            ? "rgba(255, 255, 255, 0.1)"
                            : "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon
                          size={20}
                          color={isActive ? "white" : "#737373"}
                        />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: isActive
                              ? "rgba(255, 255, 255, 0.7)"
                              : "#737373",
                            margin: 0,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </DefaultLink>
                );
              })}
            </div>

            {/* User Section */}
            <div
              style={{
                borderTop: "1px solid rgba(229, 229, 229, 0.5)",
                paddingTop: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "rgba(245, 245, 245, 0.3)",
                }}
              >
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#171717",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#171717",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Preview User
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#737373",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    preview@vollio.app
                  </p>
                </div>
                <button
                  style={{
                    ...buttonReset,
                    height: "2rem",
                    width: "2rem",
                    color: "#737373",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
