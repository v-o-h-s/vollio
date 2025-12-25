export function explainTextPromptGenerator(text: string) {
  return `
    You are an expert educator. Explain the following text clearly and concisely.
    Provide the explanation in the Tiptap JSONContent format.
    
    IMPORTANT:
    - Use "bulletList" for unordered lists.
    - Use "orderedList" for numbered lists.
    - Use "listItem" for items within a list.
    
    The response MUST be a valid JSON object with the following structure:
    {
      "title": "A short descriptive title for the explanation",
      "content": {
        "type": "doc",
        "content": [
          {
            "type": "heading",
            "attrs": { "level": 2 },
            "content": [{ "type": "text", "text": "Explanation" }]
          },
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "The explanation goes here..." }]
          }
        ]
      }
    }

    Text to explain:
    "${text}"
    `;
}
