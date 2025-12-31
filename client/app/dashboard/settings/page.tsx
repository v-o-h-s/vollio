"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setNoterFontSize,
  setAssistantFontSize,
} from "@/lib/store/slices/settingsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Type,
  Layout,
  User,
  Shield,
  Bell,
  ChevronRight,
  Bot,
} from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
import { HiTag as Tags } from "react-icons/hi2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TagManagement } from "./components/TagManagement";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { noterFontSize, assistantFontSize } = useAppSelector(
    (state) => state.settings
  );

  const handleNoterFontSizeChange = (value: number[]) => {
    dispatch(setNoterFontSize(value[0]));
  };

  const handleAssistantFontSizeChange = (value: number[]) => {
    dispatch(setAssistantFontSize(value[0]));
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs
          defaultValue="appearance"
          orientation="vertical"
          className="flex flex-col md:flex-row gap-8 w-full min-h-[600px]"
        >
          {/* Sidebar List */}
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent gap-1 p-0 justify-start items-stretch border-none">
            <TabsTrigger
              value="appearance"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Layout className="w-4 h-4" />
                <span className="font-medium text-sm">Appearance</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="notes"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4" />
                <span className="font-medium text-sm">Notes</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="highlights"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Tags className="w-4 h-4" />
                <span className="font-medium text-sm">Highlights</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="ai"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm">Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span className="font-medium text-sm">Notifications</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4" />
                <span className="font-medium text-sm">Security</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>
          </TabsList>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <TabsContent value="appearance" className="mt-0 outline-none">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Layout className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize how Vollio looks on your device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Separator className="opacity-50" />
                  <div className="flex items-center justify-between group py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold">
                        Theme Mode
                      </Label>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Switch between light and dark modes or follow your
                        system preference.
                      </p>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg">
                      <button className="px-3 py-1.5 text-xs rounded-md bg-background shadow-sm font-medium">
                        Auto
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-foreground transition-colors font-medium">
                        Light
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-foreground transition-colors font-medium">
                        Dark
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 outline-none">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Type className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Note Preferences
                  </CardTitle>
                  <CardDescription>
                    Fine-tune the editing experience for your notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10">
                  <Separator className="opacity-50" />
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          Noter Font Size
                        </Label>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Adjust the reading and editing font size of your
                          noter.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
                          {noterFontSize}px
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Slider
                        defaultValue={[noterFontSize]}
                        value={[noterFontSize]}
                        max={32}
                        min={12}
                        step={1}
                        onValueChange={handleNoterFontSizeChange}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Condensed
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Spacious
                        </span>
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border/50 bg-accent/20 backdrop-blur-sm shadow-inner transition-all duration-500 group relative">
                      <div className="absolute top-3 left-4 flex gap-1.5 opacity-30">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div
                        className="p-8 pt-10"
                        style={{ fontSize: `${noterFontSize}px` }}
                      >
                        <h4
                          className="font-bold mb-3 text-foreground transition-all duration-300"
                          style={{
                            fontSize: `${noterFontSize * 1.5}px`,
                            lineHeight: "1.2",
                          }}
                        >
                          The Art of Note-Taking
                        </h4>
                        <p className="text-foreground/80 leading-relaxed font-medium">
                          Note-taking is more than just recording information;
                          it's about
                          <span className="text-primary font-bold">
                            {" "}
                            synthesis
                          </span>{" "}
                          and
                          <span className="text-primary font-bold">
                            {" "}
                            retention
                          </span>
                          . With Vollio, your notes are seamlessly linked to
                          your documents, creating a powerful knowledge graph
                          that grows with you.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Auto-save Content
                      </Label>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Saves your progress every few seconds after you stop
                        typing.
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-primary rounded-full relative shadow-inner">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="highlights" className="mt-0 outline-none">
              <TagManagement />
            </TabsContent>

            <TabsContent value="ai" className="mt-0 outline-none">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Bot className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Configure how your AI companion interacts with you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <Separator className="opacity-50" />

                  {/* Assistant Font Size */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Type className="w-4 h-4 text-purple-500" />
                          Assistant Font Size
                        </Label>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Adjust the font size for the AI Assistant chat and
                          responses.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
                          {assistantFontSize}px
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Slider
                        defaultValue={[assistantFontSize]}
                        value={[assistantFontSize]}
                        max={24}
                        min={10}
                        step={1}
                        onValueChange={handleAssistantFontSizeChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* AI Status Card */}
                  <div className="mt-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <RobotIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Pro Assistant Active
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You're using the premium AI engine. All responses are
                        processed with high priority and enhanced context.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-0 outline-none">
              <Card className="border-none bg-card/20 backdrop-blur-md shadow-xl py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-xl font-bold">Profile Details</h3>
                <p className="text-muted-foreground mt-2">
                  Manage your personal information and avatar.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl px-8 border-primary/20 text-primary hover:bg-primary/5"
                >
                  Coming Soon
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 outline-none">
              <Card className="border-none bg-card/20 backdrop-blur-md shadow-xl py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-xl font-bold">Notifications</h3>
                <p className="text-muted-foreground mt-2">
                  Control how and when you receive alerts.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl px-8 border-primary/20 text-primary hover:bg-primary/5"
                >
                  Coming Soon
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 outline-none">
              <Card className="border-none bg-card/20 backdrop-blur-md shadow-xl py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
                  <Shield className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-xl font-bold">Security & Privacy</h3>
                <p className="text-muted-foreground mt-2">
                  Manage your password and session security.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl px-8 border-primary/20 text-primary hover:bg-primary/5"
                >
                  Coming Soon
                </Button>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
