import { useState } from 'react';
import type { ReasoningMessage } from '../components';
import { getErrorMessage } from '../utils';

export type GenerateFn = (fn: (args: unknown) => Promise<unknown>, args: unknown) => Promise<unknown>;

export function useGenerate() {
  const [message, setMessage] = useState<ReasoningMessage>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate: GenerateFn = async (fn, args) => {
    setMessage(null);
    let ret = null;
    try {
      setIsGenerating(true);
      ret = await fn(args);
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
    return ret;
  };

  return {
    message,
    isGenerating,
    generate,
    setMessage,
    setIsGenerating,
  };
}
