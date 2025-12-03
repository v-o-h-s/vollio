# Navigation Components

The Noto navigation system consists of two complementary floating components that provide modern, space-efficient navigation without interfering with the main content area.

## FloatingNavigation

The primary navigation component that replaces traditional sidebars with a modern floating dock at the bottom of the screen.

### Features

- **Glassmorphism Design**: Modern backdrop blur effects with semi-transparent backgrounds
- **Dual States**: Collapsed dock for quick access, expanded view for full navigation
- **Auto-Hide Behavior**: Intelligently hides during scrolling for immersive experience
- **Theme Integration**: Complete light/dark mode support with smooth transitions
- **User Profile**: Integrated user management with settings and theme controls
- **Mobile Optimized**: Touch-friendly interactions with responsive design

### States

#### Collapsed State (Floating Dock)
- **Brand Logo**: Noto logo with animated status indicator
- **Quick Navigation**: Icon-based access to all main sections (Dashboard, Files, Notes, Quizzes, Flashcards)
- **User Avatar**: Profile access with online status indicator
- **Current Page Indicator**: Floating tooltip showing active section

#### Expanded State (Full Navigation)
- **Grid Layout**: 2-column grid with section descriptions
- **User Profile**: Complete user information and settings access
- **Theme Controls**: Integrated light/dark mode switching
- **Navigation Cards**: Rich cards with icons, descriptions, and visual feedback

### Navigation Sections

```typescript
const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics",
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "Files", 
    href: "/dashboard/pdfs",
    icon: FileText,
    description: "View and manage PDFs",
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  // ... more sections
];
```

### Usage

```tsx
import { FloatingNavigation } from '@/components/navigation';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="w-full">
        <div className="container mx-auto px-4 py-6 pb-24">
          {children}
        </div>
      </main>
      <FloatingNavigation />
    </div>
  );
}
```

## FloatingSidebar

A context-aware floating sidebar positioned on the left side of the screen that provides page-specific quick actions and shortcuts.

### Features

- **Page-Specific Actions**: Dynamically adapts actions based on current route
- **Collapsible Design**: Compact icon stack that expands to show full action list
- **Auto-Hide on Scroll**: Hides when scrolling down, shows when scrolling up
- **Keyboard Shortcuts**: Supports common shortcuts (Ctrl+N, Ctrl+F, F5, etc.)
- **Event Integration**: Uses custom events to communicate with page components
- **Tooltip Support**: Helpful tooltips for collapsed state actions
- **Theme Aware**: Complete glassmorphism styling with theme support

### Page-Specific Actions

#### PDF Management (`/dashboard/pdfs`)
- **Upload PDF** (Primary) - Trigger file upload dialog
- **New Folder** - Create new folder in current location
- **Search Files** - Focus search input with smooth scroll
- **Filter & Sort** - Toggle advanced filtering panel
- **View Mode** - Cycle between grid/list/compact views
- **Refresh** - Reload page content

#### Notes Management (`/dashboard/notes`)
- **New Note** (Primary) - Navigate to note creation
- **Search Notes** - Focus search input
- **Filter Notes** - Toggle filter options
- **Sort Options** - Cycle through sort modes
- **View Mode** - Toggle between display modes
- **Starred Notes** - Filter starred notes only

#### Quiz Center (`/dashboard/quizzes`)
- **Create Quiz** (Primary) - Navigate to quiz creation
- **Search Quizzes** - Focus search input
- **Filter Category** - Cycle through categories
- **Difficulty Filter** - Cycle through difficulty levels
- **Bookmarked** - Filter bookmarked quizzes
- **Statistics** - Toggle stats panel

#### Dashboard Overview (`/dashboard`)
- **Quick Upload** (Primary) - Navigate to PDF upload
- **New Note** - Create new note
- **Create Quiz** - Navigate to quiz creation
- **Recent Files** - Navigate to files page
- **Settings** - Open settings modal

### Integration with Pages

Use the `useFloatingSidebarIntegration` hook to connect sidebar actions with page functionality:

```tsx
import { useFloatingSidebarIntegration } from '@/hooks/use-floating-sidebar';

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
    createFolder: () => {
      const folderEvent = new CustomEvent('pdf-folder-create');
      document.dispatchEvent(folderEvent);
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

### Event System

The sidebar uses a custom event system for loose coupling with page components:

```typescript
// Sidebar triggers events
const triggerAction = (actionType: string) => {
  const event = new CustomEvent(`trigger-${actionType}`);
  window.dispatchEvent(event);
};

// Pages listen for events
useEffect(() => {
  const handleAction = () => performAction();
  window.addEventListener('trigger-action-name', handleAction);
  return () => window.removeEventListener('trigger-action-name', handleAction);
}, []);
```

## Styling System

Both components share a consistent glassmorphism design system:

### CSS Classes

```css
.floating-nav-glass {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark .floating-nav-glass {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.floating-nav-enter {
  animation: floating-nav-appear 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Theme Integration

- Automatic theme detection and switching
- Theme-aware color tokens (`bg-muted`, `text-foreground`, `border-border`)
- Smooth transitions between light and dark modes
- Consistent with app-wide theme system

## Accessibility

### Keyboard Navigation
- Full tab navigation through all interactive elements
- Enter/Space activation for buttons and links
- Escape key to close expanded states
- Arrow keys for menu navigation

### Screen Reader Support
- Proper ARIA labels and roles (`button`, `navigation`, `menu`)
- Descriptive text for all actions and states
- Status announcements for state changes
- Semantic HTML structure with landmarks

### Focus Management
- Visible focus indicators with high contrast
- Logical tab order following visual layout
- Focus trapping in expanded navigation state
- Return focus to trigger on close

## Performance Optimizations

- **Lazy Loading**: Dropdown menus and expanded content load on demand
- **Debounced Scroll**: Scroll handlers use debouncing to prevent excessive updates
- **Memoized Components**: React.memo prevents unnecessary re-renders
- **Event Delegation**: Efficient event handling for multiple interactive elements

## Mobile Responsiveness

### Touch Interactions
- Minimum 44px touch targets for all interactive elements
- Touch-friendly spacing and padding
- Haptic feedback for supported devices
- Swipe gestures for future enhancement

### Responsive Design
- Mobile-first approach with progressive enhancement
- Adaptive layouts for different screen sizes
- Optimized positioning for mobile viewports
- Performance optimizations for mobile networks

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 87+, Safari 14+, Edge 88+
- **Backdrop Filter**: Graceful fallbacks for older browsers
- **Progressive Enhancement**: Core functionality works without advanced features
- **Polyfills**: Automatic polyfills for missing features

## Migration Guide

### From Traditional Sidebar

1. **Remove Sidebar Component**
   ```tsx
   // Before
   <DashboardSidebar />
   
   // After - Remove completely
   ```

2. **Update Layout Structure**
   ```tsx
   // Before
   <div className="flex h-screen">
     <DashboardSidebar />
     <main className="flex-1">{children}</main>
   </div>
   
   // After
   <div className="min-h-screen bg-background">
     <main className="w-full">
       <div className="container mx-auto px-4 py-6 pb-24">
         {children}
       </div>
     </main>
     <FloatingNavigation />
     <FloatingSidebar />
   </div>
   ```

3. **Adjust Content Padding**
   - Remove left padding for sidebar space
   - Add bottom padding for floating navigation
   - Update responsive breakpoints

## Future Enhancements

### Planned Features
- **Gesture Support**: Swipe gestures for mobile navigation
- **Voice Commands**: Accessibility-focused voice navigation
- **Customizable Layout**: User-configurable navigation items
- **Quick Search**: Integrated global search functionality
- **Notification Center**: In-navigation notification system

### Advanced Interactions
- **Drag & Drop**: Reorder navigation items
- **Context Menus**: Right-click actions for power users
- **Keyboard Shortcuts**: Customizable shortcut system
- **Multi-Selection**: Batch operations support

This navigation system provides a modern, efficient, and accessible way to navigate the Noto application while maintaining immersive content experiences and supporting both desktop and mobile workflows.