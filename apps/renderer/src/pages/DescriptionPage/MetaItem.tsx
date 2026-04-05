import { Stack, Typography } from '@mui/material';

export type MetaItemProps = {
  label: string;
  value: string;
};

export function MetaItem({ label, value }: MetaItemProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body1" color="textSecondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="caption" fontWeight="bold">
        {value}
      </Typography>
    </Stack>
  );
}
