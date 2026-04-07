import { Paper, type PaperProps, styled } from '@mui/material';

type EditorWrapperProps = PaperProps & {
  minHeight?: number | string;
  maxHeight?: number | string;
  readonly?: boolean;
};

export function EditorWrapper({ minHeight = 220, maxHeight, readonly, children, ...props }: EditorWrapperProps) {
  // ---------------------------------------------------------------------------
  // Styled wrapper — gives the ProseMirror div a consistent MUI look
  // ---------------------------------------------------------------------------
  const Wrapper = styled(Paper)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: readonly ? 'transparent' : undefined,
    minHeight,
    maxHeight,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',

    '& .ProseMirror': {
      flex: 1,
      padding: readonly ? 0 : theme.spacing(1.5),
      minHeight,
      maxHeight,
      overflowY: 'auto',
      outline: 'none',
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      color: theme.palette.text.primary,

      '& p': { margin: '0 0 0.5em' },
      '& h1': { ...theme.typography.h1, margin: '0.5em 0' },
      '& h2': { ...theme.typography.h2, margin: '0.5em 0' },
      '& h3': { ...theme.typography.h3, margin: '0.5em 0' },
      '& h4': { ...theme.typography.h4, margin: '0.5em 0' },
      '& h5': { ...theme.typography.h5, margin: '0.5em 0' },
      '& h6': { ...theme.typography.h6, margin: '0.5em 0' },
      '& ul, & ol': { paddingLeft: '1.5em', margin: '0.5em 0' },
      '& blockquote': {
        borderLeft: `4px solid ${theme.palette.divider}`,
        margin: '0.5em 0',
        paddingLeft: theme.spacing(1.5),
        color: theme.palette.text.secondary,
      },
      '& strong': { fontWeight: 'bold' },
      '& em': { fontStyle: 'italic' },
      '& code': {
        background: theme.palette.action.hover,
        borderRadius: 4,
        padding: '0 4px',
        fontFamily: theme.typography.caption.fontFamily,
      },
      '& hr': {
        marginTop: '1.5em',
        marginBottom: '1.5em',
        color: theme.palette.divider,
        opacity: 0.6,
      },

      // Placeholder support
      '&.is-editor-empty:first-of-type::before': {
        content: 'attr(data-placeholder)',
        color: theme.palette.text.disabled,
        pointerEvents: 'none',
        float: 'left',
        height: 0,
      },
    },
  }));

  return (
    <Wrapper elevation={0} {...props}>
      {children}
    </Wrapper>
  );
}
