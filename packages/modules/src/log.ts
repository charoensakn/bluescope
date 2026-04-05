import { type DB, type UsageLog, UsageLogRepo } from '@repo/repos';
import { ipcMain } from 'electron';

export function register(db: DB) {
  function getAll(_event: Electron.IpcMainInvokeEvent) {
    const usageLogRepo = new UsageLogRepo(db);
    return usageLogRepo.getAll();
  }

  ipcMain.handle('log:getAll', getAll);
}

export interface ILog {
  getAll: () => Promise<UsageLog[]>;
}
