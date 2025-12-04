"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Unlink, ExternalLink } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface LinkDialogProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkDialog({ editor, isOpen, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if we're editing an existing link
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      const linkMark = editor.getAttributes("link");

      if (linkMark.href) {
        // Editing existing link
        setUrl(linkMark.href);
        setText(selectedText || linkMark.href);
        setIsEditing(true);
      } else {
        // Creating new link
        setText(selectedText);
        setUrl("");
        setIsEditing(false);
      }
    }
  }, [isOpen, editor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (isEditing) {
      // Update existing link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: finalUrl })
        .run();
    } else {
      // Create new link
      if (text.trim()) {
        // If we have text, insert it with the link
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${finalUrl}">${text}</a>`)
          .run();
      } else {
        // If no text, just set the link on selection
        editor.chain().focus().setLink({ href: finalUrl }).run();
      }
    }

    handleClose();
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    handleClose();
  };

  const handleClose = () => {
    setUrl("");
    setText("");
    setIsEditing(false);
    onClose();
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            {isEditing ? "Edit Link" : "Add Link"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="text">Display Text (optional)</Label>
              <Input
                id="text"
                type="text"
                placeholder="Link text"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLink}
                  className="text-destructive hover:text-destructive"
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!url.trim() || !isValidUrl(url)}>
                <ExternalLink className="h-4 w-4 mr-1" />
                {isEditing ? "Update" : "Add"} Link
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
