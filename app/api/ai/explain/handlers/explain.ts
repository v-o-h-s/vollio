import { NextRequest, NextResponse } from "next/server";
import AiService from "@/lib/services/ai/client";
import { AiPromptType } from "@/lib/services/ai/lib/types";
export const explainHandler = async (
  req: NextRequest,
  data: {
    concept: string;
    explainType: string;
  }
) => {
  const { concept, explainType } = data;

  let aiResponse: string;

  if (explainType == "shortly") {
    aiResponse = await AiService.generateText(
      AiPromptType.EXPLAIN_SHORTLY,
      concept
    );
  } else if (explainType == "detailed") {
    aiResponse = await AiService.generateText(
      AiPromptType.EXPLAIN_DETAILED,
      concept
    );
  } else {
    return NextResponse.json(
      {
        success: false,
        status: 400,
        error: "Invalid explainType. Must be 'shortly' or 'detailed'",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    status: 200,
    data: aiResponse,
  });
};
