export class ConflictError extends Error {
  public subType: string;
  public statusCode: number = 409;

  constructor(message: string, subType: string = "CONFLICT_ERROR") {
    super(message);
    this.name = "ConflictError";
    this.subType = subType;
  }
}
