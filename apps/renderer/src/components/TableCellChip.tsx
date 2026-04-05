import { Chip, Stack, TableCell } from '@mui/material';
import { baseMono } from '../theme';

export type TableCellChipProps = {
  labels?: string | string[];
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
};

export function TableCellChip({ color, labels }: TableCellChipProps) {
  const setLabels = Array.from(new Set(Array.isArray(labels) ? labels.filter(Boolean) : [labels].filter(Boolean)));
  return (
    <TableCell>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {setLabels.map((label) => (
          <Chip
            key={label}
            label={label}
            color={color || 'primary'}
            size="small"
            sx={{
              fontFamily: baseMono,
              textTransform: 'uppercase',
              borderRadius: 1,
              fontSize: 10,
            }}
          />
        ))}
      </Stack>
    </TableCell>
  );
}
