import { Quiz } from "../entities/Quiz";

export interface IQuizRepository {
  save(quiz: Quiz): Promise<void>;
  findById(id: string): Promise<Quiz | null>;
  findAll(): Promise<Quiz[]>;
  delete(id: string): Promise<void>;
}
