import { Box, Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type PageHeaderProps = {
  header?: string;
  title?: string;
  subtitle?: string;
};

export function PageHeader({ header, title, subtitle, children }: PropsWithChildren<PageHeaderProps>) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
      <Stack spacing={1} sx={{ flex: 1 }}>
        {header && (
          <Typography
            variant="caption"
            color="secondary"
            sx={{
              textTransform: 'uppercase',
              fontWeight: 'bold',
              fontSize: '0.65rem',
              letterSpacing: 1,
            }}
          >
            {header}
          </Typography>
        )}
        {title && (
          <Typography variant="h1" color="textPrimary">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="subtitle1" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {children && (
        <Box
          sx={{
            flexBasis: { xs: 'auto', md: 300 },
            display: 'flex',
            alignItems: 'flex-end',
            pb: 1,
          }}
        >
          <Stack
            direction={{ xs: 'row-reverse', md: 'row' }}
            spacing={1}
            sx={{ justifyContent: { xs: 'start', md: 'end', flex: 1 } }}
          >
            {children}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
