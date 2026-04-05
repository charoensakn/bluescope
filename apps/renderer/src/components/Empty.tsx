import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { m } from '../paraglide/messages';

export type EmptyProps = {
  isLoading?: boolean;
};

export function Empty({ isLoading }: EmptyProps) {
  return (
    <Paper variant="outlined" sx={{ borderStyle: 'dashed', borderWidth: 2, backgroundColor: 'transparent' }}>
      <Stack spacing={3} alignItems="center" justifyContent="center" py={5}>
        {isLoading ? (
          <Box py={1.55} sx={{ width: '22%' }}>
            <LinearProgress />
          </Box>
        ) : (
          <Typography variant="h2" textAlign="center">
            {m.nodata_title()}
          </Typography>
        )}
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
          {m.nodata_subtitle()}
        </Typography>
      </Stack>
    </Paper>
  );
}
