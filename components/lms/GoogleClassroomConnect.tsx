"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  School,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  useGetLMSConnectionStatusQuery,
  useConnectToLMSMutation,
  useDisconnectLMSMutation,
} from "@/lib/store/apiSlice";
import toast from "react-hot-toast";

interface GoogleClassroomConnectProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export function GoogleClassroomConnect({
  onConnectionChange,
}: GoogleClassroomConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    data: connectionStatus,
    isLoading,
    refetch,
  } = useGetLMSConnectionStatusQuery("google");
  const [connectToLMS] = useConnectToLMSMutation();
  const [disconnectFromLMS] = useDisconnectLMSMutation();

  const isConnected = connectionStatus?.isConnected || false;
  const connectionInfo = connectionStatus?.connectionInfo;

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const result = await connectToLMS("google").unwrap();

      if (result.authUrl) {
        // Redirect to Google OAuth
        window.location.href = result.authUrl;
      } else {
        toast.success("Successfully connected to Google Classroom!");
        onConnectionChange?.(true);
        refetch();
      }
    } catch (error) {
      console.error("Failed to connect to Google Classroom:", error);
      toast.error("Failed to connect to Google Classroom. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromLMS("google").unwrap();
      toast.success("Disconnected from Google Classroom");
      onConnectionChange?.(false);
      refetch();
    } catch (error) {
      console.error("Failed to disconnect from Google Classroom:", error);
      toast.error("Failed to disconnect from Google Classroom");
    }
  };

  const handleRefreshConnection = async () => {
    try {
      await refetch();
      toast.success("Connection status refreshed");
    } catch (error) {
      toast.error("Failed to refresh connection status");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Google Classroom
          </CardTitle>
          <CardDescription>Loading connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          Google Classroom
          {isConnected && (
            <Badge variant="secondary" className="ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect to Google Classroom to import courses and assignments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully connected to Google Classroom
                {connectionInfo?.email && ` as ${connectionInfo.email}`}
                {connectionInfo?.connectedAt && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Connected on{" "}
                    {new Date(connectionInfo.connectedAt).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefreshConnection}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your Google Classroom account to import courses,
                assignments, and materials directly into Noto.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect to Google Classroom
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
