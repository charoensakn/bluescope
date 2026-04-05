import { TableCell, Typography, type TypographyProps } from '@mui/material';
import { LineClamp } from './LineClamp';

export type TableCellProps = TypographyProps & {
  width?: number | string;
  lines?: number;
  mono?: boolean;
};

export function TableCellText({ width, lines, mono, children, ...props }: TableCellProps) {
  const text = (
    <Typography variant={mono ? 'caption' : 'body1'} {...props}>
      {children}
    </Typography>
  );

  return (
    <TableCell sx={{ minWidth: width, maxWidth: width }}>
      {lines ? <LineClamp lines={lines}>{text}</LineClamp> : text}
    </TableCell>
  );
}
