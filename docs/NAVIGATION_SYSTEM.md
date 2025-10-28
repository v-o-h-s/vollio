# Navigation System Documentation

The Noto navigation system provides a modern, space-efficient, and immersive navigation experience through two complementary floating components that replace traditional sidebar navigation.

## 🎯 Overview

The navigation system consists of:
- **FloatingNavigation**: Primary navigation dock at the bottom of the screen
- **FloatingSidebar**: Context-aware action sidebar on the left side

Both components use glassmorphism design principles and provide seamless, non-intrusive navigation that adapts to user behavior and content consumption patterns.

## 🚀 FloatingNavigation Component

### Design Philosophy

The FloatingNavigation replaces traditional top navigation bars and sidebars with a modern floating dock that:
- Maximizes content viewing area
- Provides quick access to all main sections
- Adapts to user scrolling behavior
- Integrates user profile and settings

### Component States

#### Collapsed State (Default)
```tsx
// Compact floating dock
<div className="floating-nav-glass rounded-2xl px-3 py-2">
  <div className="flex items-center gap-2">
    {/* Brand with status indicator */}
    <button className="flex items-center gap-2 px-3 py-2 rounded-xl">
      <Image src="/logo.png" width={24} height={24} />
      <span className="font-semibold">Noto</span>
      <ChevronUp className="w-4 h-4" />
    </button>
    
    {/* Quick navigation icons */}
    <div className="flex items-center gap-1">
      {navigationItems.map(item => (
        <Link key={item.name} href={item.href} 
              className={`p-2.5 rounded-xl ${isActive ? 'bg-gradient' : 'hover:bg-muted'}`}>
          <Icon className="w-5 h-5" />
        </Link>
      ))}
    </div>
    
    {/* User avatar with status */}
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Image src={user.imageUrl} width={32} height={32} className="rounded-lg" />
      </DropdownMenuTrigger>
    </DropdownMenu>
  </div>
</div>
```

#### Expanded State (On Click)
```tsx
// Full navigation interface
<div className="floating-nav-glass rounded-2xl px-4 py-4">
  <div className="space-y-4">
    {/* Header with collapse button */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" width={32} height={32} />
        <div>
          <h2 className="font-bold text-lg">Noto</h2>
          <p className="text-xs text-muted-foreground">PDF Annotation & Notes</p>
        </div>
      </div>
      <Button onClick={() => setIsExpanded(false)}>
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>

    {/* 2x2 Navigation Grid */}
    <div className="grid grid-cols-2 gap-2">
      {navigationItems.map(item => (
        <Link key={item.name} href={item.href}
              className={`p-4 rounded-xl border ${isActive ? 'bg-gradient' : 'bg-card/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <Icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>

    {/* User Profile Section */}
    <div className="border-t pt-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
        <Image src={user.imageUrl} width={40} height={40} className="rounded-lg" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Settings className="w-4 h-4" />
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
    </div>
  </div>
</div>
```

### Auto-Hide Behavior

The navigation dock intelligently hides and shows based on user scrolling:

```typescript
const [isVisible, setIsVisible] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);  // Hide when scrolling down
      setIsExpanded(false); // Collapse if expanded
    } else {
      setIsVisible(true);   // Show when scrolling up
    }
    
    setLastScrollY(currentScrollY);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY]);
```

### Hydration Safety

Prevents layout shifts during SSR/hydration:

```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

// Show loading state until mounted
if (!isMounted) {
  return (
    <div className="floating-nav-glass rounded-2xl px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-muted rounded-xl p-2">
          <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
        </div>
        {/* Loading skeleton */}
      </div>
    </div>
  );
}
```

## 🎛️ FloatingSidebar Component

### Design Philosophy

The FloatingSidebar provides context-aware quick actions that:
- Adapt to the current page/route
- Provide keyboard shortcuts
- Integrate seamlessly with page functionality
- Maintain consistent glassmorphism styling

### Page-Specific Action Sets

#### PDF Management (`/dashboard/pdfs`)
```typescript
const pdfActions: QuickAction[] = [
  {
    id: "upload-pdf",
    label: "Upload PDF",
    icon: Upload,
    onClick: () => triggerEvent("pdf-upload-trigger"),
    variant: "primary",
    shortcut: "Ctrl+U",
  },
  {
    id: "create-folder",
    label: "New Folder", 
    icon: FolderPlus,
    onClick: () => triggerEvent("pdf-folder-create"),
  },
  {
    id: "search-files",
    label: "Search Files",
    icon: Search,
    onClick: () => focusSearchInput(),
    shortcut: "Ctrl+F",
  },
  // ... more actions
];
```

#### Notes Management (`/dashboard/notes`)
```typescript
const notesActions: QuickAction[] = [
  {
    id: "create-note",
    label: "New Note",
    icon: Plus,
    onClick: () => router.push("/dashboard/notes/new"),
    variant: "primary",
    shortcut: "Ctrl+N",
  },
  {
    id: "search-notes",
    label: "Search Notes",
    icon: Search,
    onClick: () => triggerEvent("notes-search"),
    shortcut: "Ctrl+F",
  },
  // ... more actions
];
```

#### Quiz Center (`/dashboard/quizzes`)
```typescript
const quizActions: QuickAction[] = [
  {
    id: "create-quiz",
    label: "Create Quiz",
    icon: Plus,
    onClick: () => router.push("/dashboard/quizzes/create"),
    variant: "primary",
    shortcut: "Ctrl+N",
  },
  {
    id: "filter-category",
    label: "Filter Category",
    icon: Filter,
    onClick: () => triggerEvent("category-filter"),
  },
  // ... more actions
];
```

### Event-Based Integration

The sidebar uses custom events for loose coupling with page components:

```typescript
// Sidebar Component
const triggerAction = (eventName: string) => {
  const event = new CustomEvent(eventName);
  window.dispatchEvent(event);
};

// Page Component Integration
const useFloatingSidebarIntegration = (actions: ActionHandlers) => {
  useEffect(() => {
    Object.entries(actions).forEach(([actionName, handler]) => {
      const eventName = `trigger-${actionName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      window.addEventListener(eventName, handler);
    });

    return () => {
      Object.entries(actions).forEach(([actionName, handler]) => {
        const eventName = `trigger-${actionName.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        window.removeEventListener(eventName, handler);
      });
    };
  }, [actions]);
};

// Usage in Page Component
export default function PDFsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useFloatingSidebarIntegration({
    uploadPDF: () => {
      const uploadEvent = new CustomEvent('pdf-upload-trigger');
      document.dispatchEvent(uploadEvent);
    },
    searchFiles: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },
  });

  return (
    <div>
      <input ref={searchInputRef} placeholder="Search files..." />
      {/* Page content */}
    </div>
  );
}
```

### Collapsible States

#### Collapsed State (Icon Stack)
```tsx
<div className="floating-nav-glass rounded-2xl w-14 px-2 py-3">
  <div className="flex flex-col items-center gap-2">
    {/* Expand button */}
    <Tooltip>
      <TooltipTrigger>
        <Button onClick={() => setIsExpanded(true)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>{getPageTitle()} Actions</p>
      </TooltipContent>
    </Tooltip>

    <Separator className="w-6" />

    {/* Primary actions */}
    {primaryActions.slice(0, 2).map(action => (
      <Tooltip key={action.id}>
        <TooltipTrigger>
          <Button 
            variant={action.variant === "primary" ? "default" : "ghost"}
            size="icon"
            onClick={action.onClick}
          >
            <Icon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{action.label}</p>
          {action.shortcut && <p className="text-xs">{action.shortcut}</p>}
        </TooltipContent>
      </Tooltip>
    ))}

    {/* Secondary actions */}
    {secondaryActions.slice(0, 3).map(action => (
      <Tooltip key={action.id}>
        <TooltipTrigger>
          <Button variant="ghost" size="icon" onClick={action.onClick}>
            <Icon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{action.label}</p>
        </TooltipContent>
      </Tooltip>
    ))}
  </div>
</div>
```

#### Expanded State (Full Action List)
```tsx
<div className="floating-nav-glass rounded-2xl w-64 px-4 py-4">
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-sm">{getPageTitle()}</h3>
        <p className="text-xs text-muted-foreground">Quick Actions</p>
      </div>
      <Button onClick={() => setIsExpanded(false)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>

    {/* Primary Actions */}
    <div className="space-y-2">
      {primaryActions.map(action => (
        <Button
          key={action.id}
          onClick={action.onClick}
          className="w-full justify-start gap-3 h-10"
          variant={action.variant === "primary" ? "default" : "ghost"}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{action.label}</span>
          {action.shortcut && (
            <span className="ml-auto text-xs opacity-60">{action.shortcut}</span>
          )}
        </Button>
      ))}
    </div>

    <Separator />

    {/* Secondary Actions */}
    <div className="space-y-1">
      {secondaryActions.map(action => (
        <Button
          key={action.id}
          variant="ghost"
          onClick={action.onClick}
          className="w-full justify-start gap-3 h-9"
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{action.label}</span>
          {action.shortcut && (
            <span className="ml-auto text-xs opacity-60">{action.shortcut}</span>
          )}
        </Button>
      ))}
    </div>
  </div>
</div>
```

## 🎨 Glassmorphism Design System

### CSS Implementation

```css
.floating-nav-glass {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.dark .floating-nav-glass {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.3),
    0 4px 6px -2px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.floating-nav-enter {
  animation: floating-nav-appear 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes floating-nav-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Theme Integration

```typescript
// Theme-aware styling
const getThemeClasses = (theme: string) => ({
  glass: theme === 'dark' 
    ? 'bg-black/95 border-white/10' 
    : 'bg-white/95 border-white/20',
  text: theme === 'dark' 
    ? 'text-white' 
    : 'text-black',
  muted: theme === 'dark' 
    ? 'text-white/60' 
    : 'text-black/60',
});

// Gradient backgrounds for active states
const gradientClasses = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
  hover: 'hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600',
};
```

## 📱 Mobile Responsiveness

### Touch Optimizations

```css
/* Touch-friendly targets */
.floating-nav-item {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

/* Mobile-specific adjustments */
@media (max-width: 768px) {
  .floating-nav-glass {
    padding: 0.375rem;
    gap: 0.375rem;
    max-width: calc(100vw - 2rem);
  }

  .floating-nav-expanded {
    width: calc(100vw - 2rem);
    max-width: 400px;
  }
}
```

### Responsive Behavior

```typescript
// Mobile-specific adaptations
const isMobile = useMediaQuery('(max-width: 768px)');

const mobileAdaptations = {
  // Larger touch targets
  buttonSize: isMobile ? 'lg' : 'md',
  // Simplified layouts
  showDescriptions: !isMobile,
  // Touch gestures
  enableSwipeGestures: isMobile,
};
```

## ♿ Accessibility Features

### Keyboard Navigation

```typescript
// Keyboard shortcuts
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'n':
        e.preventDefault();
        triggerPrimaryAction();
        break;
      case 'f':
        e.preventDefault();
        focusSearch();
        break;
      case '/':
        e.preventDefault();
        toggleNavigation();
        break;
    }
  }
  
  if (e.key === 'Escape') {
    setIsExpanded(false);
  }
};
```

### Screen Reader Support

```tsx
// ARIA labels and roles
<nav role="navigation" aria-label="Main navigation">
  <button 
    aria-expanded={isExpanded}
    aria-controls="navigation-menu"
    aria-label="Toggle navigation menu"
  >
    <span className="sr-only">
      {isExpanded ? 'Collapse' : 'Expand'} navigation
    </span>
  </button>
  
  <div 
    id="navigation-menu"
    role="menu"
    aria-hidden={!isExpanded}
  >
    {navigationItems.map(item => (
      <Link
        key={item.name}
        role="menuitem"
        aria-label={`Navigate to ${item.name}: ${item.description}`}
        href={item.href}
      >
        {item.name}
      </Link>
    ))}
  </div>
</nav>
```

### Focus Management

```typescript
// Focus trapping in expanded state
const focusTrap = useFocusTrap(isExpanded);

// Return focus to trigger on close
const handleClose = () => {
  setIsExpanded(false);
  triggerRef.current?.focus();
};
```

## 🚀 Performance Optimizations

### Lazy Loading

```typescript
// Lazy load expanded content
const ExpandedNavigation = lazy(() => import('./ExpandedNavigation'));

// Conditional rendering
{isExpanded && (
  <Suspense fallback={<NavigationSkeleton />}>
    <ExpandedNavigation />
  </Suspense>
)}
```

### Debounced Scroll Handling

```typescript
// Debounced scroll handler
const debouncedScrollHandler = useMemo(
  () => debounce((scrollY: number) => {
    setIsVisible(scrollY < lastScrollY || scrollY < 100);
  }, 100),
  [lastScrollY]
);
```

### Memoized Components

```typescript
// Prevent unnecessary re-renders
const NavigationItem = memo(({ item, isActive }: NavigationItemProps) => {
  return (
    <Link
      href={item.href}
      className={cn(
        'navigation-item',
        isActive && 'active'
      )}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.name}</span>
    </Link>
  );
});
```

## 🔧 Integration Guide

### Layout Setup

```tsx
// Dashboard Layout
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content with bottom padding for navigation */}
      <main className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {children}
        </div>
      </main>

      {/* Floating Navigation Components */}
      <FloatingNavigation />
      <FloatingSidebar />
    </div>
  );
}
```

### Page Integration

```tsx
// Page-specific integration
export default function NotesPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Integrate with floating sidebar
  useFloatingSidebarIntegration({
    createNote: () => router.push('/dashboard/notes/new'),
    searchNotes: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },
    filterNotes: () => setShowFilters(!showFilters),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <input
          ref={searchInputRef}
          placeholder="Search notes..."
          className="px-4 py-2 border rounded-lg"
        />
      </div>
      {/* Page content */}
    </div>
  );
}
```

## 🔮 Future Enhancements

### Planned Features
- **Gesture Support**: Swipe gestures for mobile navigation
- **Voice Commands**: Accessibility-focused voice navigation
- **Customizable Actions**: User-configurable sidebar actions
- **Global Search**: Integrated search across all content
- **Notification Center**: In-navigation notification system

### Advanced Interactions
- **Drag & Drop**: Reorder navigation items
- **Context Menus**: Right-click actions for power users
- **Multi-Selection**: Batch operations support
- **Quick Switcher**: Command palette-style navigation

This navigation system provides a modern, efficient, and accessible foundation for the Noto application while maintaining excellent user experience across all devices and interaction methods.