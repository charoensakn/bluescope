import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { Box, Button, Grid, Paper, Stack, TextField } from '@mui/material';
import type { Case } from '@repo/modules';
import { useEffect, useState } from 'react';
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
import { useCaseStore, useMarkdownEditor, useStreaming, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getErrorMessage, getSavedMessage } from '../../utils';
import { DeleteDialog } from './DeleteDialog';
import { MetaItem } from './MetaItem';

export function DescriptionPage() {
  const { focusCaseId, setFocusCaseId } = useCaseStore((state) => state);
  const { data, mutate, isLoading } = useSWR<Case>(focusCaseId ? `case:${focusCaseId}` : null, fetcher);
  const { editor, tick, getContent } = useMarkdownEditor();
  const { promptLocale } = useUIStore((state) => state);
  const [status, setStatus] = useState(0);
  const [priority, setPriority] = useState(0);
  const [caseNumber, setCaseNumber] = useState('');
  const [message, setMessage] = useState<ReasoningMessage>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSave, setIsSave] = useState(false);

  const {
    text: title,
    reasoningMessage: titleMessage,
    isStreaming: isTitleStreaming,
    onStreaming: onTitle,
    generate: generateTitle,
    setText: setTitle,
  } = useStreaming();
  const {
    text: summary,
    reasoningMessage: summaryMessage,
    isStreaming: isSummaryStreaming,
    onStreaming: onSummary,
    generate: generateSummary,
    setText: setSummary,
  } = useStreaming();

  useEffect(() => {
    if (!data) return;
    setStatus(data.status ?? 0);
    setPriority(data.priority ?? 0);
    setCaseNumber(data.caseNumber ?? '');
    if (data.deletedAt) {
      setMessage({ severity: 'warning', message: m.cases_archive_description() });
    } else {
      setMessage((prev) => (prev && prev.severity === 'warning' ? null : prev));
    }
  }, [data]);

  useEffect(() => {
    window.description.onGenerateTitle(onTitle);
    window.description.onSummarize(onSummary);
    return () => {
      window.browser.removeAllListeners();
    };
  }, [onTitle, onSummary]);

  useEffect(() => {
    if (data && editor) {
      editor.commands.setContent(data.description ?? '', { contentType: 'markdown' });
    }
  }, [data, editor]);

  const handleGenerateTitle = async () =>
    generateTitle(window.description.generateTitle, {
      description: getContent(),
      thai: promptLocale === 'th',
    });

  const handleGenerateSummary = async () =>
    generateSummary(window.description.summarize, {
      description: getContent(),
      thai: promptLocale === 'th',
    });

  const handleSave = async () => {
    if (!data || !editor) return;
    setIsSave(false);
    try {
      const content = getContent();
      if (!content) {
        setMessage({ severity: 'error', message: m.description_empty() });
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
        if (!data.deletedAt) setMessage(getSavedMessage());
        setIsSave(true);
        mutate();
      }
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    setDeleteDialogOpen(false);
    try {
      await window.case.delete(data.id);
      setFocusCaseId(null);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const _handleArchive = async () => {
    if (!data) return;
    try {
      if (data.deletedAt) {
        await window.case.unarchive(data.id);
      } else {
        await window.case.archive(data.id);
      }
      mutate();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
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

      <Reasoning message={message} />

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
            onClick={_handleArchive}
          >
            {data.deletedAt ? m.cases_unarchive() : m.cases_archive()}
          </Button>
        }
      >
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

        <AIButton isLoading={isTitleStreaming} variant="outlined" size="small" onClick={handleGenerateTitle}>
          {m.description_generate_title()}
        </AIButton>
        <Reasoning message={titleMessage} />
        <TextField
          label={m.case_title()}
          variant="outlined"
          value={title}
          disabled={isTitleStreaming}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ width: '100%' }}
        />

        <AIButton isLoading={isSummaryStreaming} variant="outlined" size="small" onClick={handleGenerateSummary}>
          {m.description_generate_summary()}
        </AIButton>
        <Reasoning message={summaryMessage} />
        <TextField
          label={m.case_summary()}
          variant="outlined"
          value={summary}
          disabled={isSummaryStreaming}
          onChange={(e) => setSummary(e.target.value)}
          multiline
          minRows={3}
          sx={{ width: '100%' }}
        />
      </PaperWithHeader>

      <PaperWithHeader title={m.case_description()}>
        <MarkdownEditor editor={editor} tick={tick} />
      </PaperWithHeader>

      <DeleteDialog open={deleteDialogOpen} onSubmit={handleDelete} onCancel={() => setDeleteDialogOpen(false)} />
    </PageContainer>
  );
}
