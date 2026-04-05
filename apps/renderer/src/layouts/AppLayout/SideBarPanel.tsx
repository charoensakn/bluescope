import { Stack, styled } from '@mui/material';

export const SideBarPanel = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? 'rgb(243, 246, 250)' : 'rgb(2, 6, 22)',
}));
