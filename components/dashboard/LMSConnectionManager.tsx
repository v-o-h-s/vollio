"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  School,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  RefreshCw,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetLMSProvidersQuery,
  useCheckLMSConnectionQuery,
  useConnectToLMSMutation,
  useDisconnectLMSMutation,
} from "@/lib/store/apiSlice";

interface LMSConnectionManagerProps {
  className?: string;
}

export function LMSConnectionManager({ className }: LMSConnectionManagerProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const [connectToLMS, { isLoading: isConnecting }] = useConnectToLMSMutation();
  const [disconnectLMS, { isLoading: isDisconnecting }] =
    useDisconnectLMSMutation();

  const handleConnect = async (providerId: string) => {
    try {
      const result = await connectToLMS(providerId).unwrap();
      if (result.authUrl) {
        // Redirect to OAuth URL
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
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error disconnecting from LMS:", error);
      toast.error(error.data?.error || "Failed to disconnect from LMS");
    }
  };

  const handleRefresh = () => {
    refetchProviders();
    // Connection status will be automatically refetched when selectedProvider is set
    // No need to manually refetch if the query hasn't been started
  };

  const connectedProviders = providers.filter(p => p.status === "connected");
  const availableProviders = providers.filter(p => p.status === "disconnected");

  return (
    <div className={className}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <School className="w-4 h-4" />
            LMS Connections
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingProviders}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProviders ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Connect LMS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Learning Management System</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {isLoadingProviders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading providers...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableProviders.map((provider) => (
                        <Card
                          key={provider.id}
                          className="cursor-pointer transition-all hover:shadow-md"
                          onClick={() => handleConnect(provider.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
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
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {availableProviders.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            All available LMS providers are already connected
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProviders ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading connections...
            </div>
          ) : connectedProviders.length === 0 ? (
            <div className="text-center py-6">
              <School className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-2">No LMS Connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Learning Management System to import course materials
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect LMS
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {connectedProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <School className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <div className="flex items-center gap-2">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Connection management dialog */}
          {selectedProvider && (
            <Dialog
              open={isDialogOpen && !!selectedProvider}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedProvider(null);
                }
                setIsDialogOpen(open);
              }}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Manage {providers.find(p => p.id === selectedProvider)?.name} Connection
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {isCheckingConnection ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Checking connection...
                    </div>
                  ) : connectionStatus?.hasTokens ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Connected</p>
                          <p className="text-sm text-green-600">
                            Ready to import course materials
                          </p>
                        </div>
                      </div>
                      {connectionStatus.expiresAt && (
                        <p className="text-sm text-muted-foreground">
                          Token expires: {new Date(connectionStatus.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleConnect(selectedProvider)}
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
                          onClick={() => handleDisconnect(selectedProvider)}
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
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Not Connected</p>
                          <p className="text-sm text-yellow-600">
                            Connect to import course materials
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConnect(selectedProvider)}
                        disabled={isConnecting}
                        className="w-full"
                      >
                        {isConnecting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Connect Now
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}