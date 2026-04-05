import { connect, type DB, SearchRepo } from '@repo/repos';
import { ipcMain } from 'electron';

const memdb = connect(':memory:');

export function register(db: DB) {
  function refresh(_event: Electron.IpcMainInvokeEvent) {
    const repo = new SearchRepo(db, memdb);
    return repo.refresh();
  }

  function search(_event: Electron.IpcMainInvokeEvent, query: string) {
    const repo = new SearchRepo(db, memdb);
    return repo.search(query);
  }

  ipcMain.handle('search:refresh', refresh);
  ipcMain.handle('search:search', search);
}

export interface ISearch {
  refresh: () => Promise<void>;
  search: (query: string) => Promise<string[]>;
}
