export class ServerError extends Error {
  public subType: string;
  constructor(message: string, subType?: string) {
    super(message);
    this.name = "ServerError";
    this.subType = subType || "ServerError";
  }
}
