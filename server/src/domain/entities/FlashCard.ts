export class FlashCard {
  private id: string;
  private setId: string;
  private front: string;
  private back: string;
  private hint?: string;

  constructor(
    id: string,
    setId: string,
    front: string,
    back: string,
    hint?: string
  ) {
    this.id = id;
    this.setId = setId;
    this.front = front;
    this.back = back;
    this.hint = hint;
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

  public getHint(): string | undefined {
    return this.hint;
  }

  public setHint(hint: string): void {
    this.hint = hint;
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
      hint: this.hint,
    };
  }
}
