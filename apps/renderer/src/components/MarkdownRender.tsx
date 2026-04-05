import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Button, Stack, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useMarkdownEditor } from '../hooks';
import { m } from '../paraglide/messages';
import { Empty } from './Empty';
import { MarkdownEditor } from './MarkdownEditor';

export type MarkdownRenderProps = {
  content?: string;
  collapsible?: boolean;
  collapsedHeight?: number;
};

export function MarkdownRender({ content, collapsible, collapsedHeight = 200 }: MarkdownRenderProps) {
  const { editor } = useMarkdownEditor();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!editor || !content) return;
    editor.setEditable(false);
    editor.commands.setContent(content, { contentType: 'markdown' });
  }, [editor, content]);

  if (!content) return <Empty />;

  if (!collapsible) return <MarkdownEditor editor={editor} readonly sx={{ border: 0 }} />;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          maxHeight: expanded ? 'none' : collapsedHeight,
          overflow: 'hidden',
        }}
      >
        <MarkdownEditor editor={editor} readonly sx={{ border: 0 }} />
        {!expanded && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: collapsedHeight / 2,
              background: `linear-gradient(to bottom, transparent, ${theme.palette.mode === 'light' ? theme.palette.background.paper : '#1e1e1e'})`,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
      <Stack mt={0.5} justifyContent="center">
        <Button
          color="inherit"
          disableRipple
          disableFocusRipple
          disableElevation
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{ '&:hover': { backgroundColor: 'transparent' } }}
        >
          {expanded ? m.show_less() : m.show_more()}
        </Button>
      </Stack>
    </Box>
  );
}
