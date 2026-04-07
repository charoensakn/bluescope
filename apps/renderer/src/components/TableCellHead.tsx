import { TableCell, TableSortLabel, Typography } from '@mui/material';
import { type PropsWithChildren, useState } from 'react';

export type TableCellHeadProps = {
  width?: number | string;
  sortable?: boolean;
  fullWidth?: boolean;
  onSort?: (direction: 'asc' | 'desc' | null) => void;
};

export function TableCellHead({ width, sortable, fullWidth, children, onSort }: PropsWithChildren<TableCellHeadProps>) {
  const [direction, setDirection] = useState<'asc' | 'desc' | null>(null);
  const header = (
    <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 'bold' }}>
      {children}
    </Typography>
  );

  return (
    <TableCell
      sx={{
        minWidth: width,
        maxWidth: fullWidth ? undefined : width,
        width: fullWidth ? '100%' : undefined,
        backgroundColor: 'action.hover',
      }}
    >
      {sortable ? (
        <TableSortLabel
          active={!!direction}
          direction={direction || undefined}
          onClick={() => {
            const newDirection = direction === null ? 'asc' : direction === 'asc' ? 'desc' : null;
            onSort?.(newDirection);
            setDirection(newDirection);
          }}
        >
          {header}
        </TableSortLabel>
      ) : (
        header
      )}
    </TableCell>
  );
}
