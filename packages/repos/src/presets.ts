import { eq } from 'drizzle-orm';
import { BaseRepo } from './base';
import { presetsTable } from './schema';

export type Preset = typeof presetsTable.$inferSelect;

export type PresetData = Partial<Omit<Preset, 'id'>>;

export class PresetRepo extends BaseRepo {
  async getAll(): Promise<Preset[]> {
    return this.db.select().from(presetsTable);
  }

  async getById(id: string): Promise<Preset> {
    const records = await this.db.select().from(presetsTable).where(eq(presetsTable.id, id)).limit(1);
    if (records.length === 0) {
      throw new Error('Preset not found');
    }
    return records[0];
  }

  async create(data: PresetData): Promise<Preset> {
    const id = this.generateId();
    await this.db.insert(presetsTable).values({ ...data, id });
    return this.getById(id);
  }

  async update(id: string, data: PresetData): Promise<Preset> {
    await this.db
      .update(presetsTable)
      .set({ ...data })
      .where(eq(presetsTable.id, id));
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(presetsTable).where(eq(presetsTable.id, id));
  }
}
