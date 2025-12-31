import { JSONContent } from "@tiptap/core";

// Helper to extract text from Tiptap JSONContent
export const extractText = (node: JSONContent): string => {
  if (node.text) return node.text;
  if (!node.content) return "";

  const contentText = node.content.map(extractText).join("");

  // Add formatting for common block types
  if (node.type === "paragraph" || node.type?.startsWith("heading")) {
    return contentText + "\n";
  }
  if (node.type === "listItem") {
    return "• " + contentText + "\n";
  }
  return contentText;
};
export const extractTextFromContent = (
  content: string | JSONContent
): string => {
  if (typeof content === "string") return content;
  if (!content.content) return "";
  return content.content
    .map((node) => {
      if (node.type === "text") return node.text;
      if (node.content) return extractTextFromContent(node);
      return "";
    })
    .join(" ");
};


  