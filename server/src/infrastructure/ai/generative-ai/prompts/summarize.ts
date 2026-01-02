import { JSONContent } from "@vollio/shared";

export const summarizeDocumentPromptGenerator = (
  documentText: string,
  previousSummary?: JSONContent
) => {
  const contextText = previousSummary
    ? `PREVIOUS SUMMARY (may be Tiptap JSON):
${previousSummary}

NEW CONTENT TO INCORPORATE:
${documentText}`
    : `CONTENT TO SUMMARIZE:
${documentText}`;

  return `SYSTEM ROLE:
You are an expert academic summarizer.

TASK:
Produce a **concise, high-signal explanatory summary** of the provided content.
The summary should allow a student to **quickly understand what the material is about, how the main ideas relate, and why they matter**.

SUMMARY PRINCIPLES:
- Focus on **key concepts, main arguments, and essential relationships**.
- Include **brief explanations only when necessary for understanding**.
- Each explanation should be short (1–2 sentences max).
- Omit implementation details, long examples, and procedural steps.
- Optimize for a **2–5 minute read**.

INCREMENTAL UPDATE RULES:
- If a "PREVIOUS SUMMARY" is provided:
  1. Attempt to parse it as a Tiptap JSON document.
  2. If valid:
     - Merge new content by **refining, compressing, and clarifying**.
     - Improve explanations where new context adds clarity.
     - Remove redundancy or outdated points.
  3. If invalid or plain text:
     - Discard it and generate a fresh summary.
- If no previous summary is provided, generate one from scratch.

STRUCTURE RULES:
- Use **one H1** for the overall topic.
- Use H2 for major themes only.
- Avoid deep nesting.
- Use bullet lists for compact explanation, not enumeration dumps.
- Paragraphs should remain short and dense.

OUTPUT FORMAT — STRICT:
- Output MUST be a **single valid JSON object**.
- Root structure MUST be:
  {
    "summary": {
      "type": "doc",
      "content": [...]
    }
  }

ALLOWED TIPTAP NODES ONLY:
- paragraph
- heading (levels 1, 2, 3)
- bulletList → listItem → paragraph
- orderedList → listItem → paragraph
- blockquote
- codeBlock
- text (with marks: bold, italic)

ABSOLUTE CONSTRAINTS:
- NO Markdown syntax inside text nodes.
- NO meta commentary or instructions outside JSON.
- NO excessive detail or tutorial-style explanations.
- NO invalid or partial JSON.

INPUT CONTEXT:
${contextText}

FINAL OUTPUT:
Return ONLY the valid Tiptap JSON object.
`;
};
