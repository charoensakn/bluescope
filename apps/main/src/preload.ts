// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

type Fn = (event: Electron.IpcRendererEvent, ...args: unknown[]) => void;

contextBridge.exposeInMainWorld('appversions', () => ipcRenderer.sendSync('versions'));

contextBridge.exposeInMainWorld('versions', () => process.versions);

contextBridge.exposeInMainWorld('openExternal', (url: string) => ipcRenderer.send('openExternal', url));

contextBridge.exposeInMainWorld('browser', {
  restart: () => ipcRenderer.send('restart'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close'),
  removeAllListeners: () => ipcRenderer.removeAllListeners(),
  setTitle: (title: string) => ipcRenderer.send('setTitle', title),
});

contextBridge.exposeInMainWorld('case', {
  create: (data: object) => ipcRenderer.invoke('case:create', data),
  getAll: () => ipcRenderer.invoke('case:getAll'),
  get: (id: string) => ipcRenderer.invoke('case:get', id),
  update: (id: string, data: object) => ipcRenderer.invoke('case:update', id, data),
  archive: (id: string) => ipcRenderer.invoke('case:archive', id),
  unarchive: (id: string) => ipcRenderer.invoke('case:unarchive', id),
  delete: (id: string) => ipcRenderer.invoke('case:delete', id),
  getWithRelatedData: (id: string) => ipcRenderer.invoke('case:getWithRelatedData', id),
  addDescriptionLog: (id: string, log: object) => ipcRenderer.invoke('case:addDescriptionLog', id, log),
  addEntityLog: (id: string, log: object) => ipcRenderer.invoke('case:addEntityLog', id, log),
});

contextBridge.exposeInMainWorld('config', {
  getTheme: () => ipcRenderer.sendSync('config:getTheme'),
  getThemeMode: () => ipcRenderer.sendSync('config:getThemeMode'),
  setTheme: (theme: string) => ipcRenderer.invoke('config:setTheme', theme),
  getUiLocale: () => ipcRenderer.sendSync('config:getUiLocale'),
  setUiLocale: (uiLocale: string) => ipcRenderer.invoke('config:setUiLocale', uiLocale),
  getPromptLocale: () => ipcRenderer.sendSync('config:getPromptLocale'),
  setPromptLocale: (promptLocale: string) => ipcRenderer.invoke('config:setPromptLocale', promptLocale),
  getReasoning: () => ipcRenderer.sendSync('config:getReasoning'),
  setReasoning: (reasoning: string) => ipcRenderer.invoke('config:setReasoning', reasoning),
});

contextBridge.exposeInMainWorld('llm', {
  generateSampleText: (args: object) => ipcRenderer.invoke('llm:generateSampleText', args),
  generateText: (args: object) => ipcRenderer.invoke('llm:generateText', args),
  streamText: (runId: string, args: object) => ipcRenderer.send('llm:streamText', runId, args),
  onStreamText: (fn: Fn) => ipcRenderer.on('llm:streamText', fn),
});

contextBridge.exposeInMainWorld('provider', {
  getAll: () => ipcRenderer.invoke('provider:getAll'),
  put: (data: object) => ipcRenderer.invoke('provider:put', data),
  remove: (id: string) => ipcRenderer.invoke('provider:remove', id),
  moveUp: (id: string) => ipcRenderer.invoke('provider:moveUp', id),
  moveDown: (id: string) => ipcRenderer.invoke('provider:moveDown', id),
  markDefault: (id: string) => ipcRenderer.invoke('provider:markDefault', id),
});

contextBridge.exposeInMainWorld('refinement', {
  refineDescription: (runId: string, args: object) => ipcRenderer.invoke('refinement:refineDescription', runId, args),
  onRefineDescription: (fn: Fn) => ipcRenderer.on('refinement:refineDescription', fn),
  refineEntity: (runId: string, args: object) => ipcRenderer.invoke('refinement:refineEntity', runId, args),
  onRefineEntity: (fn: Fn) => ipcRenderer.on('refinement:refineEntity', fn),
  getAllDescriptionLogs: (caseId: string) => ipcRenderer.invoke('refinement:getAllDescriptionLogs', caseId),
  getAllEntityLogs: (caseId: string) => ipcRenderer.invoke('refinement:getAllEntityLogs', caseId),
});

contextBridge.exposeInMainWorld('structure', {
  extract: (runId: string, args: object) => ipcRenderer.invoke('structure:extract', runId, args),
  onExtract: (fn: Fn) => ipcRenderer.on('structure:extract', fn),
  analyze: (runId: string, args: object) => ipcRenderer.invoke('structure:analyze', runId, args),
  onAnalyze: (fn: Fn) => ipcRenderer.on('structure:analyze', fn),
  getAllPersons: (caseId: string) => ipcRenderer.invoke('structure:getAllPersons', caseId),
  getAllOrganizations: (caseId: string) => ipcRenderer.invoke('structure:getAllOrganizations', caseId),
  getAllLocations: (caseId: string) => ipcRenderer.invoke('structure:getAllLocations', caseId),
  getAllAssets: (caseId: string) => ipcRenderer.invoke('structure:getAllAssets', caseId),
  getAllDamages: (caseId: string) => ipcRenderer.invoke('structure:getAllDamages', caseId),
  getAllEvidence: (caseId: string) => ipcRenderer.invoke('structure:getAllEvidence', caseId),
  getAllEvents: (caseId: string) => ipcRenderer.invoke('structure:getAllEvents', caseId),
  getAllLinks: (caseId: string) => ipcRenderer.invoke('structure:getAllLinks', caseId),
});

contextBridge.exposeInMainWorld('advisor', {
  suggest: (runId: string, args: object) => ipcRenderer.invoke('advisor:suggest', runId, args),
  onSuggest: (fn: Fn) => ipcRenderer.on('advisor:suggest', fn),
  synthesize: (runId: string, args: object) => ipcRenderer.invoke('advisor:synthesize', runId, args),
  onSynthesize: (fn: Fn) => ipcRenderer.on('advisor:synthesize', fn),
  getAll: (caseId: string) => ipcRenderer.invoke('advisor:getAll', caseId),
  getAllSuggestions: (caseId: string) => ipcRenderer.invoke('advisor:getAllSuggestions', caseId),
  getSynthesis: (caseId: string) => ipcRenderer.invoke('advisor:getSynthesis', caseId),
  deleteAll: (caseId: string) => ipcRenderer.invoke('advisor:deleteAll', caseId),
  toggle: (caseId: string, caseType: string, deleted: boolean) =>
    ipcRenderer.invoke('advisor:toggle', caseId, caseType, deleted),
});

contextBridge.exposeInMainWorld('classification', {
  categorize: (runId: string, args: object) => ipcRenderer.invoke('classification:categorize', runId, args),
  onCategorize: (fn: Fn) => ipcRenderer.on('classification:categorize', fn),
  getAll: (caseId: string) => ipcRenderer.invoke('classification:getAll', caseId),
  deleteAll: (caseId: string) => ipcRenderer.invoke('classification:deleteAll', caseId),
  getSkills: () => ipcRenderer.invoke('classification:getSkills'),
  selectSkill: (caseId: string, skillId: string, selected: boolean) =>
    ipcRenderer.invoke('classification:selectSkill', caseId, skillId, selected),
});

contextBridge.exposeInMainWorld('description', {
  generateTitle: (runId: string, args: object) => ipcRenderer.invoke('description:generateTitle', runId, args),
  onGenerateTitle: (fn: Fn) => ipcRenderer.on('description:generateTitle', fn),
  summarize: (runId: string, args: object) => ipcRenderer.invoke('description:summarize', runId, args),
  onSummarize: (fn: Fn) => ipcRenderer.on('description:summarize', fn),
});

contextBridge.exposeInMainWorld('log', {
  getAll: () => ipcRenderer.invoke('log:getAll'),
});

contextBridge.exposeInMainWorld('dev', {
  generate: (runId: string, args: object) => ipcRenderer.invoke('dev:generate', runId, args),
  onGenerate: (fn: Fn) => ipcRenderer.on('dev:generate', fn),
});

contextBridge.exposeInMainWorld('dashboard', {
  getStats: () => ipcRenderer.invoke('dashboard:getStats'),
});

contextBridge.exposeInMainWorld('preset', {
  getAll: () => ipcRenderer.invoke('preset:getAll'),
  get: (id: string) => ipcRenderer.invoke('preset:get', id),
  create: (data: object) => ipcRenderer.invoke('preset:create', data),
  update: (id: string, data: object) => ipcRenderer.invoke('preset:update', id, data),
  remove: (id: string) => ipcRenderer.invoke('preset:remove', id),
});

contextBridge.exposeInMainWorld('search', {
  refresh: () => ipcRenderer.invoke('search:refresh'),
  search: (query: string) => ipcRenderer.invoke('search:search', query),
});
