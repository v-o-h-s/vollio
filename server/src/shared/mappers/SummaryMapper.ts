import { Summary } from "../../domain/entities/Summary";
import { SummaryData } from "../types/responses/summaryRoutes";

export class SummaryMapper {
  constructor() {}
  static fromPersistenceToDomain(row: any): Summary {
    return new Summary(
      row.id,
      row.pdf_id,
      row.main_points,
      row.text,
      row.created_at,
      row.updated_at
    );
  }
  static fromDomainToInterface(summary: Summary): SummaryData {
    return {
      id: summary.getId(),
      documentId: summary.getPdfId(),
      mainPoints: summary.getMainPoints(),
      text: summary.getText() ?? null,
    };
  }
}
