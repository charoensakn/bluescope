import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usageLogsTable = sqliteTable(
  'usage_logs',
  {
    agentName: text('agent_name').notNull(),
    createdAt: integer('created_at').notNull(),
    provider: text(),
    model: text(),
    input: integer(),
    output: integer(),
    total: integer(),
  },
  (table) => [primaryKey({ columns: [table.agentName, table.createdAt] })],
);

export const casesTable = sqliteTable('cases', {
  id: text().primaryKey(),
  caseNumber: text('case_number'),
  title: text(),
  status: integer(),
  priority: integer(),
  summary: text(),
  description: text(),
  entity: text(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
});

export const caseDescriptionLogsTable = sqliteTable(
  'case_description_logs',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    inputDescription: text('input_description'),
    inputEntity: text('input_entity'),
    description: text(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseEntityLogsTable = sqliteTable(
  'case_entity_logs',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    inputDescription: text('input_description'),
    inputEntity: text('input_entity'),
    entity: text(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseTypesTable = sqliteTable(
  'case_types',
  {
    caseId: text('case_id').notNull(),
    caseType: text('case_type').notNull(),
    reason: text(),
    confidence: real(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.caseType] })],
);

export const caseSuggestionsTable = sqliteTable(
  'case_suggestions',
  {
    caseId: text('case_id').notNull(),
    caseType: text('case_type').notNull(),
    suggestion: text(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    deletedAt: integer('deleted_at'),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.caseType] })],
);

export const casePersonsTable = sqliteTable(
  'case_persons',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // suspect, victim, witness, officer, complainant, owner, driver, named individual, other
    name: text(),
    personDetails: text('person_details'),
    condition: text(),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseOrganizationsTable = sqliteTable(
  'case_organizations',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // department, company, agency, institution, group, bank, school, hospital, other
    name: text(),
    organizationDetails: text('organization_details'),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseLocationsTable = sqliteTable(
  'case_locations',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // address, building, city, district, province, coordinate, landmark, other
    name: text(),
    locationDetails: text('location_details'),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseAssetsTable = sqliteTable(
  'case_assets',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // vehicle, phone, money, weapon, jewelry, document, card, equipment, other
    name: text(),
    assetDetails: text('asset_details'),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseDamagesTable = sqliteTable(
  'case_damages',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // injury, financial loss, theft loss, broken property, destruction, other
    name: text(),
    damageDetails: text('damage_details'),
    value: text(),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseEvidenceTable = sqliteTable(
  'case_evidence',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // cctv, photo, video, fingerprint, dna, statement, forensic item, log, report, seized proof, other
    name: text(),
    evidenceDetails: text('evidence_details'),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseEventsTable = sqliteTable(
  'case_events',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    id: text(),
    types: text(), // theft, assault, arrest, interview, seizure, collision, fraud, report, damage, search, other
    name: text(),
    occurrenceTime: text('occurrence_time'),
    eventDetails: text('event_details'),
    confidence: real(),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.createdAt] })],
);

export const caseLinksTable = sqliteTable(
  'case_links',
  {
    caseId: text('case_id').notNull(),
    createdAt: integer('created_at').notNull(),
    sourceId: text('source_id').notNull(),
    targetId: text('target_id').notNull(),
    relation: text(),
    confidence: real(),
  },
  (table) => [
    primaryKey({
      columns: [table.caseId, table.createdAt, table.sourceId, table.targetId],
    }),
  ],
);

export const presetsTable = sqliteTable('presets', {
  id: text().primaryKey(),
  name: text(),
  providerId: text(),
  prompt: text(),
});
