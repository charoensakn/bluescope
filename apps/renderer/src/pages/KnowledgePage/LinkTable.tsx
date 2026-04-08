import ShareIcon from '@mui/icons-material/Share';
import { TableBody, TableHead, TableRow } from '@mui/material';
import type { CaseLink } from '@repo/modules';
import {
  AIButton,
  type ReasoningMessage,
  TableCellChip,
  TableCellHead,
  TableCellText,
  TableContainer,
} from '../../components';
import { m } from '../../paraglide/messages';

export type LinkTableProps = {
  rows?: CaseLink[];
  reasoningMessage?: ReasoningMessage;
  message?: ReasoningMessage;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export function LinkTable({ rows, reasoningMessage, message, isRefreshing, onRefresh }: LinkTableProps) {
  return (
    <TableContainer
      rows={rows}
      icon={<ShareIcon color="primary" />}
      title={m.links()}
      subtitle={m.links_description()}
      reasoningMessage={reasoningMessage}
      message={message}
      isLoading={isRefreshing}
      controls={
        <AIButton variant="outlined" isLoading={isRefreshing} size="small" onClick={() => onRefresh?.()}>
          {m.refresh()}
        </AIButton>
      }
    >
      <TableHead>
        <TableRow>
          <TableCellHead width={150}>{m.source()}</TableCellHead>
          <TableCellHead width={150}>{m.target()}</TableCellHead>
          <TableCellHead width={300}>{m.relation()}</TableCellHead>
          <TableCellHead width={150} fullWidth>
            {m.confidence()}
          </TableCellHead>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.isArray(rows) &&
          rows.map((row) => (
            <TableRow key={row.createdAt} hover>
              <TableCellChip labels={row.sourceId} />
              <TableCellChip color="secondary" labels={row.targetId} />
              <TableCellText>{row.relation || '-'}</TableCellText>
              <TableCellText mono sx={{ fontWeight: 'bold' }}>
                {(row.confidence || 0).toFixed(2)}
              </TableCellText>
            </TableRow>
          ))}
      </TableBody>
    </TableContainer>
  );
}
