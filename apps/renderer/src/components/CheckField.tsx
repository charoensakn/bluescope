import CheckIcon from '@mui/icons-material/Check';
import { Paper, Stack, Typography } from '@mui/material';

export type CheckFieldProps = {
  label?: string;
  selected?: boolean;
  onClick?: () => void;
};

export function CheckField({ label, selected, onClick }: CheckFieldProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: 'action.hover',
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { backgroundColor: 'action.selected' },
      }}
      onClick={() => onClick?.()}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {label && (
          <Typography variant="body1" flex={1}>
            {label}
          </Typography>
        )}
        {selected && <CheckIcon />}
      </Stack>
    </Paper>
  );
}
