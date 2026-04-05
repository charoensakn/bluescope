import { Stack, styled } from '@mui/material';

export const SearchBox = styled(Stack)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(10),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  backgroundColor: theme.palette.action.selected,
  borderRadius: theme.shape.borderRadius,
  userSelect: 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.focus,
  },
}));
