# PDF Directory View

A comprehensive file system-style PDF management interface with drag & drop support, visual file management, and seamless Supabase integration.

## Features

### 🗂️ File System Navigation
- **Folder Structure**: Organize PDFs in a hierarchical folder system
- **Breadcrumb Navigation**: Easy navigation with clickable breadcrumb trail
- **Folder Management**: Create, rename, and delete folders
- **Nested Organization**: Support for unlimited folder depth

### 📤 Drag & Drop Upload
- **Intuitive Upload**: Drag and drop PDFs directly into folders
- **Visual Feedback**: Clear visual indicators during drag operations
- **Batch Upload**: Upload multiple files simultaneously
- **Folder Context**: Files uploaded to current folder automatically

### 👁️ Visual File Management
- **Dual View Modes**: Switch between grid and list views
- **PDF Thumbnails**: Auto-generated thumbnails for visual identification
- **File Metadata**: Display file size, upload date, and other details
- **Quick Actions**: Context menus with common file operations

### 🔍 Advanced Search & Sort
- **Real-time Search**: Instant filtering by filename
- **Multiple Sort Options**: Sort by name, date, size, or type
- **Sort Direction**: Ascending or descending order
- **Filter by Folder**: Search within specific folders

### 🔐 Secure Integration
- **Supabase Storage**: Secure file storage with signed URLs
- **Row Level Security**: Automatic user data isolation
- **Authentication**: Clerk-based user authentication
- **Activity Tracking**: Log all file operations

## Components

### Core Components

#### `PDFDirectoryView`
Main container component that orchestrates the entire file management interface.

```tsx
<PDFDirectoryView
  className="custom-styles"
  onPDFSelect={(pdf) => console.log('Selected:', pdf)}
  selectionMode={false}
  selectedPDFs={[]}
  onSelectionChange={(ids) => console.log('Selection changed:', ids)}
/>
```

**Props:**
- `className?: string` - Additional CSS classes
- `onPDFSelect?: (pdf: PDFDocument) => void` - Callback when PDF is selected
- `selectionMode?: boolean` - Enable multi-selection mode
- `selectedPDFs?: string[]` - Currently selected PDF IDs
- `onSelectionChange?: (selectedIds: string[]) => void` - Selection change callback

#### `PDFUploadZone`
Drag and drop upload interface with visual feedback.

```tsx
<PDFUploadZone
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  isDragOver={isDragOver}
  currentFolder={folderId}
/>
```

#### `PDFThumbnail`
Generates and displays PDF thumbnails with caching.

```tsx
<PDFThumbnail
  pdfId="pdf-id"
  className="w-full h-full object-cover"
  fallbackIcon={<FileText />}
/>
```

#### `PDFContextMenu`
Right-click context menu with file operations.

```tsx
<PDFContextMenu
  x={mouseX}
  y={mouseY}
  pdfId="pdf-id"
  onClose={() => setContextMenu(null)}
  onDelete={handleDelete}
  onRename={handleRename}
/>
```

### Navigation Components

#### `PDFBreadcrumb`
Breadcrumb navigation for folder hierarchy.

```tsx
<PDFBreadcrumb
  path={folderPath}
  onNavigate={(folderId) => setCurrentFolder(folderId)}
/>
```

#### `PDFSearchBar`
Search input with clear functionality.

```tsx
<PDFSearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search PDFs..."
/>
```

#### `PDFSortOptions`
Dropdown for sorting options.

```tsx
<PDFSortOptions
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={(by, order) => {
    setSortBy(by);
    setSortOrder(order);
  }}
/>
```

#### `PDFViewToggle`
Toggle between grid and list views.

```tsx
<PDFViewToggle
  viewMode={viewMode}
  onViewModeChange={setViewMode}
/>
```

### Folder Components

#### `PDFFolder`
Individual folder display component.

```tsx
<PDFFolder
  folder={folderData}
  viewMode="grid"
  onOpen={() => navigateToFolder(folder.id)}
  onRename={handleRename}
  onDelete={handleDelete}
/>
```

#### `CreateFolder`
Inline folder creation component.

```tsx
<CreateFolder
  onCreateFolder={handleCreateFolder}
  onCancel={() => setIsCreatingFolder(false)}
  viewMode="grid"
/>
```

## API Integration

### RTK Query Hooks

The PDF Directory View integrates with RTK Query for all API operations:

```tsx
// Fetch PDFs
const { data: pdfData, isLoading, error, refetch } = useGetPDFsQuery();

// Delete PDF
const [deletePDF, { isLoading: isDeleting }] = useDeletePDFMutation();

// Rename PDF
const [renamePDF, { isLoading: isRenaming }] = useRenamePDFMutation();
```

### API Endpoints

#### PDF Thumbnail Generation
```
GET /api/pdfs/[id]/thumbnail
```
Generates and returns PDF thumbnails with caching.

#### PDF Rename
```
PUT /api/pdfs/[id]/rename
Body: { filename: string }
```
Renames a PDF with validation and duplicate checking.

## Usage Examples

### Basic Implementation

```tsx
import { PDFDirectoryView } from '@/components/pdf';

export default function PDFsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">PDF Library</h1>
      <PDFDirectoryView />
    </div>
  );
}
```

### With Selection Mode

```tsx
import { PDFDirectoryView } from '@/components/pdf';
import { useState } from 'react';

export default function PDFSelector() {
  const [selectedPDFs, setSelectedPDFs] = useState<string[]>([]);

  return (
    <PDFDirectoryView
      selectionMode={true}
      selectedPDFs={selectedPDFs}
      onSelectionChange={setSelectedPDFs}
      onPDFSelect={(pdf) => {
        console.log('Selected PDF:', pdf);
      }}
    />
  );
}
```

### Custom Styling

```tsx
<PDFDirectoryView
  className="custom-pdf-directory"
  // ... other props
/>
```

```css
.custom-pdf-directory {
  /* Custom styles */
  --pdf-grid-columns: 6;
  --pdf-thumbnail-aspect: 3/4;
}
```

## Styling & Theming

The PDF Directory View supports both light and dark themes through Tailwind CSS classes:

- Uses semantic color tokens (`bg-muted`, `text-foreground`, `border-border`)
- Responsive design with mobile-first approach
- Consistent with shadcn/ui design system
- Theme-aware hover states and transitions

## Performance Considerations

### Thumbnail Caching
- Thumbnails are cached in localStorage with expiration
- Automatic cleanup of expired cache entries
- Lazy loading of thumbnails as needed

### Virtual Scrolling
For large PDF collections, consider implementing virtual scrolling:

```tsx
// Future enhancement
<VirtualizedPDFGrid
  items={filteredPDFs}
  itemHeight={200}
  containerHeight={600}
/>
```

### Search Optimization
- Debounced search input to reduce API calls
- Client-side filtering for better performance
- Indexed search for large collections

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- Focus management for modals and dropdowns
- ARIA labels and descriptions
- High contrast theme support

## Browser Support

- Modern browsers with ES2020 support
- Drag & drop API support required
- File API for upload functionality
- Local storage for caching

## Future Enhancements

### Planned Features
- [ ] Bulk operations (select multiple files)
- [ ] Advanced filtering (by date range, size, etc.)
- [ ] File preview without opening
- [ ] Folder sharing and permissions
- [ ] Integration with cloud storage providers
- [ ] Advanced search with content indexing
- [ ] File versioning and history
- [ ] Collaborative folder management

### Performance Improvements
- [ ] Virtual scrolling for large collections
- [ ] Progressive loading of thumbnails
- [ ] Background thumbnail generation
- [ ] Optimized caching strategies

## Contributing

When contributing to the PDF Directory View:

1. Follow the established component patterns
2. Maintain TypeScript strict mode compliance
3. Add proper error handling and loading states
4. Include accessibility features
5. Write comprehensive tests
6. Update documentation

## Dependencies

### Required Packages
```json
{
  "pdf-lib": "^1.17.1",
  "sharp": "^0.32.6",
  "@reduxjs/toolkit": "^1.9.7",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.294.0"
}
```

### Peer Dependencies
```json
{
  "react": "^18.0.0",
  "next": "^14.0.0",
  "@clerk/nextjs": "^4.0.0",
  "@supabase/supabase-js": "^2.0.0"
}
```

## License

This component is part of the Noto PDF Annotation App and follows the same licensing terms.