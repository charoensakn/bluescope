import { type AnthropicLanguageModelOptions, createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createCerebras } from '@ai-sdk/cerebras';
import { type CohereLanguageModelOptions, createCohere } from '@ai-sdk/cohere';
import { createDeepInfra } from '@ai-sdk/deepinfra';
import { createDeepSeek, type DeepSeekLanguageModelOptions } from '@ai-sdk/deepseek';
import { createFireworks, type FireworksLanguageModelOptions } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI, type GoogleLanguageModelOptions } from '@ai-sdk/google';
import { createGroq, type GroqLanguageModelOptions } from '@ai-sdk/groq';
import { createMistral, type MistralLanguageModelOptions } from '@ai-sdk/mistral';
import { createOpenAI, type OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createPerplexity } from '@ai-sdk/perplexity';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createXai, type XaiLanguageModelChatOptions } from '@ai-sdk/xai';
import {
  generateText as aiGenerateText,
  streamText as aiStreamText,
  extractReasoningMiddleware,
  Output,
  wrapLanguageModel,
} from 'ai';

export type InputOptions = {
  system?: string;
  prompt: string;
  output?: Output.Output;
};

export type OutputStream = {
  reasoningStream: AsyncGenerator<string>;
  textStream: AsyncGenerator<string>;
  done: Promise<void>;
};

export class LLM {
  isRun = false;
  reasoningText?: string;
  text?: string;
  output?: unknown;
  inputUsage?: number;
  outputUsage?: number;
  totalUsage?: number;

  constructor(
    public providerName: string,
    public model?: string,
    public baseURL?: string,
    public apiKey?: string,
    public reasoning = -1,
    public temperature = -1,
    public maxOutputTokens = -1,
  ) {}

  createProvider() {
    if (this.providerName === 'compat') {
      if (!this.baseURL) {
        throw new Error('Base URL is required for OpenAI-Compatible API');
      }
      return createOpenAICompatible({
        name: 'compat',
        baseURL: this.baseURL,
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'openai') {
      return createOpenAI({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'azure') {
      if (!this.baseURL) {
        throw new Error('Base URL is required for Azure OpenAI, https://{resourceName}.openai.azure.com/openai/v1');
      }
      return createAzure({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
      });
    } else if (this.providerName === 'anthropic') {
      return createAnthropic({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'google') {
      return createGoogleGenerativeAI({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'xai') {
      return createXai({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'mistral') {
      return createMistral({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'togetherai') {
      return createTogetherAI({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'cohere') {
      return createCohere({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'fireworks') {
      return createFireworks({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'deepinfra') {
      return createDeepInfra({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'deepseek') {
      return createDeepSeek({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'cerebras') {
      return createCerebras({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'groq') {
      return createGroq({
        apiKey: this.apiKey,
      });
    } else if (this.providerName === 'perplexity') {
      return createPerplexity({
        apiKey: this.apiKey,
      });
    } else {
      throw new Error(`Unsupported provider: ${this.providerName}`);
    }
  }

  getReasoning() {
    return typeof this.reasoning === 'number' && this.reasoning >= 0
      ? this.reasoning > 3
        ? 3
        : this.reasoning
      : undefined;
  }

  getTemperature() {
    return typeof this.temperature === 'number' && this.temperature >= 0
      ? this.temperature > 1
        ? 1
        : this.temperature
      : undefined;
  }

  getMaxOutputTokens() {
    return typeof this.maxOutputTokens === 'number' && this.maxOutputTokens >= 1 ? this.maxOutputTokens : undefined;
  }

  private markRun() {
    if (this.isRun) {
      throw new Error('Agent is already run. Create a new instance to run again.');
    }
    this.isRun = true;
  }

  private getProviderOptions() {
    if (this.reasoning < 0) {
      return {};
    }

    if (this.providerName === 'compat') {
      if (this.reasoning === 0) return {};
      return {
        providerName: {
          reasoningEffort: this.reasoning === 1 ? 'low' : this.reasoning === 2 ? 'medium' : 'high',
        },
      };
    } else if (this.providerName === 'openai' || this.providerName === 'azure') {
      return {
        openai: {
          reasoningEffort:
            this.reasoning === 0 ? 'none' : this.reasoning === 1 ? 'low' : this.reasoning === 2 ? 'medium' : 'high',
        } satisfies OpenAILanguageModelResponsesOptions,
      };
    } else if (this.providerName === 'anthropic') {
      if (this.reasoning === 0) return {};
      return {
        anthropic: {
          effort: this.reasoning === 1 ? 'low' : this.reasoning === 2 ? 'medium' : 'high',
        } satisfies AnthropicLanguageModelOptions,
      };
    } else if (this.providerName === 'google') {
      if (this.reasoning === 0) return {};
      return {
        google: {
          thinkingConfig: {
            thinkingLevel: this.reasoning === 1 ? 'low' : this.reasoning === 2 ? 'medium' : 'high',
          },
        } satisfies GoogleLanguageModelOptions,
      };
    } else if (this.providerName === 'xai') {
      if (this.reasoning === 0) return {};
      return {
        xai: {
          reasoningEffort: this.reasoning >= 3 ? 'high' : 'low',
        } satisfies XaiLanguageModelChatOptions,
      };
    } else if (this.providerName === 'mistral') {
      return {
        mistral: {
          reasoningEffort: this.reasoning === 3 ? 'high' : 'none',
        } satisfies MistralLanguageModelOptions,
      };
    } else if (this.providerName === 'togetherai') {
      return {};
    } else if (this.providerName === 'cohere') {
      if (this.reasoning === 0)
        return {
          cohere: {
            thinking: {
              type: 'disabled',
            },
          } satisfies CohereLanguageModelOptions,
        };
      return {
        cohere: {
          thinking: {
            type: 'enabled',
            tokenBudget: this.reasoning === 1 ? 1024 : this.reasoning === 2 ? 2048 : 4096,
          },
        } satisfies CohereLanguageModelOptions,
      };
    } else if (this.providerName === 'fireworks') {
      if (this.reasoning === 0)
        return {
          fireworks: {
            thinking: {
              type: 'disabled',
            },
          } satisfies FireworksLanguageModelOptions,
        };
      return {
        fireworks: {
          thinking: {
            type: 'enabled',
            budgetTokens: this.reasoning === 1 ? 1024 : this.reasoning === 2 ? 2048 : 4096,
          },
        } satisfies FireworksLanguageModelOptions,
      };
    } else if (this.providerName === 'deepinfra') {
      return {};
    } else if (this.providerName === 'deepseek') {
      if (this.reasoning === 0)
        return {
          deepseek: {
            thinking: {
              type: 'disabled',
            },
          } satisfies DeepSeekLanguageModelOptions,
        };
      return {
        deepseek: {
          thinking: {
            type: 'enabled',
          },
        } satisfies DeepSeekLanguageModelOptions,
      };
    } else if (this.providerName === 'cerebras') {
      if (this.reasoning === 0) return {};
      return {
        cerebras: {
          reasoningEffort: this.reasoning === 1 ? 'low' : this.reasoning === 2 ? 'medium' : 'high',
        },
      };
    } else if (this.providerName === 'groq') {
      return {
        groq: {
          reasoningFormat: 'parsed',
          reasoningEffort:
            this.reasoning === 0
              ? 'none'
              : this.reasoning === 1
                ? 'low'
                : this.reasoning === 2
                  ? 'medium'
                  : this.reasoning === 3
                    ? 'high'
                    : 'default',
        } satisfies GroqLanguageModelOptions,
      };
    } else if (this.providerName === 'perplexity') {
      return {};
    } else {
      return {};
    }
  }

  async generateText({ system, prompt, output }: InputOptions): Promise<void> {
    this.markRun();

    const provider = this.createProvider();
    const result = await aiGenerateText({
      model:
        this.providerName === 'togetherai'
          ? wrapLanguageModel({
              model: provider(this.model || ''),
              middleware: extractReasoningMiddleware({ tagName: 'think' }),
            })
          : provider(this.model || ''),
      system,
      prompt,
      temperature: this.getTemperature(),
      maxOutputTokens: this.getMaxOutputTokens(),
      output: output || Output.text(),
      providerOptions: this.getProviderOptions(),
    });

    try {
      this.reasoningText = result.reasoningText;
      this.text = result.text;
      this.output = result.output;
      this.inputUsage = result.totalUsage?.inputTokens;
      this.outputUsage = result.totalUsage?.outputTokens;
      this.totalUsage = result.totalUsage?.totalTokens;
    } catch (err) {
      throw new Error(`Failed to generate output: ${(err as Error).message}`);
    }
  }

  streamText({ system, prompt, output }: InputOptions): OutputStream {
    this.markRun();

    const provider = this.createProvider();
    const result = aiStreamText({
      model:
        this.providerName === 'togetherai'
          ? wrapLanguageModel({
              model: provider(this.model || ''),
              middleware: extractReasoningMiddleware({ tagName: 'think' }),
            })
          : provider(this.model || ''),
      system,
      prompt,
      temperature: this.getTemperature(),
      maxOutputTokens: this.getMaxOutputTokens(),
      output: output || Output.text(),
      providerOptions: this.getProviderOptions(),
    });
    const chunks: Array<{ type: string; text: string }> = [];
    let streamDone: () => void;
    let streamError: (err: unknown) => void;
    const streamDonePromise = new Promise<void>((resolve, reject) => {
      streamDone = resolve;
      streamError = reject;
    });
    const done = streamDonePromise;

    // Consume fullStream in the background, collecting chunks
    (async () => {
      try {
        for await (const chunk of result.fullStream) {
          if (chunk.type === 'reasoning-delta' || chunk.type === 'text-delta') {
            chunks.push({ type: chunk.type, text: chunk.text });
          }
        }
        this.reasoningText = await result.reasoningText;
        this.text = await result.text;
        this.output = await result.output;
        const usage = await result.totalUsage;
        this.inputUsage = usage?.inputTokens;
        this.outputUsage = usage?.outputTokens;
        this.totalUsage = usage?.totalTokens;

        streamDone?.();
      } catch (err) {
        streamError?.(err);
      }
    })();

    async function* reasoningStream(): AsyncGenerator<string> {
      let index = 0;
      while (true) {
        while (index < chunks.length) {
          const chunk = chunks[index++];
          if (chunk.type === 'reasoning-delta') {
            yield chunk.text;
          }
        }
        const done = await Promise.race([
          streamDonePromise.then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 10)),
        ]);
        if (done && index >= chunks.length) break;
      }
    }

    async function* textStream(): AsyncGenerator<string> {
      let index = 0;
      while (true) {
        while (index < chunks.length) {
          const chunk = chunks[index++];
          if (chunk.type === 'text-delta') {
            yield chunk.text;
          }
        }
        const done = await Promise.race([
          streamDonePromise.then(() => true),
          new Promise<false>((resolve) => setTimeout(() => resolve(false), 10)),
        ]);
        if (done && index >= chunks.length) break;
      }
    }

    return {
      reasoningStream: reasoningStream(),
      textStream: textStream(),
      done,
    };
  }
}
