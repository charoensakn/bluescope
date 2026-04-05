import { IconButton, styled } from '@mui/material';

export const WindowControl = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));
