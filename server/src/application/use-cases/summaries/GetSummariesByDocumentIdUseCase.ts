import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { SummaryMapper } from "../../../shared/mappers/SummaryMapper";
export class GetSummariesByDocumentIdUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(documentId: string) {
    const summaries = await this.summaryRepository.getSummariesByDocumentId(
      documentId
    );
    return summaries.map((summary) =>
      SummaryMapper.fromDomainToInterface(summary)
    );
  }
}
