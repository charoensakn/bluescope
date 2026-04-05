import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Divider, Paper, Stack, Typography } from '@mui/material';
import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { m } from '../../paraglide/messages';
import { ToolbarButton } from './ToolbarButton';

export type ToolbarProps = {
  editor: Editor;
  tick?: number;
};

export function Toolbar({ editor, tick }: ToolbarProps) {
  const [actives, setActives] = useState({
    bold: false,
    italic: false,
    heading1: false,
    heading2: false,
    heading3: false,
    heading4: false,
    heading5: false,
    heading6: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
  });

  useEffect(() => {
    if (!editor && tick > 0) return;

    setActives({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      heading3: editor.isActive('heading', { level: 3 }),
      heading4: editor.isActive('heading', { level: 4 }),
      heading5: editor.isActive('heading', { level: 5 }),
      heading6: editor.isActive('heading', { level: 6 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
    });
  }, [editor, tick]);

  return (
    <Paper variant="outlined" sx={{ borderBottom: 'none' }}>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ px: 1, py: 0.5, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap' }}
      >
        <ToolbarButton label={m.bold()} active={actives.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label={m.italic()}
          active={actives.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {[m.h2(), m.h3(), m.h4(), m.h5()].map((label, index) => {
          const level = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          return (
            <ToolbarButton
              key={level}
              label={label}
              active={actives[`heading${level}`]}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            >
              <Typography variant="caption" fontWeight="bold" sx={{ lineHeight: 1, fontSize: 16, p: 0.2 }}>
                H{level}
              </Typography>
            </ToolbarButton>
          );
        })}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton
          label={m.ul()}
          active={actives.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton
          label={m.ol()}
          active={actives.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton
          label={m.blockquote()}
          active={actives.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuoteIcon fontSize="small" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToolbarButton label={m.undo()} onClick={() => editor.commands.undo()}>
          <UndoIcon fontSize="small" />
        </ToolbarButton>

        <ToolbarButton label={m.redo()} onClick={() => editor.commands.redo()}>
          <RedoIcon fontSize="small" />
        </ToolbarButton>
      </Stack>
    </Paper>
  );
}
