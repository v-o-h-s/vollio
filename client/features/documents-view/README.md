# File Explorer Feature

A comprehensive file explorer interface for managing files and folders with drag-and-drop, multi-selection, breadcrumb navigation, and multiple view modes.

## Features

### ✨ Core Functionality

- **Breadcrumb Navigation** - Navigate through folder hierarchy with visual path display
- **Multiple View Modes** - Grid, List, Compact, and Details views
- **Drag-and-Drop** - Move files and folders by dragging them into folders
- **Multi-Selection** - Select multiple items with Ctrl+Click or Shift+Click
- **Context Menus** - Right-click actions for files and folders
- **Keyboard Shortcuts** - Ctrl+A (select all), Delete (delete items), Escape (clear selection)
- **Search & Filters** - Search by name and filter by file type and source

### 🎨 View Modes

1. **Grid View** - Card-based grid layout with file/folder icons
2. **List View** - Row-based list with inline metadata
3. **Compact View** - Dense list for maximum items per screen
4. **Details View** - Full table with all metadata columns

### 🔧 Actions

- Create new folders
- Rename files and folders
- Move files and folders between directories
- Delete files and folders (with cascade delete for folders)
- Upload files (coming soon)
- Open files in appropriate viewer

## Architecture

### Component Structure

```bash
features/files-view/
├── FilesDirectoryViewer.tsx         # Main container component
├── components/
│   ├── Breadcrumb.tsx              # Path navigation
│   ├── ContextMenu.tsx             # Right-click menu
│   ├── FileCard.tsx                # File display card (draggable)
│   ├── FolderCard.tsx              # Folder display card (draggable + droppable)
│   ├── FilesToolbar.tsx            # Search, view toggle, filters
│   ├── views/
│   │   ├── GridView.tsx            # Grid layout
│   │   ├── ListView.tsx            # List layout
│   │   ├── CompactView.tsx         # Dense list layout
│   │   └── DetailsView.tsx         # Table layout
│   └── dialogs/
│       ├── CreateFolderDialog.tsx  # Create new folder
│       ├── RenameDialog.tsx        # Rename file/folder
│       └── MoveItemDialog.tsx      # Move to different folder
├── hooks/
│   ├── useFilesViewState.ts        # State management & selection
│   ├── useBreadcrumbNavigation.ts  # Path calculation
│   ├── useContextMenu.ts           # Context menu state
│   ├── useDragAndDrop.ts           # Drag-drop logic
│   └── useFileExplorerShortcuts.ts # Keyboard shortcuts
└── index.ts                        # Public API exports
```

### State Management

- **Redux Toolkit Query** - Server state (files, folders)
- **Local React State** - UI state (view mode, selection, dialogs)
- **Custom Hooks** - Reusable logic (drag-drop, breadcrumbs, shortcuts)

### Drag-and-Drop Implementation

Uses `@dnd-kit` library:

- Files and folders are draggable
- Folders are droppable targets
- Visual feedback during drag (opacity, highlight)
- Drag overlay shows item being moved
- Prevents invalid operations (e.g., folder into itself)

### Multi-Selection

- **Single Click** - Select one item (replaces previous selection)
- **Ctrl+Click** - Toggle individual item selection
- **Shift+Click** - Select range between last selected and clicked item
- **Ctrl+A** - Select all visible items
- **Click Empty Area** - Clear all selections
- **Escape** - Clear all selections

## API Integration

### RTK Query Endpoints

```typescript
// Folders
useGetAllFoldersQuery()
useCreateFolderMutation()
useUpdateFolderMutation()
useDeleteFolderMutation()

// Files
useGetAllFilesQuery()
useRenameFileMutation()
useMoveFileMutation()
useDeleteFileMutation()
```

### Server API Endpoints

```bash
GET    /api/v1/folders/           # Get all folders
POST   /api/v1/folders/           # Create folder
GET    /api/v1/folders/:id        # Get folder by ID
PUT    /api/v1/folders/:id        # Update folder
DELETE /api/v1/folders/:id        # Delete folder (with cascade)

GET    /api/v1/files/             # Get all files
POST   /api/v1/files/rename/:id   # Rename file
POST   /api/v1/files/move/:id     # Move file
DELETE /api/v1/files/:id          # Delete file
```

## Usage

### Basic Usage

```tsx
import { FilesDirectoryViewer } from "@/features/files-view";

export default function FilesPage() {
  return <FilesDirectoryViewer />;
}
```

### Using Individual Components

```tsx
import {
  Breadcrumb,
  GridView,
  useFilesViewState,
  useBreadcrumbNavigation,
} from "@/features/files-view";

export function CustomFileExplorer() {
  const {
    currentFolder,
    setCurrentFolder,
    filteredFiles,
    filteredFolders,
    isItemSelected,
    toggleItemSelection,
  } = useFilesViewState(files, folders);

  const { breadcrumbPath } = useBreadcrumbNavigation({
    currentFolder,
    folders,
  });

  return (
    <div>
      <Breadcrumb
        path={breadcrumbPath}
        onNavigate={setCurrentFolder}
      />
      <GridView
        folders={filteredFolders}
        files={filteredFiles}
        isItemSelected={isItemSelected}
        onItemSelect={toggleItemSelection}
        // ... other props
      />
    </div>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+A` or `Cmd+A` | Select all visible items |
| `Delete` or `Cmd+Backspace` | Delete selected items |
| `Escape` | Clear selection and close menus |
| `Double-click folder` | Navigate into folder |
| `Double-click file` | Open file |

## Context Menu Actions

### Folder Actions

- **Open** - Navigate into the folder
- **Rename** - Change folder name
- **Move** - Move to different parent folder
- **Delete** - Delete folder and all contents

### File Actions

- **Open** - Open file in viewer
- **Rename** - Change filename
- **Move** - Move to different folder
- **Delete** - Delete file

### Empty Area Actions

- **New Folder** - Create folder in current directory
- **Upload Files** - Upload files to current directory

## Styling

Uses Tailwind CSS and shadcn/ui components:

- Responsive grid layouts
- Dark mode support
- Smooth transitions and animations
- Accessible focus states
- Loading and error states

## Performance Considerations

- **Memoized Filtering** - `useMemo` for expensive filter operations
- **Optimistic Updates** - Immediate UI feedback before server confirmation
- **Tag-based Caching** - RTK Query invalidates affected data only
- **Virtual Scrolling** - (Future) For large directories
- **Debounced Search** - (Future) Reduce API calls during typing

## Future Enhancements

- [ ] File upload with progress tracking
- [ ] Bulk operations (move/delete multiple at once)
- [ ] File preview/thumbnails
- [ ] Sorting options (name, size, date)
- [ ] Folder tree sidebar
- [ ] Copy/paste functionality
- [ ] Undo/redo operations
- [ ] Starred/favorite folders
- [ ] Folder sharing/permissions
- [ ] Advanced search with filters

## Testing

TODO: Add testing documentation

## Troubleshooting

### Items not showing after create/move
- Check RTK Query tag invalidation
- Verify server response format matches expected types

### Drag-and-drop not working
- Ensure `@dnd-kit` sensors are configured
- Check that items have unique IDs
- Verify drag data is properly typed

### Selection not clearing
- Check keyboard shortcut handler is enabled
- Verify `clearSelection` is called on empty area clicks

## Contributing

When adding new features:
1. Follow existing patterns for hooks and components
2. Update this README with new functionality
3. Add TypeScript types for all new interfaces
4. Test with both mouse and keyboard interactions
5. Ensure accessibility (ARIA labels, keyboard navigation)
