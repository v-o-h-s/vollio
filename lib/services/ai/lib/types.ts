export enum AiPromptType {
  EXPLAIN_SHORTLY = "explain_shortly",
  EXPLAIN_DETAILED = "explain_detailed",
}

export interface PromptTemplate {
  system: string;
  messagePrefix: string;
}