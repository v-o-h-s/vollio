import { Summary } from "../../../domain/entities/Summary";
import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { UpdateSummaryDTO } from "../../../shared/validation/summarySchema";

export class UpdateSummaryUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(data: UpdateSummaryDTO) {
    const summary = await this.summaryRepository.getSummaryById(data.id);
    if (!summary) {
      throw new NotFoundError("Summary not found");
    }
    if (data.mainPoints) {
      summary.setMainPoints(data.mainPoints);
    }
    if (data.text) {
      summary.setText(data.text);
    }
    return await this.summaryRepository.updateSummary(summary);
  }
}
