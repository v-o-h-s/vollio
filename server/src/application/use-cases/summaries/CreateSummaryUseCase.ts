import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { CreateSummaryDTO } from "../../../shared/validation/summarySchema";
import { Summary } from "../../../domain/entities/Summary";
import { SummaryMapper } from "../../../shared/mappers/SummaryMapper";

export class CreateSummaryUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(data: CreateSummaryDTO) {
    const summary = new Summary(
      data.documentId,
      undefined,
      undefined,
      data.text
    );
    const createdSummary: Summary = await this.summaryRepository.createSummary(
      summary
    );
    return SummaryMapper.fromDomainToInterface(createdSummary);
  }
}
