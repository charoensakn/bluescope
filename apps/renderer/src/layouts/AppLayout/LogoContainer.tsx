import { Box, styled } from '@mui/material';

export const LogoContainer = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  // backgroundColor: theme.palette.mode === 'light' ? 'rgb(0, 72, 141)' : 'rgb(59, 130, 246)',
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
