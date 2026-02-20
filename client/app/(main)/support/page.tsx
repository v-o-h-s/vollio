"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Bug,
  Lightbulb,
  MessageCircle,
  LifeBuoy,
  ChevronRight,
  Headphones,
  Mail,
  Send,
  Loader2,
  HelpCircle,
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
import { toast } from "react-toastify";
import { createClient } from "@/lib/supabase/client";

// Zod Schemas
const generalSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const bugSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const featureSchema = z.object({
  featureName: z.string().min(3, "Feature name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type GeneralFormValues = z.infer<typeof generalSchema>;
type BugFormValues = z.infer<typeof bugSchema>;
type FeatureFormValues = z.infer<typeof featureSchema>;

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Forms
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
  });

  const bugForm = useForm<BugFormValues>({
    resolver: zodResolver(bugSchema),
  });

  const featureForm = useForm<FeatureFormValues>({
    resolver: zodResolver(featureSchema),
  });

  const onSubmit = async (
    type: "general" | "bug" | "feature",
    data: GeneralFormValues | BugFormValues | FeatureFormValues,
    reset: () => void,
  ) => {
    setIsSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data,
          email: user?.email || "anonymous@vollio.com",
          name: user?.user_metadata?.full_name || "Anonymous",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl animate-in fade-in slide-in-from-bottom-4 transition-all duration-700">
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
          id="support-page-tabs"
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
                "data-[state=inactive]:hover:bg-muted/80 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
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
            {/* General Support Tab */}
            <TabsContent value="general" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  {/* Icon removed */}
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
                  <form
                    onSubmit={generalForm.handleSubmit((data) =>
                      onSubmit("general", data, generalForm.reset),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What do you need help with?"
                        className="bg-background/50"
                        {...generalForm.register("subject")}
                      />
                      {generalForm.formState.errors.subject && (
                        <p className="text-xs text-red-500">
                          {generalForm.formState.errors.subject.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        className="bg-background/50 min-h-[150px] resize-none"
                        {...generalForm.register("message")}
                      />
                      {generalForm.formState.errors.message && (
                        <p className="text-xs text-red-500">
                          {generalForm.formState.errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send Message
                    </Button>
                  </form>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">Email us</p>
                        <p className="text-muted-foreground">
                          support@vollio.xyz
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

            {/* Bug Report Tab */}
            <TabsContent value="bug" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
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
                  <form
                    onSubmit={bugForm.handleSubmit((data) =>
                      onSubmit("bug", data, bugForm.reset),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="bug-title">Issue Title</Label>
                      <Input
                        id="bug-title"
                        placeholder="Briefly describe the bug"
                        className="bg-background/50"
                        {...bugForm.register("title")}
                      />
                      {bugForm.formState.errors.title && (
                        <p className="text-xs text-red-500">
                          {bugForm.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bug-desc">
                        Description & Steps to Reproduce
                      </Label>
                      <Textarea
                        id="bug-desc"
                        placeholder="What happened? What were you doing? Any error messages?"
                        className="bg-background/50 min-h-[150px] resize-none"
                        {...bugForm.register("description")}
                      />
                      {bugForm.formState.errors.description && (
                        <p className="text-xs text-red-500">
                          {bugForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="destructive"
                      className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bug className="w-4 h-4" />
                      )}
                      Submit Bug Report
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Request Tab */}
            <TabsContent value="feature" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
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
                  <form
                    onSubmit={featureForm.handleSubmit((data) =>
                      onSubmit("feature", data, featureForm.reset),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="feature-title">Feature Name</Label>
                      <Input
                        id="feature-title"
                        placeholder="What's your big idea?"
                        className="bg-background/50"
                        {...featureForm.register("featureName")}
                      />
                      {featureForm.formState.errors.featureName && (
                        <p className="text-xs text-red-500">
                          {featureForm.formState.errors.featureName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature-desc">How would it work?</Label>
                      <Textarea
                        id="feature-desc"
                        placeholder="Describe the feature and why it would be useful..."
                        className="bg-background/50 min-h-[150px] resize-none"
                        {...featureForm.register("description")}
                      />
                      {featureForm.formState.errors.description && (
                        <p className="text-xs text-red-500">
                          {featureForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto rounded-xl px-8 py-6 font-bold flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white border-none"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lightbulb className="w-4 h-4" />
                      )}
                      Submit Suggestion
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQ Tab (Static) */}
            <TabsContent value="faq" className="mt-0 outline-none h-full">
              <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none h-full">
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
