import { LinkAnalysisAgent, StructureExtractionAgent } from '@repo/agents';
import {
  type CaseAsset,
  CaseAssetRepo,
  type CaseDamage,
  CaseDamageRepo,
  type CaseEvent,
  CaseEventRepo,
  type CaseEvidence,
  CaseEvidenceRepo,
  type CaseLink,
  CaseLinkRepo,
  type CaseLocation,
  CaseLocationRepo,
  type CaseOrganization,
  CaseOrganizationRepo,
  type CasePerson,
  CasePersonRepo,
  CaseRepo,
  type DB,
} from '@repo/repos';
import { ipcMain } from 'electron';
import { runAgentStream, type StreamFn } from './helper';

export type StructureArgs = {
  caseId?: string;
  thai?: boolean;
  extract?: 'person' | 'organization' | 'location' | 'asset' | 'damage' | 'evidence' | 'event';
};

export type Person = Omit<CasePerson, 'types'> & {
  types: string[];
};

export type Organization = Omit<CaseOrganization, 'types'> & {
  types: string[];
};

export type Location = Omit<CaseLocation, 'types'> & {
  types: string[];
};

export type Asset = Omit<CaseAsset, 'types'> & {
  types: string[];
};

export type Damage = Omit<CaseDamage, 'types'> & {
  types: string[];
};

export type Evidence = Omit<CaseEvidence, 'types'> & {
  types: string[];
};

export type Event = Omit<CaseEvent, 'types'> & {
  types: string[];
};

export function register(db: DB) {
  async function extractPersons(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'person' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const personRepo = new CasePersonRepo(db, args.caseId);
      await personRepo.deleteAll();
      for (const r of results) {
        await personRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          personDetails: r.person_details,
          condition: r.condition,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractOrganizations(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'organization' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const organizationRepo = new CaseOrganizationRepo(db, args.caseId);
      await organizationRepo.deleteAll();
      for (const r of results) {
        await organizationRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          organizationDetails: r.organization_details,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractLocations(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'location' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const locationRepo = new CaseLocationRepo(db, args.caseId);
      await locationRepo.deleteAll();
      for (const r of results) {
        await locationRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          locationDetails: r.location_details,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractAssets(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'asset' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const assetRepo = new CaseAssetRepo(db, args.caseId);
      await assetRepo.deleteAll();
      for (const r of results) {
        await assetRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          assetDetails: r.asset_details,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractDamages(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'damage' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const damageRepo = new CaseDamageRepo(db, args.caseId);
      await damageRepo.deleteAll();
      for (const r of results) {
        await damageRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          damageDetails: r.damage_details,
          value: r.value,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractEvidence(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'evidence' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const evidenceRepo = new CaseEvidenceRepo(db, args.caseId);
      await evidenceRepo.deleteAll();
      for (const r of results) {
        await evidenceRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          evidenceDetails: r.evidence_details,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function extractEvents(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    const caseRepo = new CaseRepo(db);
    const { description, entity } = await caseRepo.getById(args.caseId);
    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai, extract: 'event' },
      'structure:extract',
      (p) => p.structureExtractionAgent,
      (...a) => new StructureExtractionAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const eventRepo = new CaseEventRepo(db, args.caseId);
      await eventRepo.deleteAll();
      for (const r of results) {
        await eventRepo.create({
          id: r.id,
          types: JSON.stringify(r.types),
          name: r.name,
          occurrenceTime: r.occurrence_time,
          eventDetails: r.event_details,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  function extract(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for extraction');
    }
    switch (args.extract) {
      case 'person':
        return extractPersons(event, runId, args);
      case 'organization':
        return extractOrganizations(event, runId, args);
      case 'location':
        return extractLocations(event, runId, args);
      case 'asset':
        return extractAssets(event, runId, args);
      case 'damage':
        return extractDamages(event, runId, args);
      case 'evidence':
        return extractEvidence(event, runId, args);
      case 'event':
        return extractEvents(event, runId, args);
      default:
        throw new Error(`Invalid extract type: ${args.extract}`);
    }
  }

  async function analyze(event: Electron.IpcMainInvokeEvent, runId: string, args: StructureArgs) {
    if (!args.caseId) {
      throw new Error('caseId is required for analysis');
    }
    const caseRepo = new CaseRepo(db);
    const { description } = await caseRepo.getById(args.caseId);
    if (!description) {
      throw new Error('Description is required for analysis');
    }

    const personRepo = new CasePersonRepo(db, args.caseId);
    const organizationRepo = new CaseOrganizationRepo(db, args.caseId);
    const locationRepo = new CaseLocationRepo(db, args.caseId);
    const assetRepo = new CaseAssetRepo(db, args.caseId);
    const damageRepo = new CaseDamageRepo(db, args.caseId);
    const evidenceRepo = new CaseEvidenceRepo(db, args.caseId);
    const eventRepo = new CaseEventRepo(db, args.caseId);
    const [persons, organizations, locations, assets, damages, evidences, events] = await Promise.all([
      personRepo.getAll(),
      organizationRepo.getAll(),
      locationRepo.getAll(),
      assetRepo.getAll(),
      damageRepo.getAll(),
      evidenceRepo.getAll(),
      eventRepo.getAll(),
    ]);

    if (
      persons.length === 0 &&
      organizations.length === 0 &&
      locations.length === 0 &&
      assets.length === 0 &&
      damages.length === 0 &&
      evidences.length === 0 &&
      events.length === 0
    ) {
      throw new Error('No entities found for analysis');
    }

    const entity = JSON.stringify({
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
    });

    const results = await runAgentStream(
      event,
      runId,
      { description, entity, thai: args.thai },
      'structure:analyze',
      (p) => p.linkAnalysisAgent,
      (...a) => new LinkAnalysisAgent(...a),
      db,
    );
    if (Array.isArray(results)) {
      const linkRepo = new CaseLinkRepo(db, args.caseId);
      await linkRepo.deleteAll();
      for (const r of results) {
        await linkRepo.create(r.source_id, r.target_id, {
          relation: r.relation,
          confidence: r.confidence,
        });
      }
    }
    return results;
  }

  async function getAllPersons(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Person[]> {
    const personRepo = new CasePersonRepo(db, caseId);
    const ret = await personRepo.getAll();
    return ret.map((p) => ({
      ...p,
      types: JSON.parse(p.types),
    }));
  }

  async function getAllOrganizations(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Organization[]> {
    const organizationRepo = new CaseOrganizationRepo(db, caseId);
    const ret = await organizationRepo.getAll();
    return ret.map((o) => ({
      ...o,
      types: JSON.parse(o.types),
    }));
  }

  async function getAllLocations(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Location[]> {
    const locationRepo = new CaseLocationRepo(db, caseId);
    const ret = await locationRepo.getAll();
    return ret.map((l) => ({
      ...l,
      types: JSON.parse(l.types),
    }));
  }

  async function getAllAssets(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Asset[]> {
    const assetRepo = new CaseAssetRepo(db, caseId);
    const ret = await assetRepo.getAll();
    return ret.map((a) => ({
      ...a,
      types: JSON.parse(a.types),
    }));
  }

  async function getAllDamages(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Damage[]> {
    const damageRepo = new CaseDamageRepo(db, caseId);
    const ret = await damageRepo.getAll();
    return ret.map((d) => ({
      ...d,
      types: JSON.parse(d.types),
    }));
  }

  async function getAllEvidence(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Evidence[]> {
    const evidenceRepo = new CaseEvidenceRepo(db, caseId);
    const ret = await evidenceRepo.getAll();
    return ret.map((e) => ({
      ...e,
      types: JSON.parse(e.types),
    }));
  }

  async function getAllEvents(_event: Electron.IpcMainInvokeEvent, caseId: string): Promise<Event[]> {
    const eventRepo = new CaseEventRepo(db, caseId);
    const ret = await eventRepo.getAll();
    return ret.map((e) => ({
      ...e,
      types: JSON.parse(e.types),
    }));
  }

  function getAllLink(_events: Electron.IpcMainInvokeEvent, caseId: string) {
    const linkRepo = new CaseLinkRepo(db, caseId);
    return linkRepo.getAll();
  }

  ipcMain.handle('structure:extract', extract);
  ipcMain.handle('structure:analyze', analyze);
  ipcMain.handle('structure:getAllPersons', getAllPersons);
  ipcMain.handle('structure:getAllOrganizations', getAllOrganizations);
  ipcMain.handle('structure:getAllLocations', getAllLocations);
  ipcMain.handle('structure:getAllAssets', getAllAssets);
  ipcMain.handle('structure:getAllDamages', getAllDamages);
  ipcMain.handle('structure:getAllEvidence', getAllEvidence);
  ipcMain.handle('structure:getAllEvents', getAllEvents);
  ipcMain.handle('structure:getAllLinks', getAllLink);
}

export interface IStructure {
  extract: (runId: string, args: StructureArgs) => Promise<unknown>;
  onExtract: (fn: StreamFn) => void;
  analyze: (runId: string, args: StructureArgs) => Promise<unknown>;
  onAnalyze: (fn: StreamFn) => void;
  getAllPersons: (caseId: string) => Promise<Person[]>;
  getAllOrganizations: (caseId: string) => Promise<Organization[]>;
  getAllLocations: (caseId: string) => Promise<Location[]>;
  getAllAssets: (caseId: string) => Promise<Asset[]>;
  getAllDamages: (caseId: string) => Promise<Damage[]>;
  getAllEvidence: (caseId: string) => Promise<Evidence[]>;
  getAllEvents: (caseId: string) => Promise<Event[]>;
  getAllLinks: (caseId: string) => Promise<CaseLink[]>;
}
