import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Box, Button, type ButtonProps, CircularProgress } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type AIButtonProps = ButtonProps & {
  isLoading?: boolean;
  onClick?: () => void;
};

export function AIButton({ isLoading, children, onClick, ...props }: PropsWithChildren<AIButtonProps>) {
  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={isLoading ? <CircularProgress color="inherit" size={14} sx={{ mr: '6px' }} /> : <AutoAwesomeIcon />}
        disabled={isLoading}
        onClick={() => !isLoading && onClick?.()}
        {...props}
      >
        {children}
      </Button>
    </Box>
  );
}
