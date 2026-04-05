import { BaseTypeRepo } from './base_type';
import { caseTypesTable } from './schema';

export type CaseType = typeof caseTypesTable.$inferSelect;

export type CaseTypeData = Omit<CaseType, 'caseId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class CaseTypeRepo extends BaseTypeRepo<CaseType, CaseTypeData> {
  protected table() {
    return caseTypesTable;
  }
}
