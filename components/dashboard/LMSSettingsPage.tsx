"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  RefreshCw,
  Bell,
  Folder,
  Clock,
  BarChart3,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetLMSProvidersQuery,
  useCheckLMSConnectionQuery,
  useConnectToLMSMutation,
  useDisconnectLMSMutation,
  useGetFoldersQuery,
} from "@/lib/store/apiSlice";

export function LMSSettingsPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    autoSync: false,
    syncInterval: 60, // minutes
    defaultFolder: "",
    notifications: {
      onImportComplete: true,
      onConnectionError: true,
      onTokenExpiry: true,
    },
  });

  // RTK Query hooks
  const {
    data: providers = [],
    isLoading: isLoadingProviders,
    refetch: refetchProviders,
  } = useGetLMSProvidersQuery();

  const {
    data: connectionStatus,
    isLoading: isCheckingConnection,
  } = useCheckLMSConnectionQuery(selectedProvider || "", {
    skip: !selectedProvider,
  });

  const { data: foldersData } = useGetFoldersQuery();
  const folders = foldersData?.folders || [];

  const [connectToLMS, { isLoading: isConnecting }] = useConnectToLMSMutation();
  const [disconnectLMS, { isLoading: isDisconnecting }] =
    useDisconnectLMSMutation();

  const handleConnect = async (providerId: string) => {
    try {
      const result = await connectToLMS(providerId).unwrap();
      if (result.authUrl) {
        window.location.href = result.authUrl;
      } else {
        toast.error("Failed to get connection URL");
      }
    } catch (error: any) {
      console.error("Error connecting to LMS:", error);
      toast.error(error.data?.error || "Failed to connect to LMS");
    }
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await disconnectLMS(providerId).unwrap();
      toast.success("Successfully disconnected from LMS");
      refetchProviders();
    } catch (error: any) {
      console.error("Error disconnecting from LMS:", error);
      toast.error(error.data?.error || "Failed to disconnect from LMS");
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    // In a real app, you'd save this to the backend
    toast.success("Settings updated");
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
    toast.success("Notification settings updated");
  };

  const connectedProviders = providers.filter(p => p.status === "connected");
  const availableProviders = providers.filter(p => p.status === "disconnected");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LMS Settings</h1>
          <p className="text-muted-foreground">
            Manage your Learning Management System connections and import preferences
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            refetchProviders();
            // Connection status will be automatically refetched when needed
          }}
          disabled={isLoadingProviders}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingProviders ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Connected Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5" />
            Connected LMS Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProviders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading providers...
            </div>
          ) : connectedProviders.length === 0 ? (
            <div className="text-center py-8">
              <School className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No LMS Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Learning Management System to import course materials
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <School className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        {provider.lastConnected && (
                          <span className="text-xs text-muted-foreground">
                            Last sync: {new Date(provider.lastConnected).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Reconnect
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={isDisconnecting}
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      )}
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Providers */}
      {availableProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Available LMS Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availableProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting}
                    size="sm"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Import Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Sync */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Auto Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync new course materials
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => handleSettingChange("autoSync", checked)}
            />
          </div>

          <Separator />

          {/* Sync Interval */}
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Sync Interval
            </Label>
            <Select
              value={settings.syncInterval.toString()}
              onValueChange={(value) => handleSettingChange("syncInterval", parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
                <SelectItem value="180">Every 3 hours</SelectItem>
                <SelectItem value="360">Every 6 hours</SelectItem>
                <SelectItem value="720">Every 12 hours</SelectItem>
                <SelectItem value="1440">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Default Folder */}
          <div className="space-y-2">
            <Label className="text-base flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Default Import Folder
            </Label>
            <Select
              value={settings.defaultFolder}
              onValueChange={(value) => handleSettingChange("defaultFolder", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select default folder for imports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Root folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Import Complete</Label>
              <p className="text-sm text-muted-foreground">
                Notify when files are successfully imported
              </p>
            </div>
            <Switch
              checked={settings.notifications.onImportComplete}
              onCheckedChange={(checked) => 
                handleNotificationChange("onImportComplete", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Connection Errors</Label>
              <p className="text-sm text-muted-foreground">
                Notify when LMS connection issues occur
              </p>
            </div>
            <Switch
              checked={settings.notifications.onConnectionError}
              onCheckedChange={(checked) => 
                handleNotificationChange("onConnectionError", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Token Expiry</Label>
              <p className="text-sm text-muted-foreground">
                Notify when LMS tokens are about to expire
              </p>
            </div>
            <Switch
              checked={settings.notifications.onTokenExpiry}
              onCheckedChange={(checked) => 
                handleNotificationChange("onTokenExpiry", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Download className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Total Imports</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <School className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">{connectedProviders.length}</div>
              <div className="text-sm text-muted-foreground">Connected LMS</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">-</div>
              <div className="text-sm text-muted-foreground">Last Import</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}