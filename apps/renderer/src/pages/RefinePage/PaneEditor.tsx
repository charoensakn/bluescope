import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconButton, Stack, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { AIButton, MarkdownEditor, PaperWithHeader, Reasoning, type ReasoningMessage } from '../../components';
import { useMarkdownEditor } from '../../hooks';
import { m } from '../../paraglide/messages';

const HEIGHT = 'calc(100vh - 290px)';

type Props = {
  header: string;
  disabled?: boolean;
  defaultMarkdown?: string;
  message?: ReasoningMessage;
  onPrevClick?: () => void;
  onNextClick?: () => void;
  onRearrangeClick?: () => void;
  onRefineClick?: () => void;
  onUpdateContent?: (markdown: string) => void;
};

export function PaneEditor({
  header,
  disabled,
  defaultMarkdown,
  message,
  onPrevClick,
  onNextClick,
  onRearrangeClick,
  onRefineClick,
  onUpdateContent,
}: Props) {
  const { editor, tick } = useMarkdownEditor(onUpdateContent);

  const isXL = useMediaQuery((theme) => theme.breakpoints.up('xl'));

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(defaultMarkdown || '', { contentType: 'markdown' });
  }, [editor, defaultMarkdown]);

  const controls = (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'end', width: 320 }}>
      <IconButton size="small" disabled={disabled} onClick={() => onPrevClick?.()}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" disabled={disabled} onClick={() => onNextClick?.()}>
        <ArrowForwardIcon fontSize="small" />
      </IconButton>
      <AIButton variant="outlined" isLoading={disabled} size="small" onClick={() => onRearrangeClick?.()}>
        {m.rearrange()}
      </AIButton>
      <AIButton isLoading={disabled} size="small" onClick={() => onRefineClick?.()}>
        {m.revise()}
      </AIButton>
    </Stack>
  );

  return (
    <PaperWithHeader title={header} controls={controls}>
      <Reasoning message={message} sx={{ mt: 2 }} />
      <MarkdownEditor
        editor={editor}
        tick={tick}
        disabled={disabled}
        minHeight={isXL ? HEIGHT : undefined}
        maxHeight={HEIGHT}
      />
    </PaperWithHeader>
  );
}
