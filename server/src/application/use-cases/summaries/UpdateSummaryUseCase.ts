import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { SummaryMapper } from "../../../shared/mappers/SummaryMapper";
import { UpdateSummaryDTO } from "../../../shared/validation/summarySchema";

export class UpdateSummaryUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(data: UpdateSummaryDTO) {
    const summary = await this.summaryRepository.getSummaryById(data.id);
    if (!summary) {
      throw new NotFoundError("Summary not found");
    }

    if (data.text) {
      summary.setText(data.text);
    }
    await this.summaryRepository.updateSummary(summary);
    return SummaryMapper.fromDomainToInterface(summary);
  }
}
