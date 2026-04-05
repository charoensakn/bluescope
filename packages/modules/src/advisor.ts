import path from 'node:path';
import { AdvisoryAgent, type Suggestion, SynthesisAgent } from '@repo/agents';
import { CaseRepo, type CaseSuggestion, CaseSuggestionRepo, CaseTypeRepo, type DB } from '@repo/repos';
import { app, ipcMain } from 'electron';
import type { SkillID } from './classification';
import { runAgentStream, type StreamFn } from './helper';

const skillsPath = path.join(app.getAppPath(), 'skills');

export type AdvisorArgs = {
  caseId?: string;
  thai?: boolean;
  skillId?: SkillID;
};

export function register(db: DB) {
  async function suggest(event: Electron.IpcMainInvokeEvent, runId: string, args: AdvisorArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for suggestion');
    }
    if (!args.skillId) {
      throw new Error('skillId is required for suggestion');
    }
    const caseRepo = new CaseRepo(db);
    const { description } = await caseRepo.getById(args.caseId);

    const result = await runAgentStream(
      event,
      runId,
      { description, skillId: args.skillId, thai: args.thai, skillsPath },
      'advisor:suggest',
      (p) => p.advisoryAgent,
      (...a) => new AdvisoryAgent(...a),
      db,
    );
    if (typeof result === 'string') {
      const suggestionRepo = new CaseSuggestionRepo(db, args.caseId);
      await suggestionRepo.put({
        caseType: args.skillId,
        suggestion: result as string,
      });
    }
    return result;
  }

  async function getAllSuggestionsFromTypes(caseId: string, deleted?: boolean) {
    const typeRepo = new CaseTypeRepo(db, caseId);
    const suggestionRepo = new CaseSuggestionRepo(db, caseId);
    const types = await typeRepo.getAll();
    const ret = [];
    for (const t of types) {
      try {
        const suggestion = await suggestionRepo.getById(t.caseType, deleted);
        if (suggestion.suggestion) {
          ret.push({
            caseType: t,
            caseSuggestion: suggestion,
          });
        }
      } catch {
        // No suggestion for this type, skip
      }
    }
    return ret;
  }

  async function synthesize(event: Electron.IpcMainInvokeEvent, runId: string, args: AdvisorArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for synthesis');
    }
    const rawSuggestions = await getAllSuggestionsFromTypes(args.caseId);
    if (rawSuggestions.length === 0) {
      throw new Error('No suggestions available for synthesis');
    }
    const suggestions: Suggestion[] = rawSuggestions.map(({ caseType, caseSuggestion }) => ({
      name: caseType.caseType,
      weight: caseType.confidence || 1,
      text: caseSuggestion.suggestion,
    }));

    const result = await runAgentStream(
      event,
      runId,
      { suggestions, thai: args.thai, skillsPath },
      'advisor:synthesize',
      (p) => p.advisoryAgent,
      (...a) => new SynthesisAgent(...a),
      db,
    );
    if (typeof result === 'string') {
      const suggestionRepo = new CaseSuggestionRepo(db, args.caseId);
      await suggestionRepo.put({
        caseType: 'synthesis',
        suggestion: result,
      });
    }
    return result;
  }

  function getAll(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const suggestionRepo = new CaseSuggestionRepo(db, caseId);
    return suggestionRepo.getAll(true);
  }

  async function getAllSuggestions(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    if (!caseId) {
      throw new Error('caseId is required to get suggestions');
    }
    const suggestions = await getAllSuggestionsFromTypes(caseId, true);
    return suggestions.map((s) => ({ ...s.caseSuggestion }));
  }

  async function getSynthesis(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const suggestionRepo = new CaseSuggestionRepo(db, caseId);
    try {
      return await suggestionRepo.getById('synthesis');
    } catch {}
    return null;
  }

  function deleteAll(_event: Electron.IpcMainInvokeEvent, caseId: string) {
    const suggestionRepo = new CaseSuggestionRepo(db, caseId);
    return suggestionRepo.deleteAll(true);
  }

  function toggle(_event: Electron.IpcMainInvokeEvent, caseId: string, caseType: string, deleted: boolean) {
    const suggestionRepo = new CaseSuggestionRepo(db, caseId);
    return deleted ? suggestionRepo.delete(caseType) : suggestionRepo.undelete(caseType);
  }

  ipcMain.handle('advisor:suggest', suggest);
  ipcMain.handle('advisor:synthesize', synthesize);
  ipcMain.handle('advisor:getAll', getAll);
  ipcMain.handle('advisor:getAllSuggestions', getAllSuggestions);
  ipcMain.handle('advisor:getSynthesis', getSynthesis);
  ipcMain.handle('advisor:deleteAll', deleteAll);
  ipcMain.handle('advisor:toggle', toggle);
}

export interface IAdvisor {
  suggest: (runId: string, args: AdvisorArgs) => Promise<string>;
  onSuggest: (fn: StreamFn) => void;
  synthesize: (runId: string, args: AdvisorArgs) => Promise<string>;
  onSynthesize: (fn: StreamFn) => void;
  getAll: (caseId: string) => Promise<CaseSuggestion[]>;
  getAllSuggestions: (caseId: string) => Promise<CaseSuggestion[]>;
  getSynthesis: (caseId: string) => Promise<CaseSuggestion | null>;
  deleteAll: (caseId: string) => Promise<void>;
  toggle: (caseId: string, caseType: string, deleted: boolean) => Promise<void>;
}
