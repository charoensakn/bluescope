import { type DB, type Preset, type PresetData, PresetRepo } from '@repo/repos';
import { ipcMain } from 'electron';

export function register(db: DB) {
  function getAll(_event: Electron.IpcMainInvokeEvent) {
    const repo = new PresetRepo(db);
    return repo.getAll();
  }

  function get(_event: Electron.IpcMainInvokeEvent, id: string) {
    const repo = new PresetRepo(db);
    return repo.getById(id);
  }

  function create(_event: Electron.IpcMainInvokeEvent, data: PresetData) {
    const repo = new PresetRepo(db);
    return repo.create(data);
  }

  function update(_event: Electron.IpcMainInvokeEvent, id: string, data: PresetData) {
    const repo = new PresetRepo(db);
    return repo.update(id, data);
  }

  function remove(_event: Electron.IpcMainInvokeEvent, id: string) {
    const repo = new PresetRepo(db);
    return repo.delete(id);
  }

  ipcMain.handle('preset:getAll', getAll);
  ipcMain.handle('preset:get', get);
  ipcMain.handle('preset:create', create);
  ipcMain.handle('preset:update', update);
  ipcMain.handle('preset:remove', remove);
}

export interface IPreset {
  getAll: () => Promise<Preset[]>;
  get(id: string): Promise<Preset>;
  create(data: PresetData): Promise<Preset>;
  update(id: string, data: PresetData): Promise<Preset>;
  remove(id: string): Promise<void>;
}
