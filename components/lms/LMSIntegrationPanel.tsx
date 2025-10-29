"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  School, 
  BookOpen, 
  Settings, 
  Info,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { GoogleClassroomConnect } from "./GoogleClassroomConnect";
import { CourseBrowser } from "./CourseBrowser";
import { useGetLMSConnectionStatusQuery } from "@/lib/store/apiSlice";

interface LMSIntegrationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContentImported?: (courseId: string, contentType: string, contentId: string) => void;
}

export function LMSIntegrationPanel({ isOpen, onClose, onContentImported }: LMSIntegrationPanelProps) {
  const [activeTab, setActiveTab] = useState("connect");
  
  const { data: googleConnectionStatus } = useGetLMSConnectionStatusQuery("google");
  const isGoogleConnected = googleConnectionStatus?.isConnected || false;

  const handleConnectionChange = (isConnected: boolean) => {
    if (isConnected) {
      // Switch to browse tab when successfully connected
      setActiveTab("browse");
    }
  };

  const handleContentImport = (courseId: string, contentType: string, contentId: string) => {
    onContentImported?.(courseId, contentType, contentId);
    // Could show a success message or update UI here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <School className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-semibold">LMS Integration</h2>
              <p className="text-sm text-muted-foreground">
                Connect to your Learning Management System
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connect" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Connect
              </TabsTrigger>
              <TabsTrigger 
                value="browse" 
                disabled={!isGoogleConnected}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Browse
                {isGoogleConnected && (
                  <Badge variant="secondary" className="ml-1">
                    <CheckCircle className="h-2 w-2 mr-1" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connect" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  Connect to your Learning Management System to import courses, assignments, and materials.
                </p>
              </div>

              {/* Google Classroom Integration */}
              <GoogleClassroomConnect onConnectionChange={handleConnectionChange} />

              {/* Future LMS integrations can be added here */}
              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Canvas
                    <Badge variant="outline">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>
                    Canvas LMS integration will be available in a future update
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Moodle
                    <Badge variant="outline">Coming Soon</Badge>
                  </CardTitle>
                  <CardDescription>
                    Moodle integration will be available in a future update
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="browse" className="space-y-6 mt-6">
              {isGoogleConnected ? (
                <CourseBrowser onContentImport={handleContentImport} />
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect to Google Classroom first to browse your courses.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">About LMS Integration</h3>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What can you do?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Import Course Materials</p>
                        <p className="text-sm text-muted-foreground">
                          Automatically import PDFs and documents from your LMS courses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Organize by Course</p>
                        <p className="text-sm text-muted-foreground">
                          Materials are automatically organized into course-specific folders
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Sync Assignments</p>
                        <p className="text-sm text-muted-foreground">
                          Import assignment materials and due dates for better organization
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Privacy & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Secure Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          We use OAuth 2.0 for secure, encrypted connections to your LMS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Read-Only Access</p>
                        <p className="text-sm text-muted-foreground">
                          We only request read permissions - we cannot modify your LMS content
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Encrypted Storage</p>
                        <p className="text-sm text-muted-foreground">
                          All authentication tokens are encrypted and securely stored
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}