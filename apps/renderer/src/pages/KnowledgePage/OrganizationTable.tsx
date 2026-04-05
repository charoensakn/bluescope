import LocationCityIcon from '@mui/icons-material/LocationCity';
import { TableBody, TableHead, TableRow } from '@mui/material';
import type { Organization } from '@repo/modules';
import {
  AIButton,
  type ReasoningMessage,
  TableCellChip,
  TableCellHead,
  TableCellText,
  TableContainer,
} from '../../components';
import { m } from '../../paraglide/messages';

export type OrganizationTableProps = {
  rows?: Organization[];
  message?: ReasoningMessage;
  isRefreshing?: boolean;
  onRefresh?: () => void;
};

export function OrganizationTable({ rows, message, isRefreshing, onRefresh }: OrganizationTableProps) {
  return (
    <TableContainer
      rows={rows}
      icon={<LocationCityIcon color="primary" />}
      title={m.organizations()}
      subtitle={m.organizations_description()}
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
              <TableCellText fontWeight="bold">{row.id || '-'}</TableCellText>
              <TableCellText fontWeight="bold">{row.name || '-'}</TableCellText>
              <TableCellChip labels={row.types} />
              <TableCellText>{row.organizationDetails || '-'}</TableCellText>
              <TableCellText fontWeight="bold" mono>
                {(row.confidence || 0).toFixed(2)}
              </TableCellText>
            </TableRow>
          ))}
      </TableBody>
    </TableContainer>
  );
}
