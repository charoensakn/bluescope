import { styled, Typography } from '@mui/material';

export const Header = styled(Typography)(({ theme }) => ({
  fontFamily: "'Noto Sans Mono Variable', sans-serif",
  fontSize: '0.875rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  color: theme.palette.text.disabled,
}));
