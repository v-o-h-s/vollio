import { toast } from "react-hot-toast";
import React from "react";

const baseStyle = {
  padding: "14px 20px",
  borderRadius: "12px",
  fontWeight: 600,
  fontSize: "14px",
  minWidth: "320px",
  maxWidth: "500px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

// Animated Spinner Component
const Spinner = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: "spin 1s linear infinite",
    }}
  >
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="31.4 31.4"
      strokeDashoffset="10"
      opacity="0.25"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="31.4 31.4"
      strokeDashoffset="10"
      opacity="0.75"
      style={{
        strokeDasharray: "15.7 31.4",
      }}
    />
  </svg>
);

export const notify = {
  success: (message: string) =>
    toast(message, {
      position: "top-right",
      duration: 3000,
      style: {
        ...baseStyle,
        background: "hsl(var(--success-bg, 143 85% 90%))",
        color: "hsl(var(--success-text, 143 64% 24%))",
        border: "1px solid hsl(var(--success-border, 143 64% 24%))",
      },
      icon: "✔️",
    }),

  error: (message: string) =>
    toast(message, {
      position: "top-right",
      duration: 4000,
      style: {
        ...baseStyle,
        background: "hsl(var(--destructive-bg, 0 86% 95%))",
        color: "hsl(var(--destructive-text, 0 74% 42%))",
        border: "1px solid hsl(var(--destructive-border, 0 74% 42%))",
      },
      icon: "❌",
    }),

  loading: (message: string) =>
    toast.loading(message, {
      position: "top-right",
      style: {
        ...baseStyle,
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
      },
      icon: React.createElement(Spinner),
    }),
};
