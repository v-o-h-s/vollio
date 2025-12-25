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
