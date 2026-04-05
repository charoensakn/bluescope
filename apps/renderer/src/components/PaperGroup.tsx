import { Paper, Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type PaperGroupProps = {
  title?: string;
  row?: boolean;
};

export function PaperGroup({ title, row, children }: PropsWithChildren<PaperGroupProps>) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        {title && (
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {title}
          </Typography>
        )}
        {!row ? (
          children
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {children}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
