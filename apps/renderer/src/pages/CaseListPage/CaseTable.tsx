import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { Case } from '@repo/modules';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CaseStatus, TableCellChip, TableCellHead, TableCellText, TableContainer } from '../../components';
import { useCaseStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getPriorityColor, getPriorityLabel, getShortId } from '../../utils';

const numFmt = new Intl.NumberFormat('th-TH');

export type CaseTableProps = {
  cases?: Case[];
};

export function CaseTable({ cases }: CaseTableProps) {
  const [sorts, setSorts] = useState<{
    title: 'asc' | 'desc' | null;
    priority: 'asc' | 'desc' | null;
  }>({
    title: null,
    priority: null,
  });

  const { focusCaseId, setFocusCaseId } = useCaseStore((state) => state);
  const navigate = useNavigate();

  const handleClick = (id: string) => {
    setFocusCaseId(id);
    navigate('/description');
  };

  const rows = [...(cases || [])];

  if (sorts.title) {
    rows.sort((a, b) => {
      const cmp = (a.title || '').localeCompare(b.title || '');
      return sorts.title === 'desc' ? cmp : -cmp;
    });
  }
  if (sorts.priority) {
    rows.sort((a, b) => {
      const cmp = (a.priority || 0) - (b.priority || 0);
      return sorts.priority === 'desc' ? cmp : -cmp;
    });
  }

  return (
    <TableContainer
      title={rows?.length ? m.cases_count({ count: numFmt.format(rows?.length) }) : m.cases_count_zero()}
      subtitle={m.cases_table_description()}
      rows={rows}
    >
      <TableHead>
        <TableRow>
          <TableCellHead width={150}>{m.case_id()}</TableCellHead>
          <TableCellHead width={150} sortable onSort={(direction) => setSorts({ ...sorts, priority: direction })}>
            {m.case_priority()}
          </TableCellHead>
          <TableCellHead width={400} sortable onSort={(direction) => setSorts({ ...sorts, title: direction })}>
            {m.case_title()}
          </TableCellHead>
          <TableCellHead width={400} fullWidth>
            {m.case_summary()}
          </TableCellHead>
          <TableCellHead width={200}>{m.case_status()}</TableCellHead>
          <TableCellHead width={200}>{m.updated_at()}</TableCellHead>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleClick(row.id)}>
            <TableCellText
              color={focusCaseId === row.id ? 'primary.main' : 'text.primary'}
              fontWeight="bold"
              sx={{ textDecoration: row.deletedAt ? 'line-through' : 'none' }}
            >
              {row.caseNumber || getShortId(row.id)}
            </TableCellText>
            {row.priority ? (
              <TableCellChip color={getPriorityColor(row.priority)} labels={getPriorityLabel(row.priority)} />
            ) : (
              <TableCell />
            )}
            <TableCellText
              color={focusCaseId === row.id ? 'primary.main' : 'text.primary'}
              fontWeight="bold"
              sx={{ textDecoration: row.deletedAt ? 'line-through' : 'none' }}
            >
              {row.title}
            </TableCellText>
            <TableCellText
              lines={3}
              color={focusCaseId === row.id ? 'primary.main' : 'text.primary'}
              sx={{ textDecoration: row.deletedAt ? 'line-through' : 'none' }}
            >
              {row.summary || row.description}
            </TableCellText>
            <TableCell>{row.status ? <CaseStatus status={row.status} readonly /> : ''}</TableCell>
            <TableCellText
              color={focusCaseId === row.id ? 'primary.main' : 'text.primary'}
              mono
              fontWeight="bold"
              sx={{ textDecoration: row.deletedAt ? 'line-through' : 'none' }}
            >
              {row.updatedAt ? new Date(row.updatedAt).toLocaleString('th-TH') : ''}
            </TableCellText>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}
