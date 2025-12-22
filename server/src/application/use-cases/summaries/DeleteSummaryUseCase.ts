import { DeleteSummaryDTO } from "../../../shared/validation/summarySchema";
import { ISummaryRepository } from "../../../domain/repositories/ISummaryRepository";

export class DeleteSummaryUseCase {
  constructor(private summaryRepository: ISummaryRepository) {}
  async execute(deleteSummaryDTO: DeleteSummaryDTO) {
    await this.summaryRepository.deleteSummaryRow(deleteSummaryDTO.id);
  }
}
