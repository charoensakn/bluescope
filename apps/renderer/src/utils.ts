import type { Provider } from '@repo/modules';
import { m } from './paraglide/messages';

export function getShortId(id?: string): string {
  if (!id) {
    return '-';
  }

  return id.split('-')[0] || id;
}

export const AGENT_KEYS: Array<keyof Provider> = [
  'titleAgent',
  'summaryAgent',
  'descriptionRefinementAgent',
  'entityRefinementAgent',
  'structureExtractionAgent',
  'linkAnalysisAgent',
  'classificationAgent',
  'advisoryAgent',
];

export function countEnabledAgents(provider: Provider): number {
  return AGENT_KEYS.reduce((count, key) => (provider[key] ? count + 1 : count), 0);
}

export const PROVIDER_NAME_MAP: Record<string, string> = {
  compat: 'OpenAI-Compatible API',
  openai: 'OpenAI',
  azure: 'Azure OpenAI',
  anthropic: 'Anthropic',
  google: 'Google Generative AI',
  xai: 'xAI Grok',
  mistral: 'Mistral',
  togetherai: 'Together.ai',
  cohere: 'Cohere',
  fireworks: 'Fireworks',
  deepinfra: 'DeepInfra',
  deepseek: 'DeepSeek',
  cerebras: 'Cerebras',
  groq: 'Groq',
  perplexity: 'Perplexity',
};

export function getProviderName(providerId: string): string {
  return PROVIDER_NAME_MAP[providerId] || providerId;
}

export function getPriorityLabel(priority: number) {
  switch (priority) {
    case 2:
      return m.priority_2(undefined, { locale: 'en' });
    case 3:
      return m.priority_3(undefined, { locale: 'en' });
    case 4:
      return m.priority_4(undefined, { locale: 'en' });
    case 5:
      return m.priority_5(undefined, { locale: 'en' });
    default:
      return m.priority_1(undefined, { locale: 'en' });
  }
}

export function getPriorityColor(priority: number) {
  switch (priority) {
    case 2:
      return 'primary';
    case 3:
      return 'success';
    case 4:
      return 'warning';
    case 5:
      return 'error';
    default:
      return 'default';
  }
}

export function getPriorityProgressColor(priority: number) {
  switch (priority) {
    case 2:
      return 'primary';
    case 3:
      return 'success';
    case 4:
      return 'warning';
    case 5:
      return 'error';
    default:
      return 'info';
  }
}

export function getErrorMessage(err: unknown) {
  let message: string = m.unknown();
  if (err instanceof Error) {
    message = m.error({ message: err.message });
  } else if (typeof err === 'string') {
    message = m.error({ message: err });
  }
  return { severity: 'error' as 'error', message };
}

export function getSavedMessage() {
  return { severity: 'success' as 'success', message: m.save_success() };
}
