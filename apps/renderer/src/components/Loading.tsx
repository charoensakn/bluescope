import { Skeleton, Stack } from '@mui/material';

export function Loading() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" width="55%" height={44} />
      <Skeleton variant="rounded" width="100%" height={110} />
      <Skeleton variant="rounded" width="100%" height={220} />
    </Stack>
  );
}
