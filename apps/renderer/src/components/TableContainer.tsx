import { TableContainer as MuiTableContainer, Table } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { Empty } from './Empty';
import { PaperWithHeader } from './PaperWithHeader';
import { Reasoning, type ReasoningMessage } from './Reasoning';

export type TableContainerProps = {
  rows?: unknown[];
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  message?: ReasoningMessage;
  isLoading?: boolean;
  controls?: React.ReactNode;
};

export function TableContainer({
  rows,
  icon,
  title,
  subtitle,
  message,
  isLoading,
  controls,
  children,
}: PropsWithChildren<TableContainerProps>) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <PaperWithHeader container icon={icon} title={title} subtitle={subtitle} controls={controls}>
      {message && <Reasoning message={message} />}
      {hasRows ? (
        <MuiTableContainer
          sx={{
            height: '100%',
            maxHeight: '100%',
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <Table>{children}</Table>
        </MuiTableContainer>
      ) : (
        <Empty isLoading={isLoading} />
      )}
    </PaperWithHeader>
  );
}
