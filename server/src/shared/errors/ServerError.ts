export class ServerError extends Error {
  public subType: string;
  public statusCode: number;
  constructor(message: string, subType?: string, statusCode?: number) {
    super(message);
    this.name = "ServerError";
    this.subType = subType || "ServerError";
    this.statusCode = statusCode || 500;
  }
}
