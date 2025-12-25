import { JSONContent } from "../note";

export interface ExplainTextResponseData {
  title: string;
  content: JSONContent;
}

export interface ExplainTextResponse {
  success: boolean;
  message: string;
  data: ExplainTextResponseData | null;
  error: any;
}

export interface AssistantResponseData {
  content: JSONContent;
}

export interface AssistantResponse {
  success: boolean;
  message: string;
  data: AssistantResponseData | null;
  error: any;
}
