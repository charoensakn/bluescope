import { Box, Paper, Stack, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type PaperWithHeaderProps = {
  elevation?: number;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  container?: boolean;
  blur?: boolean;
  controls?: React.ReactNode;
};

export function PaperWithHeader({
  elevation = 1,
  icon,
  title,
  subtitle,
  container,
  controls,
  blur,
  children,
}: PropsWithChildren<PaperWithHeaderProps>) {
  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 4,
        p: 2,
        opacity: blur ? 0.5 : 1,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: container ? { xs: 'calc(100vw - 80px - 5rem)', lg: 'calc(100vw - 287px - 5rem)' } : undefined,
          overflow: container ? 'hidden' : undefined,
        }}
      >
        {(icon || title || controls) && (
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            {icon && (
              <Box alignSelf="flex-start" height="100%" display="flex" alignItems="center">
                {icon}
              </Box>
            )}
            {title && (
              <Stack flex={0.6} spacing={1}>
                {title && (
                  <Typography variant="h4" color="primary">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="subtitle1" color="secondary">
                    {subtitle}
                  </Typography>
                )}
              </Stack>
            )}
            {controls && (
              <Stack flex={0.4} direction="row" justifyContent="end" spacing={1}>
                {controls}
              </Stack>
            )}
          </Stack>
        )}
        {children}
      </Stack>
    </Paper>
  );
}
