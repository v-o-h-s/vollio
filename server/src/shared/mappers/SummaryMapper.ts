import { Summary } from "../../domain/entities/Summary";
import { SummaryData } from "@vollio/shared";

export class SummaryMapper {
  constructor() {}
  static fromPersistenceToDomain(row: any): Summary {
    return new Summary(
      row.document_id,
      row.created_at,
      row.updated_at,
      row.text,
      row.id
    );
  }
  static fromDomainToInterface(summary: Summary): SummaryData {
    return {
      id: summary.getId(),
      documentId: summary.getDocumentId(),
      text: summary.getText() ?? null,
    };
  }
  static fromDomainToPersistence(summary: Summary): any {
    return {
      id: summary.getId(),
      document_id: summary.getDocumentId(),
      text: summary.getText() ?? null,
      created_at: summary.getCreatedAt(),
      updated_at: summary.getUpdatedAt(),
    };
  }
}
