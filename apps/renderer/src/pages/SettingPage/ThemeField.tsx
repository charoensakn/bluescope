import { Box, Paper, Typography } from '@mui/material';
import { MiniUI } from './MiniUI';

export type ThemeFieldProps = {
  mode?: 'system' | 'light' | 'dark';
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function ThemeField({ mode = 'system', label, selected, onClick }: ThemeFieldProps) {
  return (
    <Box
      onClick={() => onClick?.()}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
      }}
    >
      <Paper
        elevation={selected ? 4 : 1}
        sx={{
          width: 120,
          height: 80,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: selected ? 'primary.main' : 'transparent',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          display: 'flex',
          '&:hover': { borderColor: selected ? 'primary.main' : 'action.disabled' },
        }}
      >
        {mode === 'system' ? (
          <>
            <Box sx={{ width: '50%', height: '100%', overflow: 'hidden' }}>
              <MiniUI side="light" />
            </Box>
            <Box sx={{ width: '50%', height: '100%', overflow: 'hidden' }}>
              <MiniUI side="dark" />
            </Box>
          </>
        ) : (
          <MiniUI side={mode} />
        )}
      </Paper>
      <Typography
        variant="body1"
        fontWeight={selected ? 'bold' : 'normal'}
        color={selected ? 'primary' : 'textSecondary'}
      >
        {label}
      </Typography>
    </Box>
  );
}
