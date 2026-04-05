import { Typography } from '@mui/material';
import { FormDialog } from '../../components';
import { m } from '../../paraglide/messages';

export type DeleteDialogProps = {
  open?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function DeleteDialog({ open, onSubmit, onCancel }: DeleteDialogProps) {
  return (
    <FormDialog
      open={!!open}
      title={m.cases_delete()}
      cancelLabel={m.cancel()}
      submitLabel={m.delete()}
      onCancel={() => onCancel?.()}
      onSubmit={() => onSubmit?.()}
      color="error"
      simple
    >
      <Typography>{m.cases_delete_description()}</Typography>
    </FormDialog>
  );
}
