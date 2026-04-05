import type {
  advisorModule,
  browserModule,
  caseModule,
  classificationModule,
  configModule,
  dashboardModule,
  descriptionModule,
  devModule,
  llmModule,
  logModule,
  presetModule,
  providerModule,
  refinementModule,
  searchModule,
  structureModule,
} from '@repo/modules';

declare global {
  interface Window {
    appversions: () => Record<string, string>;
    versions: () => Record<string, string>;
    openExternal: (url: string) => Promise<void>;
    browser: browserModule.IBrowser;
    advisor: advisorModule.IAdvisor;
    case: caseModule.ICase;
    classification: classificationModule.IClassification;
    config: configModule.IConfig;
    description: descriptionModule.IDescription;
    provider: providerModule.IProvider;
    refinement: refinementModule.IRefinement;
    structure: structureModule.IStructure;
    llm: llmModule.ILLM;
    log: logModule.ILog;
    dev: devModule.IDev;
    dashboard: dashboardModule.IDashboard;
    preset: presetModule.IPreset;
    search: searchModule.ISearch;
  }
}
