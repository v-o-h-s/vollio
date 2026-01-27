"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  ArrowRight,
  LifeBuoy,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Headphones,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <LifeBuoy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Help & Support
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            We're here to help you get the most out of Vollio.
          </p>
        </div>

        <Tabs
          defaultValue="general"
          orientation="vertical"
          className="flex flex-col md:flex-row gap-8 w-full min-h-[600px]"
        >
          {/* Sidebar Navigation */}
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent gap-1 p-0 justify-start items-stretch border-none">
            <TabsTrigger
              value="general"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium text-sm">General Support</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="bug"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Bug className="w-4 h-4" />
                <span className="font-medium text-sm">Report a Bug</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="feature"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium text-sm">Suggest a Feature</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>

            <TabsTrigger
              value="faq"
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]",
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium text-sm">FAQs</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
            </TabsTrigger>
          </TabsList>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0 h-full">
            <TabsContent value="general" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MessageCircle className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    General Support
                  </CardTitle>
                  <CardDescription>
                    Have a question or need help with something? Reach out to
                    our team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Separator className="opacity-50" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What do you need help with?"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        className="bg-background/50 min-h-[150px] resize-none"
                      />
                    </div>
                    <Button className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </Button>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">Email us</p>
                        <p className="text-muted-foreground">
                          support@vollio.com
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10">
                        <Headphones className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">Priority Support</p>
                        <p className="text-muted-foreground">
                          Available for Pro users
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bug" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Bug className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Report a Bug
                  </CardTitle>
                  <CardDescription>
                    Help us improve by reporting technical issues you've
                    encountered.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Separator className="opacity-50" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bug-title">Issue Title</Label>
                      <Input
                        id="bug-title"
                        placeholder="Briefly describe the bug"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bug-desc">
                        Description & Steps to Reproduce
                      </Label>
                      <Textarea
                        id="bug-desc"
                        placeholder="What happened? What were you doing? Any error messages?"
                        className="bg-background/50 min-h-[150px] resize-none"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2"
                    >
                      <Bug className="w-4 h-4" />
                      Submit Bug Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feature" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Lightbulb className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Suggest a Feature
                  </CardTitle>
                  <CardDescription>
                    Have an idea that would make Vollio even better? We love
                    hearing from you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Separator className="opacity-50" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feature-title">Feature Name</Label>
                      <Input
                        id="feature-title"
                        placeholder="What's your big idea?"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature-desc">How would it work?</Label>
                      <Textarea
                        id="feature-desc"
                        placeholder="Describe the feature and why it would be useful..."
                        className="bg-background/50 min-h-[150px] resize-none"
                      />
                    </div>
                    <Button className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none">
                      <Lightbulb className="w-4 h-4" />
                      Submit Suggestion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <HelpCircle className="w-48 h-48" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Frequently Asked Questions
                  </CardTitle>
                  <CardDescription>
                    Find quick answers to common questions about Vollio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Separator className="opacity-50" />

                  <div className="space-y-4">
                    {[
                      {
                        q: "How do I create a new quiz?",
                        a: "Navigate to the Knowledge Test tab and click 'New Quiz'. You can then select a document and configure your parameters.",
                      },
                      {
                        q: "Can I use Vollio offline?",
                        a: "Currently Vollio requires an internet connection to sync your notes and access AI features.",
                      },
                      {
                        q: "Is my data secure?",
                        a: "Yes, we use industry-standard encryption and Supabase's secure infrastructure to protect your information.",
                      },
                    ].map((faq, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2"
                      >
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          {faq.q}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}

                    <div className="mt-8 p-6 rounded-[32px] bg-primary/5 border border-primary/20 text-center">
                      <p className="text-sm font-medium mb-4">
                        Still have questions?
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-xl px-6 border-primary/20 text-primary hover:bg-primary/5"
                      >
                        Visit Help Center
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
