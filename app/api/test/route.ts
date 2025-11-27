import AiService from "@/lib/services/ai/client";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";
import { NextRequest, NextResponse } from "next/server";
import { AiPromptType } from "@/lib/services/ai/lib/types";

export const POST = withErrorHandling(async (req: NextRequest) => {
  Logger.info("Test endpoint called");

  const { prompt } = await req.json();
  Logger.info(
    `Generating AI response for prompt: "${prompt.substring(0, 50)}${
      prompt.length > 50 ? "..." : ""
    }"`
  );

  // Service layer throws AIError on failure
  // withErrorHandling wrapper handles the error and converts to proper HTTP response
  const stream = AiService.generateTextStream(
    AiPromptType.EXPLAIN_SHORTLY,
    prompt
  );

  // Collect all chunks from the async generator
  let content = "";
  for await (const chunk of stream) {
    content += chunk;
  }

  Logger.success(
    `AI response generated successfully (${content.length} characters)`
  );

  return NextResponse.json({
    success: true,
    status: 200,
    data: content,
  });
});
