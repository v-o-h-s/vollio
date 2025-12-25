# UI Style Guide

This document outlines the visual identity and UI patterns for the Vollio application.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing and Sizing](#spacing-and-sizing)
- [Themes](#themes)
- [Component Styles](#component-styles)

## Colors

The color system is defined using CSS custom properties and supports both light and dark themes. The color values are defined in the OKLCH color space to ensure perceptual uniformity.

### Primary Palette

| Variable | Light Theme | Dark Theme | Description |
| --- | --- | --- | --- |
| `--background` | `oklch(1 0 0)` | `#18181b` | Main background color. |
| `--foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Main text and icon color. |
| `--primary` | `oklch(0.21 0.006 285.885)` | `oklch(0.92 0.004 286.32)` | Primary interactive elements. |
| `--primary-foreground` | `oklch(0.985 0 0)` | `#18181b` | Text on primary elements. |
| `--secondary` | `oklch(0.967 0.001 286.375)` | `#27272a` | Secondary interactive elements. |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Text on secondary elements. |
| `--accent` | `oklch(0.967 0.001 286.375)` | `#27272a` | Accent color for highlights. |
| `--accent-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Text on accent elements. |

### UI Elements

| Variable | Light Theme | Dark Theme | Description |
| --- | --- | --- | --- |
| `--card` | `oklch(1 0 0)` | `#27272a` | Card background color. |
| `--card-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Text on cards. |
| `--popover` | `oklch(1 0 0)` | `#27272a` | Popover background color. |
| `--popover-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` | Text on popovers. |
| `--border` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 12%)` | Border color for elements. |
| `--input` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 18%)` | Input field background. |
| `--ring` | `oklch(0.705 0.015 286.067)` | `oklch(0.552 0.016 285.938)` | Focus ring color. |

### Special Colors

| Variable | Light Theme | Dark Theme | Description |
| --- | --- | --- | --- |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Destructive actions (e.g., delete). |
| `--muted` | `oklch(0.967 0.001 286.375)` | `#27272a` | Muted background color. |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | `oklch(0.705 0.015 286.067)` | Muted text color. |

### Chart Colors

| Variable | Light Theme | Dark Theme |
| --- | --- | --- |
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

### Sidebar Colors

| Variable | Light Theme | Dark Theme |
| --- | --- | --- |
| `--sidebar` | `oklch(0.985 0 0)` | `#1f1f23` |
| `--sidebar-foreground` | `oklch(0.141 0.005 285.823)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `oklch(0.21 0.006 285.885)` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-accent` | `oklch(0.967 0.001 286.375)` | `#27272a` |
| `--sidebar-accent-foreground` | `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` |
| `--sidebar-border` | `oklch(0.92 0.004 286.32)` | `oklch(1 0 0 / 12%)` |
| `--sidebar-ring` | `oklch(0.705 0.015 286.067)` | `oklch(0.552 0.016 285.938)` |

## Typography

The typography is designed to be elegant and readable, with distinct styles for headings and body text.

### Font Families

| Variable | Font Family | Usage |
| --- | --- | --- |
| `--font-heading` | `var(--font-playfair), serif` | Headings and titles. |
| `--font-body` | `var(--font-poppins), sans-serif` | Body text and UI elements. |
| `--font-elegant` | `var(--font-playfair), serif` | Special elegant text styles. |
| `--font-modern` | `var(--font-inter), sans-serif` | Modern, clean text styles. |

### Font Styles

| Class | Font Size | Font Weight | Line Height | Letter Spacing |
| --- | --- | --- | --- | --- |
| `.text-elegant-xl` | 3.5rem (responsive) | 700 | 1.1 | -0.03em |
| `.text-elegant-lg` | 2.5rem (responsive) | 600 | 1.2 | -0.02em |
| `.text-elegant-md` | 1.875rem (responsive) | 600 | 1.3 | -0.01em |
| `.text-body-lg` | 1.125rem | 400 | 1.6 | 0.01em |
| `.text-body-md` | 1rem | 400 | 1.5 | normal |

### Font Weight Utilities

| Class | Font Weight |
| --- | --- |
| `.font-light` | 300 |
| `.font-elegant-medium` | 500 |
| `.font-elegant-semibold` | 600 |
| `.font-elegant-bold` | 700 |

### Letter Spacing

| Class | Properties |
| --- | --- |
| `.tracking-elegant` | `letter-spacing: -0.02em;` |
| `.tracking-luxury` | `letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500;` |

### Accessibility

A `.large-text` class is available to increase the font size across the application for better readability.

## Spacing and Sizing

The application uses a consistent system for spacing and sizing to maintain a balanced and harmonious layout.

### Spacing

Spacing is managed using [Tailwind CSS's default spacing scale](https://tailwindcss.com/docs/spacing), which is based on a `0.25rem` unit (4px). Utility classes like `p-4` (1rem padding) or `m-8` (2rem margin) should be used to ensure consistency.

### Border Radius

The border radius is defined using CSS custom properties to create a consistent rounded corner style.

| Variable | Value | Description |
| --- | --- | --- |
| `--radius` | `0.625rem` | The base border radius. |
| `--radius-sm` | `calc(var(--radius) - 4px)` | Small border radius. |
| `--radius-md` | `calc(var(--radius) - 2px)` | Medium border radius. |
| `--radius-lg` | `var(--radius)` | Large border radius (same as base). |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Extra-large border radius. |

## Themes

The application supports both a light and a dark theme, with the ability to detect and adapt to the user's system preferences.

### Light Theme

The light theme is the default theme, defined under the `:root` selector. It features a clean, bright color palette with dark text for high contrast.

### Dark Theme

The dark theme is applied by adding the `.dark` class to the `<html>` element. It uses a darker color palette with light text to reduce eye strain in low-light environments.

## Component Styles

The application's component styles are built on a combination of a custom design system and a third-party component library.

### Glassmorphism UI

The UI is designed with a "Glassmorphism" aesthetic, characterized by:

- **Floating Navigation**: A modern floating navigation dock with backdrop blur and transparency effects.
- **Transparency**: Semi-transparent backgrounds on UI elements to create a sense of depth.
- **Blurred Backgrounds**: `backdrop-filter: blur()` is used to create a frosted glass effect.

### shadcn/ui

The application uses [shadcn/ui](https://ui.shadcn.com/) for its base UI components. These components are unstyled and fully customizable, allowing them to be styled to match the application's unique design system.
