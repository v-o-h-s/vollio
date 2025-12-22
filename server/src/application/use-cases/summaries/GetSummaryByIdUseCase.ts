import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { SummaryMapper } from "../../../shared/mappers/SummaryMapper";
import { SummaryData } from "../../../shared/types/responses/summaryRoutes";

export class GetSummaryByIdUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(id: string): Promise<SummaryData> {
    const summary = await this.summaryRepository.getSummaryById(id);
    if (!summary) {
      throw new NotFoundError("Summary not found");
    }
    return SummaryMapper.fromDomainToInterface(summary);
  }
}
