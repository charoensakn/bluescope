import { LLM } from '@repo/agents';
import {
  CaseAssetRepo,
  CaseDamageRepo,
  CaseEventRepo,
  CaseEvidenceRepo,
  CaseLinkRepo,
  CaseLocationRepo,
  CaseOrganizationRepo,
  CasePersonRepo,
  CaseRepo,
  type DB,
} from '@repo/repos';
import { ipcMain } from 'electron';
import type { StreamFn } from './helper';
import { availableProviders } from './provider';

const channel = 'dev:generate';

export type DevArgs = {
  caseId?: string;
  providerId?: string;
  system?: string;
  thai?: boolean;
};

export function register(db: DB) {
  async function generate(event: Electron.IpcMainInvokeEvent, runId: string, args: DevArgs): Promise<void> {
    const { caseId, providerId, system, thai } = args;

    if (!system) {
      throw new Error('System prompt is required');
    }
    const providers = availableProviders((p) => p.id === providerId);
    if (providers.length === 0) {
      throw new Error('Provider not found');
    }
    const provider = providers[0];

    const caseRepo = new CaseRepo(db);
    const caseData = await caseRepo.getById(caseId);

    const personRepo = new CasePersonRepo(db, args.caseId);
    const organizationRepo = new CaseOrganizationRepo(db, args.caseId);
    const locationRepo = new CaseLocationRepo(db, args.caseId);
    const assetRepo = new CaseAssetRepo(db, args.caseId);
    const damageRepo = new CaseDamageRepo(db, args.caseId);
    const evidenceRepo = new CaseEvidenceRepo(db, args.caseId);
    const eventRepo = new CaseEventRepo(db, args.caseId);
    const linkRepo = new CaseLinkRepo(db, args.caseId);
    const [persons, organizations, locations, assets, damages, evidences, events, links] = await Promise.all([
      personRepo.getAll(),
      organizationRepo.getAll(),
      locationRepo.getAll(),
      assetRepo.getAll(),
      damageRepo.getAll(),
      evidenceRepo.getAll(),
      eventRepo.getAll(),
      linkRepo.getAll(),
    ]);

    const entities = JSON.stringify({
      persons: persons.map((p) => ({
        id: p.id,
        types: JSON.parse(p.types),
        name: p.name,
        person_details: p.personDetails,
        condition: p.condition,
      })),
      organizations: organizations.map((o) => ({
        id: o.id,
        types: JSON.parse(o.types),
        name: o.name,
        organization_details: o.organizationDetails,
      })),
      locations: locations.map((l) => ({
        id: l.id,
        types: JSON.parse(l.types),
        name: l.name,
        location_details: l.locationDetails,
      })),
      assets: assets.map((a) => ({
        id: a.id,
        types: JSON.parse(a.types),
        name: a.name,
        asset_details: a.assetDetails,
      })),
      damages: damages.map((d) => ({
        id: d.id,
        types: JSON.parse(d.types),
        name: d.name,
        damage_details: d.damageDetails,
        value: d.value,
      })),
      evidences: evidences.map((e) => ({
        id: e.id,
        types: JSON.parse(e.types),
        name: e.name,
        evidence_details: e.evidenceDetails,
      })),
      events: events.map((e) => ({
        id: e.id,
        types: JSON.parse(e.types),
        name: e.name,
        occurrence_time: e.occurrenceTime,
        event_details: e.eventDetails,
      })),
      links: links.map((l) => ({
        sourceId: l.sourceId,
        targetId: l.targetId,
        relation: l.relation,
      })),
    });

    const prompt = thai
      ? `เรื่องราว:\n\n--- BEGIN STORY ---\n${caseData.description}\n--- END STORY ---\n\nเอนทิตี:\n\n--- BEGIN ENTITIES ---\n${entities}\n--- END ENTITIES ---\n`
      : `Story:\n\n--- BEGIN STORY ---\n${caseData.description}\n--- END STORY ---\n\nEntities:\n\n--- BEGIN ENTITIES ---\n${entities}\n--- END ENTITIES ---\n`;

    const llm = new LLM(
      provider.providerName,
      provider.modelName,
      provider.baseUrl,
      provider.apiKey,
      provider.reasoning,
      provider.temperature,
      provider.maxOutputTokens,
    );
    const { reasoningStream, textStream, done } = llm.streamText({
      system,
      prompt,
    });

    let hasReasoning = false;
    let hasText = false;

    await Promise.all([
      (async () => {
        let buffer = '';
        let timer: NodeJS.Timeout | null = null;
        const flush = () => {
          const tmp = buffer;
          buffer = '';
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          if (tmp.length > 0) {
            event.sender.send(channel, runId, 'reason-stream', tmp);
          }
        };
        for await (const reasoning of reasoningStream) {
          if (!hasReasoning) {
            event.sender.send(channel, runId, 'reason-begin');
            hasReasoning = true;
          }
          buffer += reasoning;
          if (!timer) {
            timer = setTimeout(flush, 100);
          }
        }
        flush();
      })(),
      (async () => {
        let buffer = '';
        let timer: NodeJS.Timeout | null = null;
        const flush = () => {
          const tmp = buffer;
          buffer = '';
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          if (tmp.length > 0) {
            event.sender.send(channel, runId, 'text-stream', tmp);
          }
        };
        for await (const text of textStream) {
          if (!hasText) {
            event.sender.send(channel, runId, 'text-begin');
            hasText = true;
          }
          buffer += text;
          if (!timer) {
            timer = setTimeout(flush, 100);
          }
        }
        flush();
      })(),
    ]);

    await done;

    if (hasReasoning) {
      event.sender.send(channel, runId, 'reason-end', llm.reasoningText);
    }
    if (hasText) {
      event.sender.send(channel, runId, 'text-end', llm.text);
    }
  }

  ipcMain.handle('dev:generate', generate);
}

export interface IDev {
  generate: (runId: string, args: DevArgs) => Promise<void>;
  onGenerate: (fn: StreamFn) => void;
}
