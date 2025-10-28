import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface AIGenerationSettings {
  numberOfCards: number;
  difficulty: "Easy" | "Medium" | "Hard";
  focusAreas: string[];
  includeHints: boolean;
  cardStyle: "Definition" | "Question-Answer" | "Fill-in-blank" | "Mixed";
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, settings }: { documentId: string; settings: AIGenerationSettings } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const supabaseClient = getAuthenticatedSupabaseClient(userId);

    // Get document content
    const { data: document, error: docError } = await supabaseClient
      .from("pdfs")
      .select("title, document_chunks(content)")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Extract text content from chunks
    const textContent = document.document_chunks
      ?.map((chunk: any) => chunk.content)
      .join(" ") || "";

    if (!textContent.trim()) {
      return NextResponse.json({ error: "No content found in document" }, { status: 400 });
    }

    // Generate flashcards based on content
    const flashcards = generateFlashcardsFromContent(textContent, settings);

    return NextResponse.json({
      success: true,
      flashcards,
      message: `Generated ${flashcards.length} flashcards from document`,
    });
  } catch (error) {
    console.error("Error generating flashcards from document:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}

function generateFlashcardsFromContent(
  content: string,
  settings: AIGenerationSettings
): FlashcardItem[] {
  // This is a simplified implementation
  // In a real app, you would use AI/ML services like OpenAI, Anthropic, etc.
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const flashcards: FlashcardItem[] = [];
  
  const cardTypes = settings.cardStyle === "Mixed" 
    ? ["Definition", "Question-Answer", "Fill-in-blank"]
    : [settings.cardStyle];

  for (let i = 0; i < Math.min(settings.numberOfCards, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const cardType = cardTypes[i % cardTypes.length];
    
    let front = "";
    let back = "";
    let hint = "";

    switch (cardType) {
      case "Definition":
        // Extract key terms for definition cards
        const words = sentence.split(" ");
        const keyWord = words.find(w => w.length > 6) || words[0];
        front = `What is ${keyWord}?`;
        back = sentence;
        if (settings.includeHints) {
          hint = `Think about ${keyWord.toLowerCase()}`;
        }
        break;
        
      case "Question-Answer":
        front = `Explain: ${sentence.substring(0, 50)}...`;
        back = sentence;
        if (settings.includeHints) {
          hint = "Consider the main concept being discussed";
        }
        break;
        
      case "Fill-in-blank":
        const importantWords = sentence.split(" ").filter(w => w.length > 5);
        if (importantWords.length > 0) {
          const wordToBlank = importantWords[0];
          front = sentence.replace(wordToBlank, "______");
          back = wordToBlank;
          if (settings.includeHints) {
            hint = `This word starts with "${wordToBlank.charAt(0)}"`;
          }
        } else {
          front = sentence;
          back = "Key concept from the text";
        }
        break;
    }

    flashcards.push({
      id: `generated-${i + 1}`,
      front,
      back,
      hint: settings.includeHints ? hint : undefined,
    });
  }

  return flashcards;
}