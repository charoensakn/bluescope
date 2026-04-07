import { Markdown } from '@tiptap/markdown';
import { type Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

export function useMarkdownEditor(onUpdateContent?: (markdown: string) => void) {
  const [tick, setTick] = useState(0);
  const [editor, setEditor] = useState<Editor | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tiptapEditor = useEditor({
    extensions: [StarterKit, Markdown],
    content: '',
    contentType: 'markdown',
  });

  useEffect(() => {
    if (tick === 0) {
      timer.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 50);
    } else {
      if (tiptapEditor.isInitialized && !editor) {
        if (timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
        tiptapEditor.on('update', ({ editor: e }) => {
          if (typeof onUpdateContent === 'function') {
            try {
              onUpdateContent(e.getMarkdown());
            } catch {
              onUpdateContent(e.getText());
            }
          }
          setTick((t) => t + 1);
        });
        tiptapEditor.on('selectionUpdate', () => setTick((t) => t + 1));
        setEditor(tiptapEditor);
      }
    }
  });

  const getContent = () => {
    if (!editor) return '';
    try {
      return editor.getMarkdown().replaceAll('&nbsp;', ' ').trim();
    } catch {
      return editor.getText().trim();
    }
  };

  return { editor, tick, getContent };
}
