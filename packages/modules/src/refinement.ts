import { DescriptionRefinementAgent, EntityRefinementAgent } from '@repo/agents';
import {
  type CaseDescriptionLog,
  CaseDescriptionLogRepo,
  type CaseEntityLog,
  CaseEntityLogRepo,
  type DB,
} from '@repo/repos';
import { ipcMain } from 'electron';
import { runAgentStream, type StreamFn } from './helper';

export type RefinementArgs = {
  caseId?: string;
  description?: string;
  entity?: string;
  thai?: boolean;
};

export function register(db: DB) {
  async function refineDescription(event: Electron.IpcMainInvokeEvent, runId: string, args: RefinementArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for description refinement');
    }
    if (!args.description && !args.entity) {
      throw new Error('Either description or entity is required for description refinement');
    }
    const result = await runAgentStream(
      event,
      runId,
      args,
      'refinement:refineDescription',
      (p) => p.descriptionRefinementAgent,
      (...a) => new DescriptionRefinementAgent(...a),
      db,
    );
    if (result) {
      const caseLogRepo = new CaseDescriptionLogRepo(db, args.caseId);
      const ret = await caseLogRepo.create({
        inputDescription: args.description || '',
        inputEntity: args.entity || '',
        description: result as string,
      });
      return ret;
    }
    return null;
  }

  async function refineEntity(event: Electron.IpcMainInvokeEvent, runId: string, args: RefinementArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for entity refinement');
    }
    if (!args.entity && !args.description) {
      throw new Error('Either entity or description is required for entity refinement');
    }
    const result = await runAgentStream(
      event,
      runId,
      args,
      'refinement:refineEntity',
      (p) => p.entityRefinementAgent,
      (...a) => new EntityRefinementAgent(...a),
      db,
    );
    if (result) {
      const caseLogRepo = new CaseEntityLogRepo(db, args.caseId);
      const ret = await caseLogRepo.create({
        inputDescription: args.description || '',
        inputEntity: args.entity || '',
        entity: result as string,
      });
      return ret;
    }
    return null;
  }

  async function getAllDescriptionLogs(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const caseLogRepo = new CaseDescriptionLogRepo(db, caseId);
    return await caseLogRepo.getAll();
  }

  async function getAllEntityLogs(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const caseLogRepo = new CaseEntityLogRepo(db, caseId);
    return await caseLogRepo.getAll();
  }

  ipcMain.handle('refinement:refineDescription', refineDescription);
  ipcMain.handle('refinement:refineEntity', refineEntity);
  ipcMain.handle('refinement:getAllDescriptionLogs', getAllDescriptionLogs);
  ipcMain.handle('refinement:getAllEntityLogs', getAllEntityLogs);
}

export interface IRefinement {
  refineDescription: (runId: string, args: RefinementArgs) => Promise<CaseDescriptionLog | null>;
  onRefineDescription: (fn: StreamFn) => void;
  refineEntity: (runId: string, args: RefinementArgs) => Promise<CaseEntityLog | null>;
  onRefineEntity: (fn: StreamFn) => void;
  getAllDescriptionLogs: (caseId: string) => Promise<CaseDescriptionLog[]>;
  getAllEntityLogs: (caseId: string) => Promise<CaseEntityLog[]>;
}
