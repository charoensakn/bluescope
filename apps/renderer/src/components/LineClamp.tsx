import { Box, type BoxProps } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type LineClampProps = BoxProps & {
  lines?: number;
};

export function LineClamp({ lines = 2, children, sx, ...props }: PropsWithChildren<LineClampProps>) {
  return (
    <Box
      {...props}
      sx={{
        lineClamp: lines,
        display: '-webkit-box',
        overflow: 'hidden',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: lines,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
