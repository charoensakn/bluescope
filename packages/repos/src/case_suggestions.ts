import { BaseTypeRepo } from './base_type';
import { caseSuggestionsTable } from './schema';

export type CaseSuggestion = typeof caseSuggestionsTable.$inferSelect;

export type CaseSuggestionData = Omit<CaseSuggestion, 'caseId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class CaseSuggestionRepo extends BaseTypeRepo<CaseSuggestion, CaseSuggestionData> {
  protected table() {
    return caseSuggestionsTable;
  }
}
