import { Typography } from '@mui/material';
import { FormDialog } from '../../components';
import { m } from '../../paraglide/messages';

export type ClearDialogProps = {
  open?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function ClearDialog({ open, onSubmit, onCancel }: ClearDialogProps) {
  return (
    <FormDialog
      open={!!open}
      title={m.classification_clear()}
      cancelLabel={m.cancel()}
      submitLabel={m.clear()}
      onCancel={() => onCancel?.()}
      onSubmit={() => onSubmit?.()}
      color="error"
      simple
    >
      <Typography>{m.classification_clear_confirm()}</Typography>
    </FormDialog>
  );
}
