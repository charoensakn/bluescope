import path from 'node:path';
import { ClassificationAgent, loadSkills, type Skill } from '@repo/agents';
import { CaseRepo, type CaseType, CaseTypeRepo, type DB } from '@repo/repos';
import { app, ipcMain } from 'electron';
import { runAgent } from './helper';

const skillsPath = path.join(app.getAppPath(), 'skills');

/**
 * Identifies a legal skill (case type) that the advisory agent can analyse.
 * Each member corresponds to a directory under the skills path and maps to a
 * specific Thai criminal-law offence category.
 */
export type SkillID =
  | '01-homicide'
  | '02-premeditated-murder'
  | '03-arson-1'
  | '04-extortion'
  | '05-insanity-cases'
  | '06-death-from-boxing'
  | '07-rape-1'
  | '08-rape-2'
  | '09-counterfeit-currency'
  | '10-alien-deportation'
  | '11-reckless-driving-1'
  | '12-traffic-accident-2'
  | '13-illegal-entry'
  | '14-killing-wild-elephant'
  | '15-fraud'
  | '16-bad-checks'
  | '17-impersonate-monk'
  | '18-impersonate-police'
  | '19-illegal-medical-practice'
  | '20-abortion-and-unlicensed-midwife'
  | '21-credit-card-bank-fraud'
  | '22-credit-card-merchant-fraud'
  | '23-credit-card-holder-fraud'
  | '24-trespassing'
  | '25-robbery-or-theft'
  | '26-forged-official-documents'
  | '27-officer-aiding-escape'
  | '28-procurement-for-obscenity'
  | '29-gambling-offenses'
  | '30-animal-slaughter-control'
  | '31-antiquities-and-museums'
  | '32-national-forest-offenses'
  | '33-child-abduction'
  | '34-possession-of-wildlife-carcass'
  | '35-obscene-media-distribution'
  | '36-embezzlement'
  | '37-narcotics-offenses'
  | '38-receiving-stolen-property'
  | '39-illegal-solicitation'
  | '40-theft-1'
  | '41-nighttime-burglary-2'
  | '42-residential-theft-3'
  | '43-religious-artifact-theft'
  | '44-hunting-protected-wildlife'
  | '45-arson-2'
  | '46-justifiable-homicide-inquiry'
  | '47-customs-offenses'
  | '48-unlawful-detention'
  | '49-bribery-of-official'
  | '50-firearms-offenses-1'
  | '51-illegal-firearms-possession-2'
  | '52-child-kidnapping-for-ransom'
  | '53-drug-distribution'
  | '54-online-fake-news-and-computer-crime'
  | '55-online-product-fraud-and-illegal-goods'
  | '56-online-gambling-and-transnational-crime'
  | '57-online-sexual-exploitation-and-human-trafficking'
  | '58-online-financial-fraud';

export type ClassificationArgs = {
  caseId?: string;
  thai?: boolean;
};

export function register(db: DB) {
  async function categorize(event: Electron.IpcMainInvokeEvent, args: ClassificationArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for suggestion');
    }
    const caseRepo = new CaseRepo(db);
    const { description } = await caseRepo.getById(args.caseId);

    const results = await runAgent(
      event,
      { description, thai: args.thai, skillsPath },
      (p) => p.classificationAgent,
      (...a) => new ClassificationAgent(...a),
      db,
    );

    if (Array.isArray(results)) {
      const typeRepo = new CaseTypeRepo(db, args.caseId);
      for (const r of results) {
        await typeRepo.put({
          caseType: r.id,
          reason: r.reason,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  function getAll(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const typeRepo = new CaseTypeRepo(db, caseId);
    return typeRepo.getAll(true);
  }

  function deleteAll(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const typeRepo = new CaseTypeRepo(db, caseId);
    return typeRepo.deleteAll(true);
  }

  function getSkills(_event: Electron.IpcMainInvokeEvent) {
    return loadSkills(skillsPath);
  }

  async function selectSkill(_event: Electron.IpcMainInvokeEvent, caseId: string, skillId: SkillID, selected: boolean) {
    const typeRepo = new CaseTypeRepo(db, caseId);
    try {
      await typeRepo.getById(skillId, true);
    } catch {
      // Skill not found, add it with null reason and confidence
      await typeRepo.put({
        caseType: skillId,
        reason: null,
        confidence: null,
      });
    }
    return selected ? typeRepo.undelete(skillId) : typeRepo.delete(skillId);
  }

  ipcMain.handle('classification:categorize', categorize);
  ipcMain.handle('classification:getAll', getAll);
  ipcMain.handle('classification:deleteAll', deleteAll);
  ipcMain.handle('classification:getSkills', getSkills);
  ipcMain.handle('classification:selectSkill', selectSkill);
}

export interface IClassification {
  categorize: (args: ClassificationArgs) => Promise<unknown>;
  getAll: (caseId: string) => Promise<CaseType[]>;
  deleteAll: (caseId: string) => Promise<void>;
  getSkills: () => Promise<Skill[]>;
  selectSkill: (caseId: string, skillId: SkillID, selected: boolean) => Promise<void>;
}
