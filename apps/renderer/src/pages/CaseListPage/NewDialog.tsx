import { Box, Typography, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { FormDialog, MarkdownEditor } from '../../components';
import { useMarkdownEditor } from '../../hooks/useMarkdownEditor';
import { m } from '../../paraglide/messages';

export type NewDialogProps = {
  open?: boolean;
  onSubmit?: (description: string) => void;
  onCancel?: () => void;
};

export function NewDialog({ open, onSubmit, onCancel }: NewDialogProps) {
  const { editor, tick } = useMarkdownEditor();
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const height = isSmall ? 'calc(100vh - 280px)' : 'calc(100vh - 450px)';

  useEffect(() => {
    if (open && editor) {
      editor.commands.setContent('', { contentType: 'markdown' });
    }
  }, [open, editor]);

  const handleSubmit = async () => {
    if (!editor) return;

    let content = editor.getText().trim();
    try {
      content = editor.getMarkdown().replaceAll('&nbsp;', ' ');
    } catch {}
    onSubmit?.(content);
  };

  return (
    <FormDialog
      open={!!open}
      title={m.cases_add_new()}
      cancelLabel={m.cancel()}
      submitLabel={m.add()}
      maxWidth="lg"
      onCancel={() => onCancel?.()}
      onSubmit={handleSubmit}
    >
      <Typography variant="body1">{m.cases_add_description()}</Typography>
      <Box flex={1}>
        {editor && <MarkdownEditor editor={editor} tick={tick} minHeight={height} maxHeight={height} />}
      </Box>
    </FormDialog>
  );
}
