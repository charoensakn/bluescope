import { IconButton, Tooltip } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type ToolbarButtonProps = {
  label?: string;
  active?: boolean;
  onClick?: () => void;
};

export function ToolbarButton({ label, active, onClick, children }: PropsWithChildren<ToolbarButtonProps>) {
  const iconButton = (
    <IconButton
      size="small"
      onClick={() => onClick?.()}
      color={active ? 'primary' : 'default'}
      sx={{ borderRadius: 1 }}
    >
      {children}
    </IconButton>
  );
  return label ? <Tooltip title={label}>{iconButton}</Tooltip> : iconButton;
}
