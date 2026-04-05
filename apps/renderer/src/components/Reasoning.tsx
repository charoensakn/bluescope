import { Alert, type AlertProps } from '@mui/material';
import { useUIStore } from '../hooks';

export type ReasoningMessage = {
  severity?: 'error' | 'success' | 'info' | 'warning';
  message: string;
} | null;

export type ReasoningProps = AlertProps & {
  message?: ReasoningMessage;
};

export function Reasoning({ message, ...props }: ReasoningProps) {
  const isShowReasoning = useUIStore((state) => state.isShowReasoning);
  const isVisible = isShowReasoning || (message?.severity && message.severity !== 'info');

  return (
    isVisible &&
    message && (
      <Alert severity={message.severity || 'info'} {...props}>
        {message.message}
      </Alert>
    )
  );
}
