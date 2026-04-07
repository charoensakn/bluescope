import { Stack, Typography } from '@mui/material';

export type MetaItemProps = {
  label: string;
  value: string;
};

export function MetaItem({ label, value }: MetaItemProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body1" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Stack>
  );
}
