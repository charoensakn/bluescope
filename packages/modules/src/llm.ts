import { LLM } from '@repo/agents';
import { ipcMain } from 'electron';
import type { StreamFn } from './helper';

export type LLMArgs = {
  providerName?: string;
  baseUrl?: string;
  apiKey?: string;
  reasoning?: number;
  temperature?: number;
  maxOutputTokens?: number;
  modelName?: string;
  system?: string;
  prompt?: string;
};

export type LLMResult = {
  reasoning: string;
  text: string;
};

async function generateSampleText(_event: Electron.IpcMainInvokeEvent, args: LLMArgs): Promise<string> {
  const { providerName, baseUrl, apiKey, modelName, prompt } = args;
  if (!providerName) {
    throw new Error('Provider is required');
  }

  const llm = new LLM(providerName, modelName, baseUrl, apiKey, -1, -1, 1024);
  await llm.generateText({ prompt: prompt || 'hello' });
  return llm.text || '';
}

async function generateText(_event: Electron.IpcMainInvokeEvent, args: LLMArgs): Promise<LLMResult> {
  const { providerName, baseUrl, apiKey, reasoning, temperature, maxOutputTokens, modelName, system, prompt } = args;
  if (!providerName) {
    throw new Error('Provider is required');
  }
  if (!modelName) {
    throw new Error('Model name is required');
  }

  const llm = new LLM(providerName, modelName, baseUrl, apiKey, reasoning, temperature, maxOutputTokens);
  await llm.generateText({ system, prompt: prompt || 'hello' });
  return { reasoning: llm.reasoningText || '', text: llm.text || '' };
}

async function streamText(event: Electron.IpcMainInvokeEvent, runId: string, args: LLMArgs): Promise<void> {
  const { providerName, baseUrl, apiKey, reasoning, temperature, maxOutputTokens, modelName, system, prompt } = args;
  if (!providerName) {
    throw new Error('Provider is required');
  }
  if (!modelName) {
    throw new Error('Model name is required');
  }

  const llm = new LLM(providerName, modelName, baseUrl, apiKey, reasoning, temperature, maxOutputTokens);
  const { reasoningStream, textStream, done } = llm.streamText({
    system,
    prompt,
  });

  let hasReasoning = false;
  for await (const reasoning of reasoningStream) {
    if (!hasReasoning) {
      event.sender.send('llm:streamText', runId, 'reason-begin');
      hasReasoning = true;
    }
    event.sender.send('llm:streamText', runId, 'reason-stream', reasoning);
  }

  let hasText = false;
  for await (const text of textStream) {
    if (!hasText) {
      event.sender.send('llm:streamText', runId, 'text-begin');
      hasText = true;
    }
    event.sender.send('llm:streamText', runId, 'text-stream', text);
  }

  await done;

  if (hasReasoning) {
    event.sender.send('llm:streamText', runId, 'reason-end', llm.reasoningText);
  }
  if (hasText) {
    event.sender.send('llm:streamText', runId, 'text-end', llm.text);
  }
}

export function register() {
  ipcMain.handle('llm:generateSampleText', generateSampleText);
  ipcMain.handle('llm:generateText', generateText);
  ipcMain.on('llm:streamText', streamText);
}

export interface ILLM {
  generateSampleText: (args: LLMArgs) => Promise<string>;
  generateText: (args: LLMArgs) => Promise<LLMResult>;
  streamText: (runId: string, args: LLMArgs) => void;
  onStreamText: (fn: StreamFn) => void;
}
