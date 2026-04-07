import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { m } from '../paraglide/messages';

export type EmptyProps = {
  isLoading?: boolean;
};

export function Empty({ isLoading }: EmptyProps) {
  return (
    <Paper variant="outlined" sx={{ borderStyle: 'dashed', borderWidth: 2, backgroundColor: 'transparent' }}>
      <Stack spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', py: 5 }}>
        {isLoading ? (
          <Box sx={{ width: '22%', py: 1.55 }}>
            <LinearProgress />
          </Box>
        ) : (
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            {m.nodata_title()}
          </Typography>
        )}
        <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
          {m.nodata_subtitle()}
        </Typography>
      </Stack>
    </Paper>
  );
}
