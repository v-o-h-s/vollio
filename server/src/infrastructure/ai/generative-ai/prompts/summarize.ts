export const summarizeDocumentPromptGenerator = (
  documentText: string,
  previousSummary?: string
) => {
  const contextText = previousSummary
    ? `PREVIOUS CONTEXT SUMMARY:\n${previousSummary}\n\nCURRENT CONTENT TO ADD:\n${documentText}`
    : documentText;

  return `SYSTEM INSTRUCTION:
    You are a document summarization engine. Your task is to maintain and update a concise, clear summary of a document as more content is provided.

    RULES:
    - Capture main ideas and key points.
    - If a PREVIOUS CONTEXT SUMMARY is provided, integrate the CURRENT CONTENT TO ADD into it, refining the overall summary.
    - Do NOT just append; merge information logically.
    - Output ONLY valid JSON.
    - Use Markdown for formatting if necessary (e.g., bullet points) within the JSON string.

    INPUT CONTENT:
    ${contextText}

    OUTPUT FORMAT:
    Return ONLY valid JSON with this structure:
    {
      "summary": "string (The updated cumulative summary of the document so far)"
    }
  `;
};
