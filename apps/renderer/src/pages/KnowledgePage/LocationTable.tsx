import PlaceIcon from '@mui/icons-material/Place';
import { TableBody, TableHead, TableRow } from '@mui/material';
import type { Location } from '@repo/modules';
import {
  AIButton,
  type ReasoningMessage,
  TableCellChip,
  TableCellHead,
  TableCellText,
  TableContainer,
} from '../../components';
import { m } from '../../paraglide/messages';

export type LocationTableProps = {
  rows?: Location[];
  message?: ReasoningMessage;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export function LocationTable({ rows, message, isRefreshing, onRefresh }: LocationTableProps) {
  return (
    <TableContainer
      rows={rows}
      icon={<PlaceIcon color="primary" />}
      title={m.locations()}
      subtitle={m.locations_description()}
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
          <TableCellHead width={150}>{m.id()}</TableCellHead>
          <TableCellHead width={300}>{m.name()}</TableCellHead>
          <TableCellHead width={300}>{m.type()}</TableCellHead>
          <TableCellHead width={400}>{m.details()}</TableCellHead>
          <TableCellHead width={150} fullWidth>
            {m.confidence()}
          </TableCellHead>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.isArray(rows) &&
          rows.map((row) => (
            <TableRow key={row.createdAt} hover>
              <TableCellText sx={{ fontWeight: 'bold' }}>{row.id || '-'}</TableCellText>
              <TableCellText sx={{ fontWeight: 'bold' }}>{row.name || '-'}</TableCellText>
              <TableCellChip labels={row.types} />
              <TableCellText>{row.locationDetails || '-'}</TableCellText>
              <TableCellText mono sx={{ fontWeight: 'bold' }}>
                {(row.confidence || 0).toFixed(2)}
              </TableCellText>
            </TableRow>
          ))}
      </TableBody>
    </TableContainer>
  );
}
