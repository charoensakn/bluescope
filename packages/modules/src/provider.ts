import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { app, ipcMain, safeStorage } from 'electron';

export type Provider = {
  id?: string;
  providerName: string;
  baseUrl?: string;
  apiKey?: string;
  reasoning?: number;
  temperature?: number;
  maxOutputTokens?: number;
  modelName?: string;
  titleAgent?: boolean;
  summaryAgent?: boolean;
  descriptionRefinementAgent?: boolean;
  entityRefinementAgent?: boolean;
  structureExtractionAgent?: boolean;
  linkAnalysisAgent?: boolean;
  classificationAgent?: boolean;
  advisoryAgent?: boolean;
  default?: boolean;
};

const providersStatePath = path.join(app.getPath('userData'), 'providers-state.json');

let cache: Provider[] | null = null;

function readProviders(): Provider[] {
  if (cache) {
    return cache;
  }

  if (fs.existsSync(providersStatePath)) {
    if (safeStorage.isEncryptionAvailable()) {
      try {
        const encryptedData = fs.readFileSync(providersStatePath);
        const decryptedData = safeStorage.decryptString(encryptedData);
        const providers = JSON.parse(decryptedData);
        cache = providers;
        return providers;
      } catch {
        // If there's an error reading/parsing/decrypting the file, fall back to default
      }
    } else {
      try {
        const data = fs.readFileSync(providersStatePath, { encoding: 'utf8' });
        const providers = JSON.parse(data);
        cache = providers;
        return providers;
      } catch {
        // If there's an error reading/parsing the file, fall back to default
      }
    }
  }
  return [];
}

export function availableProviders(predicate: (provider: Provider) => boolean): Provider[] {
  const providers = readProviders().filter(predicate);
  const defaultProvider = readProviders().find((p) => p.default);
  if (defaultProvider && !providers.some((p) => p.id === defaultProvider.id)) {
    providers.push(defaultProvider);
  }
  return providers;
}

function saveProviders(providers: Provider[]) {
  const data = JSON.stringify(providers);
  if (safeStorage.isEncryptionAvailable()) {
    const encryptedData = safeStorage.encryptString(data);
    fs.writeFileSync(providersStatePath, encryptedData);
  } else {
    fs.writeFileSync(providersStatePath, data, { encoding: 'utf8' });
  }
  cache = null;
}

function mapProviderToConfig(provider: Provider) {
  return {
    id: provider.id || randomUUID(),
    providerName: provider.providerName || 'compat',
    baseUrl: provider.baseUrl || '',
    apiKey: provider.apiKey || '',
    reasoning:
      typeof provider.reasoning === 'number' && provider.reasoning >= 0
        ? provider.reasoning > 3
          ? 3
          : provider.reasoning
        : -1,
    temperature:
      typeof provider.temperature === 'number' && provider.temperature >= 0
        ? provider.temperature > 1
          ? 1
          : provider.temperature
        : -1,
    maxOutputTokens:
      typeof provider.maxOutputTokens === 'number' && provider.maxOutputTokens >= 0 ? provider.maxOutputTokens : -1,
    modelName: provider.modelName || '',
    titleAgent: provider.titleAgent ?? true,
    summaryAgent: provider.summaryAgent ?? true,
    descriptionRefinementAgent: provider.descriptionRefinementAgent ?? true,
    entityRefinementAgent: provider.entityRefinementAgent ?? true,
    structureExtractionAgent: provider.structureExtractionAgent ?? true,
    linkAnalysisAgent: provider.linkAnalysisAgent ?? true,
    classificationAgent: provider.classificationAgent ?? true,
    advisoryAgent: provider.advisoryAgent ?? true,
    default: provider.default ?? false,
  };
}

function getAll(_event: Electron.IpcMainInvokeEvent) {
  return readProviders();
}

function put(_event: Electron.IpcMainInvokeEvent, provider: Provider) {
  const providers = readProviders();
  const existingIndex = providers.findIndex((p: Provider) => p.id === provider.id);
  const mappedProvider = mapProviderToConfig(provider);

  let current: Provider[];
  if (existingIndex >= 0) {
    providers[existingIndex] = mappedProvider;
    current = providers;
  } else {
    current = [mappedProvider, ...providers];
  }

  if (mappedProvider.default) {
    const updatedProviders = current.map((p: Provider) => ({
      ...p,
      default: p.id === mappedProvider.id,
    }));
    saveProviders(updatedProviders);
  } else {
    // If the provider is not marked as default, ensure at least one provider is default
    const hasDefault = current.some((p: Provider) => p.default);
    if (!hasDefault && current.length > 0) {
      current[0] = { ...current[0], default: true };
    }
    saveProviders(current);
  }
  return mappedProvider.id;
}

function remove(_event: Electron.IpcMainInvokeEvent, providerId: string) {
  try {
    const providers = readProviders();
    const updatedProviders = providers.filter((p: Provider) => p.id !== providerId);
    saveProviders(updatedProviders);
    return true;
  } catch {
    return false;
  }
}

function moveUp(_event: Electron.IpcMainInvokeEvent, providerId: string) {
  try {
    const providers = readProviders();
    const index = providers.findIndex((p: Provider) => p.id === providerId);
    if (index > 0) {
      [providers[index - 1], providers[index]] = [providers[index], providers[index - 1]];
      saveProviders(providers);
    }
    return true;
  } catch {
    return false;
  }
}

function moveDown(_event: Electron.IpcMainInvokeEvent, providerId: string) {
  try {
    const providers = readProviders();
    const index = providers.findIndex((p: Provider) => p.id === providerId);
    if (index >= 0 && index < providers.length - 1) {
      [providers[index], providers[index + 1]] = [providers[index + 1], providers[index]];
      saveProviders(providers);
    }
    return true;
  } catch {
    return false;
  }
}

function markDefault(_event: Electron.IpcMainInvokeEvent, providerId: string) {
  try {
    const providers = readProviders();
    const updatedProviders = providers.map((p: Provider) => ({
      ...p,
      default: p.id === providerId,
    }));
    saveProviders(updatedProviders);
    return true;
  } catch {
    return false;
  }
}

export function register() {
  ipcMain.handle('provider:getAll', getAll);
  ipcMain.handle('provider:put', put);
  ipcMain.handle('provider:remove', remove);
  ipcMain.handle('provider:moveUp', moveUp);
  ipcMain.handle('provider:moveDown', moveDown);
  ipcMain.handle('provider:markDefault', markDefault);
}

export interface IProvider {
  getAll: () => Promise<Provider[]>;
  put: (data: object) => Promise<string>;
  remove: (id: string) => Promise<boolean>;
  moveUp: (id: string) => Promise<boolean>;
  moveDown: (id: string) => Promise<boolean>;
  markDefault: (id: string) => Promise<boolean>;
}
