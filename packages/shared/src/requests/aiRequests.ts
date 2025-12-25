export interface ExplainTextDTO {
  text: string;
}

export type AssistantChatRole = "user" | "assistant";

export interface AssistantChatMessage {
  role: AssistantChatRole;
  content: string;
}

export interface AssistantDTO {
  message: string;
  history?: AssistantChatMessage[];
}
