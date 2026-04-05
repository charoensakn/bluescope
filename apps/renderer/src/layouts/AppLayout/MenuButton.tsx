import { ListItemButton, styled } from '@mui/material';

export const MenuButton = styled(ListItemButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
}));
