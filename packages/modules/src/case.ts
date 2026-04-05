import {
  type Case,
  CaseAssetRepo,
  CaseDamageRepo,
  type CaseData,
  type CaseDescriptionLog,
  type CaseDescriptionLogData,
  CaseDescriptionLogRepo,
  type CaseEntityLog,
  type CaseEntityLogData,
  CaseEntityLogRepo,
  CaseEventRepo,
  CaseEvidenceRepo,
  CaseLinkRepo,
  CaseLocationRepo,
  CaseOrganizationRepo,
  CasePersonRepo,
  CaseRepo,
  CaseSuggestionRepo,
  CaseTypeRepo,
  type DB,
} from '@repo/repos';
import { ipcMain } from 'electron';

export type CaseWithRelatedData = Case & {
  descriptionLogs: CaseDescriptionLog[];
  entityLogs: CaseEntityLog[];
};

export function register(db: DB) {
  const caseRepo = new CaseRepo(db);

  const archiveCase = async (id: string) => {
    try {
      await caseRepo.delete(id);
      return true;
    } catch {
      return false;
    }
  };

  const unarchiveCase = async (id: string) => {
    try {
      await caseRepo.undelete(id);
      return true;
    } catch {
      return false;
    }
  };

  const deleteCase = async (id: string) => {
    const descLogRepo = new CaseDescriptionLogRepo(db, id);
    const entityLogRepo = new CaseEntityLogRepo(db, id);

    const personRepo = new CasePersonRepo(db, id);
    const organizationRepo = new CaseOrganizationRepo(db, id);
    const assetRepo = new CaseAssetRepo(db, id);
    const damageRepo = new CaseDamageRepo(db, id);
    const locationRepo = new CaseLocationRepo(db, id);
    const evidenceLogs = new CaseEvidenceRepo(db, id);
    const eventRepo = new CaseEventRepo(db, id);
    const linkRepo = new CaseLinkRepo(db, id);

    const typeLogs = new CaseTypeRepo(db, id);
    const suggestionLogs = new CaseSuggestionRepo(db, id);

    try {
      await Promise.all([
        assetRepo.deleteAll(),
        damageRepo.deleteAll(),
        descLogRepo.deleteAll(),
        entityLogRepo.deleteAll(),
        eventRepo.deleteAll(),
        evidenceLogs.deleteAll(),
        linkRepo.deleteAll(),
        locationRepo.deleteAll(),
        organizationRepo.deleteAll(),
        personRepo.deleteAll(),
        suggestionLogs.deleteAll(),
        typeLogs.deleteAll(),
        caseRepo.delete(id, true),
      ]);
      return true;
    } catch {
      return false;
    }
  };

  const getWithRelatedData = async (id: string) => {
    const caseData = await caseRepo.getById(id);
    if (!caseData) {
      throw new Error('Case not found');
    }
    const descLogRepo = new CaseDescriptionLogRepo(db, id);
    const entityLogRepo = new CaseEntityLogRepo(db, id);
    const descriptionLogs = await descLogRepo.getAll();
    const entityLogs = await entityLogRepo.getAll();
    return {
      ...caseData,
      descriptionLogs,
      entityLogs,
    };
  };

  const addDescriptionLog = async (id: string, log: CaseDescriptionLogData) => {
    if (!log.description || (!log.inputDescription && !log.inputEntity)) {
      return false;
    }

    const descLogRepo = new CaseDescriptionLogRepo(db, id);
    try {
      const lastLog = await descLogRepo.getLast();
      if (lastLog.description === log.description) {
        return false;
      }
    } catch {
      // No logs yet, continue to create new log
    }
    await descLogRepo.create({
      description: log.description,
      inputDescription: log.inputDescription || '',
      inputEntity: log.inputEntity || '',
    });
    return true;
  };

  const addEntityLog = async (id: string, log: CaseEntityLogData) => {
    if (!log.entity || (!log.inputEntity && !log.inputDescription)) {
      return false;
    }

    const entityLogRepo = new CaseEntityLogRepo(db, id);
    try {
      const lastLog = await entityLogRepo.getLast();
      if (lastLog.entity === log.entity) {
        return false;
      }
    } catch {
      // No logs yet, continue to create new log
    }
    await entityLogRepo.create({
      entity: log.entity,
      inputDescription: log.inputDescription || '',
      inputEntity: log.inputEntity || '',
    });
    return true;
  };

  ipcMain.handle('case:create', (_event, data) => caseRepo.create(data));
  ipcMain.handle('case:getAll', () => caseRepo.getAll(true));
  ipcMain.handle('case:get', (_event, id) => caseRepo.getById(id));
  ipcMain.handle('case:update', (_event, id, data) => caseRepo.update(id, data));
  ipcMain.handle('case:archive', (_event, id) => archiveCase(id));
  ipcMain.handle('case:unarchive', (_event, id) => unarchiveCase(id));
  ipcMain.handle('case:delete', (_event, id) => deleteCase(id));
  ipcMain.handle('case:getWithRelatedData', (_event, id) => getWithRelatedData(id));
  ipcMain.handle('case:addDescriptionLog', (_event, id, log) => addDescriptionLog(id, log));
  ipcMain.handle('case:addEntityLog', (_event, id, log) => addEntityLog(id, log));
}

export interface ICase {
  create: (data: CaseData) => Promise<Case>;
  getAll: () => Promise<Case[]>;
  get: (id: string) => Promise<Case>;
  update: (id: string, data: CaseData) => Promise<Case>;
  archive: (id: string) => Promise<boolean>;
  unarchive: (id: string) => Promise<boolean>;
  delete: (id: string) => Promise<boolean>;
  getWithRelatedData: (id: string) => Promise<CaseWithRelatedData>;
  addDescriptionLog: (id: string, log: CaseDescriptionLogData) => Promise<boolean>;
  addEntityLog: (id: string, log: CaseEntityLogData) => Promise<boolean>;
}
