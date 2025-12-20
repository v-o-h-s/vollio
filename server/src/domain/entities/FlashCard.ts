export class FlashCard {
  private id: string;
  private setId: string;
  private front: string;
  private back: string;
  private explanation?: string;

  constructor(
    id: string,
    setId: string,
    front: string,
    back: string,
    explanation?: string
  ) {
    this.id = id;
    this.setId = setId;
    this.front = front;
    this.back = back;
    this.explanation = explanation;
  }

  public getId(): string {
    return this.id;
  }

  public getFront(): string {
    return this.front;
  }

  public setFront(front: string): void {
    this.front = front;
  }

  public getBack(): string {
    return this.back;
  }

  public setBack(back: string): void {
    this.back = back;
  }

  public getExplanation(): string | undefined {
    return this.explanation;
  }

  public setExplanation(explanation: string): void {
    this.explanation = explanation;
  }

  public getSetId(): string {
    return this.setId;
  }

  public setSetId(setId: string): void {
    this.setId = setId;
  }

  public toJSON() {
    return {
      id: this.id,
      setId: this.setId,
      front: this.front,
      back: this.back,
      explanation: this.explanation,
    };
  }
}
