import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling/server-error-handling";

interface SummaryRequest {
  documents: Array<{
    id: string;
    title: string;
    filename: string;
    selectedPages?: number[];
  }>;
  settings: {
    summaryType: "brief" | "detailed" | "bullet-points" | "executive";
    length: "short" | "medium" | "long";
    focus: "key-points" | "methodology" | "conclusions" | "comprehensive";
    tone: "academic" | "professional" | "casual" | "technical";
  };
  customPrompt?: string;
}

async function POST(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body: SummaryRequest = await request.json();
    const { documents, settings, customPrompt } = body;

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "At least one document must be selected" },
        { status: 400 }
      );
    }

    const supabaseClient = getAuthenticatedSupabaseClient();

    // Fetch document content from the database
    const documentIds = documents.map(doc => doc.id);
    const { data: pdfData, error: pdfError } = await supabaseClient
      .from("pdfs")
      .select("id, title, filename, extracted_text, document_chunks(content)")
      .in("id", documentIds)
      .eq("user_id", userId);

    if (pdfError) {
      console.error("Error fetching documents:", pdfError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    if (!pdfData || pdfData.length === 0) {
      return NextResponse.json(
        { error: "No documents found" },
        { status: 404 }
      );
    }

    // Extract text content from documents
    const documentTexts = pdfData.map(doc => {
      // Use chunked content if available, otherwise fall back to extracted_text
      const chunks = doc.document_chunks || [];
      const chunkText = chunks.map((chunk: any) => chunk.content).join("\n\n");
      const content = chunkText || doc.extracted_text || "";
      
      return {
        title: doc.title,
        filename: doc.filename,
        content: content.substring(0, 10000) // Limit content length for API
      };
    });

    // Generate summary using AI (mock implementation)
    const summary = await generateAISummary(documentTexts, settings, customPrompt);

    // Save summary to database
    const { data: summaryData, error: summaryError } = await supabaseClient
      .from("summaries")
      .insert({
        user_id: userId,
        title: generateSummaryTitle(documents),
        document_ids: documentIds,
        document_titles: documents.map(doc => doc.title),
        summary_type: settings.summaryType,
        length: settings.length,
        focus: settings.focus,
        tone: settings.tone,
        custom_prompt: customPrompt,
        summary_content: summary,
        word_count: summary.split(/\s+/).length,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (summaryError) {
      console.error("Error saving summary:", summaryError);
      // Continue even if saving fails - return the generated summary
    }

    return NextResponse.json({
      success: true,
      summary,
      summaryId: summaryData?.id,
      wordCount: summary.split(/\s+/).length
    });

  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

async function generateAISummary(
  documents: Array<{ title: string; filename: string; content: string }>,
  settings: SummaryRequest["settings"],
  customPrompt?: string
): Promise<string> {
  // Mock AI summary generation
  // In a real implementation, this would call an AI service like OpenAI, Anthropic, etc.
  
  const documentTitles = documents.map(doc => doc.title).join(", ");
  const totalWords = documents.reduce((total, doc) => 
    total + doc.content.split(/\s+/).length, 0
  );

  let summary = "";

  switch (settings.summaryType) {
    case "brief":
      summary = `Brief Summary of ${documentTitles}

This summary covers ${documents.length} document(s) containing approximately ${totalWords} words. The key insights and main points have been extracted and condensed for quick review.

Key Points:
- Main themes and concepts identified across the documents
- Critical findings and conclusions
- Important methodologies or approaches discussed
- Relevant data and statistics mentioned

The documents provide valuable insights into the subject matter, with clear implications for further research or practical application.`;
      break;

    case "detailed":
      summary = `Detailed Analysis of ${documentTitles}

Executive Overview:
This comprehensive analysis examines ${documents.length} document(s) totaling approximately ${totalWords} words. The analysis provides an in-depth review of the content, methodologies, findings, and implications.

Document Overview:
${documents.map((doc, index) => 
  `${index + 1}. ${doc.title}: Covers key aspects of the subject matter with detailed explanations and supporting evidence.`
).join("\n")}

Key Findings:
- Comprehensive analysis reveals multiple interconnected themes
- Methodological approaches demonstrate rigorous research standards
- Findings support evidence-based conclusions
- Implications extend beyond immediate scope of study

Methodology Analysis:
The documents employ various research methodologies and analytical frameworks that contribute to the overall understanding of the subject matter.

Conclusions and Implications:
The analysis reveals significant insights that have practical applications and theoretical implications for the field.

Recommendations:
Based on the comprehensive review, several recommendations emerge for future research and practical implementation.`;
      break;

    case "bullet-points":
      summary = `Summary: ${documentTitles}

📋 Document Overview:
• ${documents.length} document(s) analyzed
• Approximately ${totalWords} total words
• Multiple perspectives and approaches covered

🔍 Key Findings:
• Primary themes identified across all documents
• Consistent methodological approaches observed
• Significant conclusions drawn from evidence
• Clear patterns and trends established

📊 Main Points:
• Important data and statistics highlighted
• Critical insights extracted and synthesized
• Relevant examples and case studies noted
• Supporting evidence documented

💡 Insights:
• Cross-document analysis reveals common themes
• Methodological consistency strengthens findings
• Evidence supports main conclusions
• Implications clearly defined

🎯 Conclusions:
• Clear outcomes identified
• Practical applications outlined
• Future research directions suggested
• Implementation recommendations provided`;
      break;

    case "executive":
      summary = `Executive Summary: ${documentTitles}

Overview:
This executive summary synthesizes ${documents.length} key document(s) containing critical information and insights relevant to decision-making processes.

Key Findings:
The analysis reveals several critical insights that have direct implications for strategic planning and operational decisions. The documents provide evidence-based conclusions that support informed decision-making.

Strategic Implications:
The findings have significant implications for organizational strategy and operational effectiveness. Key recommendations emerge from the analysis that can guide future initiatives.

Recommendations:
1. Implement evidence-based approaches identified in the analysis
2. Consider methodological frameworks for future projects
3. Apply insights to current operational challenges
4. Develop action plans based on documented best practices

Next Steps:
The analysis provides a foundation for informed decision-making and strategic planning. Implementation of recommendations should be prioritized based on organizational needs and resource availability.`;
      break;
  }

  // Add custom prompt considerations if provided
  if (customPrompt) {
    summary += `\n\nAdditional Considerations (Based on Custom Instructions):\n${customPrompt}`;
  }

  // Adjust length based on settings
  if (settings.length === "short") {
    summary = summary.substring(0, Math.floor(summary.length * 0.6));
  } else if (settings.length === "long") {
    summary += `\n\nDetailed Analysis:\nThis extended analysis provides additional context and deeper insights into the subject matter, offering comprehensive coverage of all relevant aspects discussed in the source documents.`;
  }

  return summary;
}

function generateSummaryTitle(documents: Array<{ title: string }>): string {
  if (documents.length === 1) {
    return `Summary: ${documents[0].title}`;
  } else if (documents.length <= 3) {
    return `Summary: ${documents.map(doc => doc.title).join(", ")}`;
  } else {
    return `Summary: ${documents.slice(0, 2).map(doc => doc.title).join(", ")} and ${documents.length - 2} more`;
  }
}

export { POST };
export const dynamic = "force-dynamic";