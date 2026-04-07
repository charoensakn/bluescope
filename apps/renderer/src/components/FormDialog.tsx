import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  type Breakpoint,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { type PropsWithChildren, useEffect, useState } from 'react';

export type FormDialogProps = {
  open?: boolean;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
  checkLabel?: string;
  defaultChecked?: boolean;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  simple?: boolean;
  maxWidth?: Breakpoint;
  onSubmit?: (checked?: boolean) => void;
  onCancel?: () => void;
};

export function FormDialog({
  open,
  title,
  submitLabel,
  cancelLabel,
  checkLabel,
  defaultChecked = false,
  color = 'primary',
  maxWidth = 'sm',
  simple = false,
  children,
  onSubmit,
  onCancel,
}: PropsWithChildren<FormDialogProps>) {
  const [checked, setChecked] = useState(false);
  const isDownMd = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const isSmall = !simple && isDownMd;

  useEffect(() => {
    if (open) {
      setChecked(defaultChecked);
    }
  }, [open, defaultChecked]);

  return (
    <Dialog open={!!open} onClose={() => onCancel?.()} fullWidth fullScreen={isSmall} maxWidth={maxWidth}>
      <DialogTitle
        sx={{
          borderBottom: (theme) => (simple ? undefined : `1px solid ${theme.palette.divider}`),
          backgroundColor: (theme) => (simple ? undefined : theme.palette.background.default),
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'end' }}>
          <Typography variant="body1" sx={{ flex: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
          <IconButton size="small" onClick={() => onCancel?.()}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 2, height: '100%' }}>
          {children}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: (theme) => (simple ? undefined : `1px solid ${theme.palette.divider}`),
          backgroundColor: (theme) => (simple ? undefined : theme.palette.background.default),
        }}
      >
        {checkLabel && (
          <>
            <Button
              startIcon={checked ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankOutlinedIcon />}
              onClick={() => setChecked((prev) => !prev)}
            >
              {checkLabel}
            </Button>
            <Box sx={{ flex: 1 }} />
          </>
        )}
        {cancelLabel && <Button onClick={() => onCancel?.()}>{cancelLabel}</Button>}
        {submitLabel && (
          <Button type="submit" variant="contained" color={color} onClick={() => onSubmit?.(checked)}>
            {submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
