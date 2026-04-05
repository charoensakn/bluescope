import { and, eq } from 'drizzle-orm';
import { BaseCaseRepo } from './base_case';
import { caseAssetsTable } from './schema';

export type CaseAsset = typeof caseAssetsTable.$inferSelect;

export type CaseAssetData = Omit<CaseAsset, 'caseId' | 'createdAt'>;

export class CaseAssetRepo extends BaseCaseRepo<CaseAsset> {
  protected table() {
    return caseAssetsTable;
  }

  async getById(createdAt: number): Promise<CaseAsset> {
    const records = await this.db
      .select()
      .from(caseAssetsTable)
      .where(and(eq(caseAssetsTable.caseId, this.caseId), eq(caseAssetsTable.createdAt, createdAt)))
      .limit(1);
    if (records.length === 0) {
      throw new Error('Case asset not found');
    }
    return records[0];
  }

  async create(data: CaseAssetData) {
    const createdAt = this.generateTimestamp();
    await this.db.insert(caseAssetsTable).values({ ...data, caseId: this.caseId, createdAt });
    return this.getById(createdAt);
  }

  async update(createdAt: number, data: CaseAssetData): Promise<CaseAsset> {
    await this.db
      .update(caseAssetsTable)
      .set(data)
      .where(and(eq(caseAssetsTable.caseId, this.caseId), eq(caseAssetsTable.createdAt, createdAt)));
    return this.getById(createdAt);
  }

  async delete(createdAt: number): Promise<void> {
    await this.db
      .delete(caseAssetsTable)
      .where(and(eq(caseAssetsTable.caseId, this.caseId), eq(caseAssetsTable.createdAt, createdAt)));
  }
}
