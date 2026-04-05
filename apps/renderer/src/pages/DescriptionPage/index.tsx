import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { Alert, Box, Button, Grid, Paper, Stack, TextField } from '@mui/material';
import type { Case, StreamFn } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  AIButton,
  CaseNotFound,
  CaseStatus,
  Loading,
  MarkdownEditor,
  PageContainer,
  PageHeader,
  PaperWithHeader,
  Reasoning,
  type ReasoningMessage,
  SaveButton,
  SelectField,
} from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useMarkdownEditor, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { DeleteDialog } from './DeleteDialog';
import { MetaItem } from './MetaItem';

export function DescriptionPage() {
  const { focusCaseId, setFocusCaseId } = useCaseStore((state) => state);
  const { data, mutate, isLoading } = useSWR<Case>(focusCaseId ? `case:${focusCaseId}` : null, fetcher);
  const { editor, tick } = useMarkdownEditor();
  const { promptLocale } = useUIStore((state) => state);

  const [status, setStatus] = useState(0);
  const [priority, setPriority] = useState(0);
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [titleStreaming, setTitleStreaming] = useState(false);
  const [titleMessage, setTitleMessage] = useState<ReasoningMessage>(null);
  const [summary, setSummary] = useState('');
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState<ReasoningMessage>(null);
  const [descriptionMessage, setDescriptionMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSave, setIsSave] = useState(false);

  const titleRunId = useRef(crypto.randomUUID());
  const summaryRunId = useRef(crypto.randomUUID());

  const description = () => {
    if (!data || !editor) return '';
    const text = editor.getText().trim();
    let content: string;
    try {
      content = editor.getMarkdown().replaceAll('&nbsp;', ' ');
    } catch {
      content = text;
    }
    return content;
  };

  useEffect(() => {
    if (!data) return;
    setStatus(data.status ?? 0);
    setPriority(data.priority ?? 0);
    setCaseNumber(data.caseNumber ?? '');
    setTitle(data.title ?? '');
    setSummary(data.summary ?? '');

    const onTitle: StreamFn = (_event, runId, type, text) => {
      if (runId !== titleRunId.current) return;

      if (type === 'reason-begin') setTitleMessage({ message: '' });
      else if (type === 'reason-stream')
        setTitleMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setTitleMessage({ message: text ?? '' });
      else if (type === 'text-begin') setTitle('');
      else if (type === 'text-stream') setTitle((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setTitle(text ?? '');
    };

    const onSummary: StreamFn = (_event, runId, type, text) => {
      if (runId !== summaryRunId.current) return;

      if (type === 'reason-begin') setSummaryMessage({ message: '' });
      else if (type === 'reason-stream')
        setSummaryMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setSummaryMessage({ message: text ?? '' });
      else if (type === 'text-begin') setSummary('');
      else if (type === 'text-stream') setSummary((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setSummary(text ?? '');
    };

    window.description.onGenerateTitle(onTitle);
    window.description.onSummarize(onSummary);
    return () => {
      window.browser.removeAllListeners();
    };
  }, [data]);

  useEffect(() => {
    if (data && editor) {
      editor.commands.setContent(data.description ?? '', { contentType: 'markdown' });
    }
  }, [data, editor]);

  const handleGenerateTitle = async () => {
    setTitleMessage(null);
    try {
      setTitleStreaming(true);
      await window.description.generateTitle(titleRunId.current, {
        description: description(),
        thai: promptLocale === 'th',
      });
    } catch (err) {
      setTitleMessage({ severity: 'error', message: (err as Error).message || m.unknown() });
    } finally {
      setTitleStreaming(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!data) return;
    setSummaryMessage(null);
    try {
      setSummaryStreaming(true);
      await window.description.summarize(summaryRunId.current, {
        description: description(),
        thai: promptLocale === 'th',
      });
    } catch (err) {
      setSummaryMessage({ severity: 'error', message: (err as Error).message || m.unknown() });
    } finally {
      setSummaryStreaming(false);
    }
  };

  const handleSave = async () => {
    if (!data || !editor) return;
    setDescriptionMessage('');
    setIsSave(false);
    const text = editor.getText().trim();
    let content: string;
    try {
      content = editor.getMarkdown().replaceAll('&nbsp;', ' ');
    } catch {
      content = text;
    }
    if (!content) {
      setDescriptionMessage(m.description_empty());
      return;
    } else {
      await window.case.update(data.id, {
        status,
        priority,
        caseNumber,
        title,
        summary,
        description: content,
      });
      setIsSave(true);
      mutate();
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    setDeleteDialogOpen(false);
    await window.case.delete(data.id);
    setFocusCaseId(null);
  };

  const handleArchive = async () => {
    if (!data) return;

    if (data.deletedAt) {
      await window.case.unarchive(data.id);
    } else {
      await window.case.archive(data.id);
    }
    mutate();
  };

  if (isLoading) return <Loading />;

  if (!focusCaseId || !data) return <CaseNotFound />;

  return (
    <PageContainer>
      <PageHeader title={m.description_title()} subtitle={m.description_subtitle()}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
          {m.delete()}
        </Button>
        <SaveButton isSave={isSave} onClick={handleSave} />
      </PageHeader>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 4 }}>
        <CaseStatus status={status} onChange={(status) => setStatus(status)} />
      </Paper>

      <PaperWithHeader
        title={m.case_metadata()}
        controls={
          <Button
            variant="outlined"
            startIcon={data.deletedAt ? <UnarchiveIcon /> : <ArchiveIcon />}
            size="small"
            onClick={handleArchive}
          >
            {data.deletedAt ? m.cases_unarchive() : m.cases_archive()}
          </Button>
        }
      >
        {data.deletedAt && <Alert severity="warning">{m.cases_archive_description()}</Alert>}
        <Grid container spacing={2}>
          <Grid size={12}>
            <MetaItem label={m.case_id()} value={data.id} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MetaItem label={m.created_at()} value={new Date(data.createdAt).toLocaleString('th-TH')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MetaItem label={m.updated_at()} value={new Date(data.updatedAt).toLocaleString('th-TH')} />
          </Grid>
        </Grid>
      </PaperWithHeader>

      <PaperWithHeader title={m.case_information()}>
        <Stack direction="row" spacing={2}>
          <TextField
            label={m.case_number()}
            variant="outlined"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Box sx={{ flexBasis: 150 }}>
            <SelectField
              label={m.case_priority()}
              value={`${priority ?? 0}`}
              onChange={(value) => setPriority(Number(value))}
              options={{
                '0': '-',
                '1': m.priority_1(),
                '2': m.priority_2(),
                '3': m.priority_3(),
                '4': m.priority_4(),
                '5': m.priority_5(),
              }}
            />
          </Box>
        </Stack>

        <AIButton isLoading={titleStreaming} variant="outlined" size="small" onClick={handleGenerateTitle}>
          {m.description_generate_title()}
        </AIButton>
        <Reasoning message={titleMessage} />
        <TextField
          label={m.case_title()}
          variant="outlined"
          value={title}
          disabled={titleStreaming}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ width: '100%' }}
        />

        <AIButton isLoading={summaryStreaming} variant="outlined" size="small" onClick={handleGenerateSummary}>
          {m.description_generate_summary()}
        </AIButton>
        <Reasoning message={summaryMessage} />
        <TextField
          label={m.case_summary()}
          variant="outlined"
          value={summary}
          disabled={summaryStreaming}
          onChange={(e) => setSummary(e.target.value)}
          multiline
          minRows={3}
          sx={{ width: '100%' }}
        />
      </PaperWithHeader>

      <PaperWithHeader title={m.case_description()}>
        <Stack spacing={2}>
          {descriptionMessage && <Alert severity="error">{descriptionMessage}</Alert>}
          <MarkdownEditor editor={editor} tick={tick} />
        </Stack>
      </PaperWithHeader>

      <DeleteDialog open={deleteDialogOpen} onSubmit={handleDelete} onCancel={() => setDeleteDialogOpen(false)} />
    </PageContainer>
  );
}
