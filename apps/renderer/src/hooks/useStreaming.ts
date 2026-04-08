import type { StreamFn } from '@repo/modules';
import { useRef, useState } from 'react';
import type { ReasoningMessage } from '../components';
import { getErrorMessage } from '../utils';

export type StreamingFn = (fn: (runId: string, args: unknown) => Promise<unknown>, args: unknown) => Promise<unknown>;

export function useStreaming() {
  const [text, setText] = useState<string>('');
  const [reasoningMessage, setReasoningMessage] = useState<ReasoningMessage>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const runningId = useRef(crypto.randomUUID());

  const onStreaming: StreamFn = (_event, runId, type, text) => {
    if (runningId?.current === runId) {
      if (type === 'reason-begin') setReasoningMessage({ message: '' });
      else if (type === 'reason-stream')
        setReasoningMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setReasoningMessage({ message: text ?? '' });
      else if (type === 'text-begin') setText('');
      else if (type === 'text-stream') setText((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setText(text ?? '');
    }
  };

  const generate: StreamingFn = async (fn, args) => {
    setReasoningMessage(null);
    let ret = null;
    try {
      setIsStreaming(true);
      const result = await fn(runningId.current, args);
      if (typeof result === 'string') {
        setText(result);
        ret = result;
      } else {
        ret = result;
      }
    } catch (err) {
      setReasoningMessage(getErrorMessage(err));
    } finally {
      setIsStreaming(false);
    }
    return ret;
  };

  return {
    runId: runningId.current,
    text,
    reasoningMessage,
    isStreaming,
    onStreaming,
    generate,
    setText,
    setReasoningMessage,
    setIsStreaming,
  };
}
