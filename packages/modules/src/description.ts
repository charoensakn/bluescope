import { SummaryAgent, TitleAgent } from '@repo/agents';
import type { DB } from '@repo/repos';
import { ipcMain } from 'electron';
import { runAgentStream, type StreamFn } from './helper';

export type DescriptionArgs = {
  description?: string;
  thai?: boolean;
};

export function register(db: DB) {
  function generateTitle(event: Electron.IpcMainInvokeEvent, runId: string, args: DescriptionArgs) {
    return runAgentStream(
      event,
      runId,
      args,
      'description:generateTitle',
      (p) => p.titleAgent,
      (...a) => new TitleAgent(...a),
      db,
    );
  }

  function summarize(event: Electron.IpcMainInvokeEvent, runId: string, args: DescriptionArgs) {
    return runAgentStream(
      event,
      runId,
      args,
      'description:summarize',
      (p) => p.summaryAgent,
      (...a) => new SummaryAgent(...a),
      db,
    );
  }

  ipcMain.handle('description:generateTitle', generateTitle);
  ipcMain.handle('description:summarize', summarize);
}

export interface IDescription {
  generateTitle: (runId: string, args: DescriptionArgs) => Promise<unknown>;
  onGenerateTitle: (fn: StreamFn) => void;
  summarize: (runId: string, args: DescriptionArgs) => Promise<unknown>;
  onSummarize: (fn: StreamFn) => void;
}
