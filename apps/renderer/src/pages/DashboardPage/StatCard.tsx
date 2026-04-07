import { Paper, Stack, Typography } from '@mui/material';

const numFmt = new Intl.NumberFormat('th-TH');

export type StatCardProps = {
  label: string;
  value: number;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Paper elevation={1} sx={{ borderRadius: 4, p: 2, flex: 1, minWidth: 0 }}>
      <Stack>
        <Typography variant="h4" color="textDisabled" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
          {numFmt.format(value)}
        </Typography>
      </Stack>
    </Paper>
  );
}
