import {
  CaseSuggestionRepo,
  CaseTypeRepo,
  type CaseTypeSum,
  type DB,
  UsageLogRepo,
  type UsageLogSum,
} from '@repo/repos';
import { ipcMain } from 'electron';

export type Stats = {
  usages: UsageLogSum[];
  types: CaseTypeSum[];
  suggestions: CaseTypeSum[];
};

export function register(db: DB) {
  async function getStats(_event: Electron.IpcMainInvokeEvent): Promise<Stats> {
    const usageLogRepo = new UsageLogRepo(db);
    const typeRepo = new CaseTypeRepo(db);
    const suggestionRepo = new CaseSuggestionRepo(db);
    return {
      usages: await usageLogRepo.sum(),
      types: await typeRepo.sum(),
      suggestions: await suggestionRepo.sum(),
    };
  }

  ipcMain.handle('dashboard:getStats', getStats);
}

export interface IDashboard {
  getStats: () => Promise<Stats>;
}
