<!-- Generated from app/globals.css to capture the current visual system -->

# Global Style + Theme Report

## 1. Theme Tokens

### 1.1 Light Palette (`:root`)
Primary tokens live in `app/globals.css` and largely use OKLCH values for perceptual consistency.

| Token | Value | Notes |
| --- | --- | --- |
| `--background` / `--card` / `--popover` | `oklch(1 0 0)` | Pure white base surfaces |
| `--foreground` | `oklch(0.141 0.005 285.823)` | Neutral near-black text |
| `--primary` | `oklch(0.21 0.006 285.885)` | Indigo/eggplant accent for CTAs |
| `--primary-foreground` | `oklch(0.985 0 0)` | Inverted text on primary |
| `--secondary` / `--muted` / `--accent` | `oklch(0.967 0.001 286.375)` | Very light lavender tints for chrome |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)` | Matches primary hue |
| `--muted-foreground` | `oklch(0.552 0.016 285.938)` | Secondary text |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Warm red for destructive actions |
| `--border` / `--input` | `oklch(0.92 0.004 286.32)` | Low-contrast separators |
| `--ring` | `oklch(0.705 0.015 286.067)` | Focus halo |
| `--chart-1..5` | Mix of warm/cool OKLCH hues | Used for data viz |
| `--sidebar-*` | Slight variations of the base palette | Ensures nav contrast |
| `--radius` | `0.625rem` (10px) | Rounded UI default |

### 1.2 Dark Palette (`.dark`)
- Background shifts to `#18181b` with supporting surfaces at `#27272a`.
- Text flips to `oklch(0.985 0 0)` (white) while primary becomes a light indigo (`oklch(0.92 0.004 286.32)`).
- Borders/input fields become semi-transparent white (`--border: oklch(1 0 0 / 12%)`).
- Chart colors rotate toward saturated blues/purples to preserve contrast.
- Sidebar adopts `#1f1f23` with matching focus rings.

### 1.3 Accessibility & Alternate Modes
- **High Contrast (`.accessibility-high-contrast`)**: Overrides to pure black/white combos with thicker borders.
- **Large Text (`.large-text`)**: Upscales typography utility classes (e.g., `.text-sm` → `1rem`).
- **Reduced Motion (`.reduced-motion`)**: Forces animation/transition durations to 0.01 ms.
- **Screen Reader Utilities**: `.sr-only` plus improved focus indicators via `.enhanced-focus`.

### 1.4 Typography + Fonts
- Sans families: `var(--font-inter)` + `var(--font-geist-sans)` for UI.
- Mono: `var(--font-geist-mono)` for code.
- Headings/body references: `var(--font-outfit)` and `var(--font-poppins)`.
- Specialized classes (`.font-heading`, `.text-elegant-*`, `.tracking-luxury`) provide editorial/landing typography.

## 2. Component & Interaction Patterns

### 2.1 Base + Layout
- `@layer base` applies `border-border` and `outline-ring/50` to all elements and sets body to `bg-background text-foreground`.
- Global scrollbar styling: thin rails, blue thumbs that adapt in dark mode, plus Firefox equivalents.

### 2.2 Rich Text / Notion-style Editor (`.ProseMirror`)
- Padding `1rem`, `line-height: 1.6`, emphasis on 600 weight headings.
- Custom bullets (●, ◦, ▪) and ol counters for nested lists.
- Code blocks use `hsl(var(--muted))` backgrounds with border outlines; inline code gets pill styling.
- Syntax highlighting maps keywords to primary hue, strings to green (`#059669`), numbers to rose (`#e11d48`), etc.
- Blockquotes: primary-colored stripe, muted background, italic text; dark-mode variant adjusts to slate colors.
- Floating toolbars/buttons inherit accent/primary fill states and glassmorphism when active.

### 2.3 PDF Annotation & Viewer
- Highlights: translucent blue fill (`rgba(59,130,246,0.2)`) with animated fade-in/pulse states.
- Mobile tweaks enlarge tap targets (min `44px`) and enable touch-friendly scrolling/selection.
- Syncfusion viewer resets widths/heights to `100%`, custom scrollbars, and responsive toolbar layouts.
- Focus mode (`.pdf-focus-mode`) forces full-screen layout, hides sidebar, and uses overlays/animations like `fadeIn`.

### 2.4 Navigation & Buttons
- Floating nav uses glassmorphism (`backdrop-filter: blur(24px)`), layered shadows, hover lifts, and pulse indicators.
- `.floating-nav-item` features animated sheen sweeps; `.nav-icon-scale` manages hover/active scaling.
- Utility classes `.hover-lift`, `.hover-glow`, `.modern-button`, etc., standardize motion across cards/buttons.

### 2.5 Modals & Dialogs
- Unified modal stack (`.unified-note-modal`, `.modal-header-solid`, `.enhanced-modal-content`) enforces solid backgrounds (no translucency), border outlines, and drop shadows for accessibility.
- Z-index fixes for Radix dialogs, floating toolbars, and slash menus avoid overlap issues, especially inside PDF contexts.
- Animations include `modal-fade-in`, `modal-scale-in`, `modal-slide-up`, and `modal-content-appear`.
- Fullscreen modes lock body scroll (`body.modal-open`) and stretch dialogs to viewport bounds.

### 2.6 Cards, Flashcards, and Notes
- `.enhanced-note-card` combines subtle gradients with hover lifts and multi-layer shadows.
- Flashcards use 3D transforms (`.transform-style-preserve-3d`, `.rotate-y-180`) plus `card-transition` hover states.
- Progress/empty states leverage animations like `progress-fill` and `bounce-gentle`.

### 2.7 Micro-interactions & Feedback
- Extensive keyframes: `annotation-fade-in`, `annotation-pulse`, `button-press`, `tooltip-appear`, `loading-shimmer`, `success-bounce`, `pulse-glow`, `slide-in-from-*`, etc.
- `.theme-transition` ensures smooth color/border changes when toggling light/dark.
- `.focus-visible-enhanced` and `.focus-ring` standardize 2 px blue outlines with shadow glows.

## 3. Accessibility & Responsiveness Highlights
- **Focus & Input States**: `outline: 2px solid #3b82f6` equivalents applied broadly to ensure keyboard visibility.
- **Scrollbar Customization**: Consistent theming across WebKit and Firefox; landing pages get gradient thumbs.
- **Mobile / Tablet Queries**: Frequent `@media (max-width: 768px)` adjustments for toolbars, editors, PDF controls, modals, and typography.
- **Prefer-color-scheme & Prefers-reduced-motion** hooks ensure system settings propagate to the UI.

## 4. Key Takeaways
- Palette centers on neutral whites + indigo accents, with OKLCH to maintain perceptual consistency.
- Dark mode mirrors the structure but flips contrasts, while high-contrast mode swaps to stark black/white for compliance.
- Rich text editors, PDF tools, navigation, and modals share a cohesive motion language (glassmorphism, subtle lifts, blue focus).
- Accessibility is built-in via focus rings, screen-reader utilities, larger text mode, and reduced-motion safeguards.

_Source: `app/globals.css`_

