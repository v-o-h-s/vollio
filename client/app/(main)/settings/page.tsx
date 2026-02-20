"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setVollNotesFontSize,
  setVollAiFontSize,
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
  CreditCard,
  Zap,
  BarChart3,
} from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
import { HiTag as Tags } from "react-icons/hi2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TagManagement } from "./components/TagManagement";
import { UpgradeButton } from "@/components/billing/UpgradeButton";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { vollNotesFontSize, vollAiFontSize } = useAppSelector(
    (state) => state.settings,
  );

  const handleVollNotesFontSizeChange = (value: number[]) => {
    dispatch(setVollNotesFontSize(value[0]));
  };

  const handleVollAiFontSizeChange = (value: number[]) => {
    dispatch(setVollAiFontSize(value[0]));
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
          id="settings-page-tabs"
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4" />
                <span className="font-medium text-sm">Voll-notes</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="highlights"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4" />
                <span className="font-medium text-sm">Voll-ai</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="billing"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium text-sm">Billing</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                      <button className="px-3 py-1.5 text-xs rounded-md bg-background shadow-sm font-medium cursor-pointer">
                        Auto
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
                        Light
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer">
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
                    Voll-notes Preferences
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
                          Voll-notes Font Size
                        </Label>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Adjust the reading and editing font size of your
                          voll-notes.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
                          {vollNotesFontSize}px
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Slider
                        defaultValue={[vollNotesFontSize]}
                        value={[vollNotesFontSize]}
                        max={32}
                        min={12}
                        step={1}
                        onValueChange={handleVollNotesFontSizeChange}
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
                        style={{ fontSize: `${vollNotesFontSize}px` }}
                      >
                        <h4
                          className="font-bold mb-3 text-foreground transition-all duration-300"
                          style={{
                            fontSize: `${vollNotesFontSize * 1.5}px`,
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
                  <CardTitle className="text-2xl font-bold">Voll-ai</CardTitle>
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
                          Voll-ai Font Size
                        </Label>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Adjust the font size for the Voll-ai chat and
                          responses.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
                          {vollAiFontSize}px
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Slider
                        defaultValue={[vollAiFontSize]}
                        value={[vollAiFontSize]}
                        max={24}
                        min={10}
                        step={1}
                        onValueChange={handleVollAiFontSizeChange}
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
                        Pro Voll-ai Active
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

            <TabsContent value="billing" className="mt-0 outline-none">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <CreditCard className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Billing & Usage
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and monitor your resource usage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <Separator className="opacity-50" />

                  {/* Current Plan Card */}
                  <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Zap className="w-24 h-24 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/30">
                          Current Plan
                        </div>
                        <h3 className="text-4xl font-black tracking-tight mt-2 flex items-baseline gap-2">
                          Free Tier
                          <span className="text-base font-normal text-muted-foreground">
                            $0/mo
                          </span>
                        </h3>
                        <p className="text-muted-foreground font-medium max-w-sm">
                          You are currently on the free version. Upgrade to Pro
                          for unlimited AI and more storage.
                        </p>
                      </div>
                      <UpgradeButton className="rounded-2xl h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] transition-all duration-300 group" />
                    </div>
                  </div>

                  {/* Usage Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Token Usage */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-accent/10 backdrop-blur-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Bot className="w-5 h-5 text-orange-500" />
                          </div>
                          <span className="font-bold text-sm">
                            AI Tokens Usage
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          2,450 / 10,000
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            style={{ width: "24.5%" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                          <span>Used</span>
                          <span>24.5% Used</span>
                        </div>
                      </div>
                    </div>

                    {/* Storage Usage */}
                    <div className="p-6 rounded-2xl border border-border/50 bg-accent/10 backdrop-blur-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="font-bold text-sm">
                            Storage Usage
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          12.4 MB / 50 MB
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: "24.8%" }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                          <span>Used</span>
                          <span>24.8% Used</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Payment History Mockup */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Recent Activity
                    </h4>
                    <div className="rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="p-4 flex items-center justify-between bg-card/10 hover:bg-card/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs">
                              {i === 1 ? "MAY" : "APR"}
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                Standard Monthly Subscription
                              </p>
                              <p className="text-xs text-muted-foreground">
                                May {10 + i}, 2024 • Invoice #VOL-{3456 + i}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black">$0.00</p>
                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Paid
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-primary rounded-xl text-xs font-bold py-6"
                    >
                      View all transactions
                    </Button>
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
