import { type PaperProps, Skeleton, Stack } from '@mui/material';
import { type Editor, EditorContent } from '@tiptap/react';
import { EditorWrapper } from './EditorWrapper';
import { Toolbar } from './Toolbar';

export type MarkdownEditorProps = PaperProps & {
  editor: Editor;
  tick?: number;
  disabled?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  readonly?: boolean;
};

export function MarkdownEditor({
  editor,
  tick,
  disabled,
  minHeight,
  maxHeight,
  readonly,
  ...props
}: MarkdownEditorProps) {
  return (
    <Stack>
      {!editor ? (
        <Stack spacing={1} sx={{ opacity: 0.25 }}>
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={maxHeight || minHeight || 220} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : (
        <>
          {!readonly && <Toolbar editor={editor} tick={tick} />}
          <EditorWrapper minHeight={minHeight} maxHeight={maxHeight} readonly={readonly} {...props}>
            <EditorContent editor={editor} disabled={disabled} readOnly={readonly} style={{ flex: 1 }} />
          </EditorWrapper>
        </>
      )}
    </Stack>
  );
}
