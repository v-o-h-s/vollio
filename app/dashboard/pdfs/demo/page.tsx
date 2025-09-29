"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  FolderOpen, 
  Grid3X3, 
  List, 
  Upload, 
  Search,
  Download,
  Star,
  Trash2,
  Edit,
  Eye,
  MoreVertical
} from "lucide-react";

export default function PDFDirectoryDemo() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PDF Directory View Demo</h1>
        <p className="text-muted-foreground">
          Showcase of the file system-style PDF management interface
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              File System Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse PDFs in a familiar folder structure with breadcrumb navigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Drag & Drop Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Intuitive drag-and-drop interface for uploading multiple PDFs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Multiple View Modes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Switch between grid and list views with thumbnails and metadata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Advanced Search & Sort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search by filename and sort by name, date, size, or type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Demo Interface</CardTitle>
          <CardDescription>
            This demonstrates the key components of the PDF Directory View
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toolbar Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Toolbar & Navigation</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
                <span>PDFs</span>
                <span>/</span>
                <span>Documents</span>
                <span>/</span>
                <span className="font-medium text-foreground">Research Papers</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search PDFs..."
                    className="pl-10 pr-4 py-2 border rounded-md text-sm w-48"
                    disabled
                  />
                </div>
                <Button variant="outline" size="sm" disabled>
                  Sort
                </Button>
                <div className="flex border rounded-lg">
                  <Button variant="default" size="sm" className="rounded-r-none border-r">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-l-none">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" disabled>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Grid View Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Grid View with Thumbnails</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Folder Example */}
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] mb-3 bg-muted/30 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate">Research Papers</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">5 PDFs</Badge>
                      <span>2 days ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Examples */}
              {[
                { name: "Machine Learning Basics.pdf", size: "2.4 MB", date: "1 hour ago" },
                { name: "Data Science Guide.pdf", size: "5.1 MB", date: "3 hours ago" },
                { name: "AI Research Paper.pdf", size: "1.8 MB", date: "1 day ago" },
                { name: "Statistics Handbook.pdf", size: "3.7 MB", date: "2 days ago" }
              ].map((pdf, index) => (
                <Card key={index} className="cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] mb-3 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <div className="text-xs text-muted-foreground">PDF</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate" title={pdf.name}>
                        {pdf.name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pdf.size}</span>
                        <span>{pdf.date}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* List View Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">List View with Metadata</h3>
            <div className="space-y-2">
              {/* Folder in List View */}
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <div className="w-10 h-12 bg-muted/30 rounded flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Research Papers</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">5 PDFs</Badge>
                    <span>2 days ago</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" disabled>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* PDFs in List View */}
              {[
                { name: "Machine Learning Basics.pdf", size: "2.4 MB", date: "1 hour ago" },
                { name: "Data Science Guide.pdf", size: "5.1 MB", date: "3 hours ago" },
                { name: "AI Research Paper.pdf", size: "1.8 MB", date: "1 day ago" }
              ].map((pdf, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="w-10 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{pdf.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{pdf.size}</span>
                      <span>{pdf.date}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Context Menu Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Context Menu Actions</h3>
            <Card className="w-48">
              <CardContent className="p-1">
                <div className="space-y-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 px-2" disabled>
                    <Eye className="h-4 w-4" />
                    <span className="flex-1 text-left">Open</span>
                    <span className="text-xs text-muted-foreground">Enter</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 px-2" disabled>
                    <Edit className="h-4 w-4" />
                    <span className="flex-1 text-left">Rename</span>
                    <span className="text-xs text-muted-foreground">F2</span>
                  </Button>
                  <Separator className="my-1" />
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 px-2" disabled>
                    <Download className="h-4 w-4" />
                    <span className="flex-1 text-left">Download</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 px-2" disabled>
                    <Star className="h-4 w-4" />
                    <span className="flex-1 text-left">Add to Favorites</span>
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-2 h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" 
                    disabled
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="flex-1 text-left">Delete</span>
                    <span className="text-xs text-muted-foreground">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Drag & Drop Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Drag & Drop Upload Zone</h3>
            <Card className="border-2 border-dashed border-primary bg-primary/5">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Drop PDFs here to upload</h3>
                <p className="text-muted-foreground text-center">
                  Files will be uploaded to the current folder
                </p>
                <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>PDF files only</span>
                  <span>•</span>
                  <FolderOpen className="h-4 w-4" />
                  <span>Current folder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Technical Features */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>
            Key technical features and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Frontend Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• React-based component architecture</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for responsive design</li>
                <li>• shadcn/ui components with theme support</li>
                <li>• Drag & drop file handling</li>
                <li>• Context menus with keyboard shortcuts</li>
                <li>• Real-time search and filtering</li>
                <li>• Grid and list view modes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Backend Integration</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Supabase Storage with signed URLs</li>
                <li>• Row Level Security (RLS) policies</li>
                <li>• RTK Query for API management</li>
                <li>• PDF thumbnail generation</li>
                <li>• File validation and security</li>
                <li>• Activity tracking and logging</li>
                <li>• Error handling and recovery</li>
                <li>• Automatic cache invalidation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Ready to try the full experience?</h3>
          <p className="text-muted-foreground mb-4">
            Visit the actual PDF Directory to upload and manage your documents
          </p>
          <Button asChild>
            <Link href="/dashboard/pdfs">
              <FileText className="h-4 w-4 mr-2" />
              Go to PDF Library
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}