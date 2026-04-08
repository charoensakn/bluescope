import { Output } from 'ai';
import { JsonRepairAgent } from './json_repair';
import { LLM, type OutputStream } from './llm';

export type Suggestion = {
  name: string;
  weight: number;
  text: string;
};

export type RunArgs = {
  description?: string;
  entity?: string;
  thai?: boolean;
  extract?: 'person' | 'organization' | 'location' | 'asset' | 'damage' | 'evidence' | 'event';
  skillsPath?: string;
  skillId?: string;
  suggestions?: Suggestion[];
};

export type Usage = {
  input?: number;
  output?: number;
  total?: number;
};

export abstract class BaseAgent {
  private _llm: LLM;

  constructor(
    public providerName: string,
    public model: string,
    public baseURL?: string,
    public apiKey?: string,
    public reasoning = -1,
    public temperature = -1,
    public maxOutputTokens = -1,
  ) {
    this._llm = new LLM(providerName, model, baseURL, apiKey, reasoning, temperature, maxOutputTokens);
  }

  output(_input: RunArgs): Output.Output {
    return Output.text();
  }

  abstract name(): string;

  abstract systemPrompt(input: RunArgs): string;

  abstract userPrompt(input: RunArgs): string;

  async getReasoningText() {
    if (!this._llm.isRun) {
      throw new Error('LLM has not been run yet');
    }
    await this._llm.done;
    return this._llm.reasoningText;
  }

  async getText() {
    if (!this._llm.isRun) {
      throw new Error('LLM has not been run yet');
    }
    await this._llm.done;
    return this._llm.text;
  }

  async getOutput(): Promise<unknown> {
    if (!this._llm.isRun) {
      throw new Error('LLM has not been run yet');
    }
    await this._llm.done;
    return this._llm.output;
  }

  async getUsage(): Promise<Usage> {
    if (!this._llm.isRun) {
      throw new Error('LLM has not been run yet');
    }
    await this._llm.done;
    return {
      input: this._llm.inputUsage,
      output: this._llm.outputUsage,
      total: this._llm.totalUsage,
    };
  }

  getJsonRepair() {
    return new JsonRepairAgent(
      this.providerName,
      this.model,
      this.baseURL,
      this.apiKey,
      this.reasoning,
      this.temperature,
      this.maxOutputTokens,
    );
  }

  runStream(input: RunArgs): OutputStream {
    return this._llm.streamText({
      system: this.systemPrompt(input),
      prompt: this.userPrompt(input),
      output: this.output(input),
    });
  }

  run(input: RunArgs): Promise<void> {
    return this._llm.generateText({
      system: this.systemPrompt(input),
      prompt: this.userPrompt(input),
      output: this.output(input),
    });
  }

  inputStory(input: RunArgs): string {
    if (input.description) {
      return input.thai ? storyTemplateTh(input.description) : storyTemplateEn(input.description);
    } else {
      return input.thai ? 'อินพุตเรื่อง: ไม่มี\n' : 'Input story: None\n';
    }
  }

  inputEntities(input: RunArgs): string {
    if (input.entity) {
      return input.thai ? entitiesTemplateTh(input.entity) : entitiesTemplateEn(input.entity);
    } else {
      return input.thai ? 'อินพุตเอนทิตี: ไม่มี\n' : 'Input entities: None\n';
    }
  }

  inputBothStoryAndEntities(input: RunArgs): string {
    const ret: string[] = [];
    if (input.description) {
      ret.push(this.inputStory(input));
    }
    if (input.entity) {
      ret.push(this.inputEntities(input));
    }
    return ret.join('\n');
  }

  inputDescription(input: RunArgs): string {
    return input.description || (input.thai ? 'ไม่มีรายละเอียด' : 'No description');
  }
}

const storyTemplateTh = (story: string) => `อินพุตเรื่อง:

--- BEGIN STORY ---
${story}
--- END STORY ---
`;

const storyTemplateEn = (story: string) => `Input story:

--- BEGIN STORY ---
${story}
--- END STORY ---
`;

const entitiesTemplateTh = (entities: string) => `อินพุตเอนทิตี:

--- BEGIN ENTITIES ---
${entities}
--- END ENTITIES ---
`;

const entitiesTemplateEn = (entities: string) => `Input entities:

--- BEGIN ENTITIES ---
${entities}
--- END ENTITIES ---
`;
