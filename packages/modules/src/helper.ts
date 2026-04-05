import type { BaseAgent } from '@repo/agents';
import { type DB, UsageLogRepo } from '@repo/repos';
import type { IpcMainInvokeEvent } from 'electron/renderer';
import { availableProviders, type Provider } from './provider';

export type StreamFn = (event: IpcMainInvokeEvent, runId: string, type: string, text?: string) => void;

type AgentFactory = (
  providerName: string,
  modelName: string,
  baseUrl: string | undefined,
  apiKey: string | undefined,
  reasoning: number,
  temperature: number,
  maxOutputTokens: number,
) => BaseAgent;

export async function runAgentStream<T>(
  event: Electron.IpcMainInvokeEvent,
  runId: string,
  args: T,
  channel: string,
  providerSelector: (p: Provider) => boolean,
  createAgent: AgentFactory,
  db?: DB,
): Promise<unknown> {
  const errors = new Set<string>();
  const providers = availableProviders(providerSelector);
  for (const p of providers) {
    try {
      const agent = createAgent(
        p.providerName,
        p.modelName,
        p.baseUrl,
        p.apiKey,
        p.reasoning,
        p.temperature,
        p.maxOutputTokens,
      );
      const { reasoningStream, textStream, done } = agent.runStream(args);

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
        event.sender.send(channel, runId, 'reason-end', agent.getReasoningText());
      }
      if (hasText) {
        event.sender.send(channel, runId, 'text-end', agent.getText());
      }

      if (db) {
        const usageLogRepo = new UsageLogRepo(db);
        const usage = agent.getUsage();
        await usageLogRepo.create({
          agentName: agent.name(),
          provider: p.providerName,
          model: p.modelName,
          input: usage.input,
          output: usage.output,
          total: usage.total,
        });
      }
      return agent.getOutput();
    } catch (err) {
      errors.add((err as Error).message);
    }
  }
  throw new Error(`${[...errors].filter(Boolean).join('; ')}`);
}

export async function runAgent<T>(
  _event: Electron.IpcMainInvokeEvent,
  args: T,
  providerSelector: (p: Provider) => boolean,
  createAgent: AgentFactory,
  db?: DB,
): Promise<unknown> {
  const errors = new Set<string>();
  const providers = availableProviders(providerSelector);
  for (const p of providers) {
    try {
      const agent = createAgent(
        p.providerName,
        p.modelName,
        p.baseUrl,
        p.apiKey,
        p.reasoning,
        p.temperature,
        p.maxOutputTokens,
      );
      await agent.run(args);
      if (db) {
        const usageLogRepo = new UsageLogRepo(db);
        const usage = agent.getUsage();
        await usageLogRepo.create({
          agentName: agent.name(),
          provider: p.providerName,
          model: p.modelName,
          input: usage.input,
          output: usage.output,
          total: usage.total,
        });
      }
      return agent.getOutput();
    } catch (err) {
      errors.add((err as Error).message);
    }
  }
  throw new Error(`${[...errors].filter(Boolean).join('; ')}`);
}
