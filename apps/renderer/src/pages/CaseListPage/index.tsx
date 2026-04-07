import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Button, Paper, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { Case } from '@repo/modules';
import { useState } from 'react';
import useSWR from 'swr';
import { CaseStatus, Loading, PageHeader, Reasoning, type ReasoningMessage } from '../../components';
import fetcher from '../../fetcher';
import { m } from '../../paraglide/messages';
import { CaseCard } from './CaseCard';
import { CaseTable } from './CaseTable';
import { NewDialog } from './NewDialog';

export function CaseListPage() {
  const [view, setView] = useState('list');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<ReasoningMessage>(null);
  const { data, mutate, isLoading } = useSWR<Case[]>('case:getAll', fetcher);
  const [status, setStatus] = useState(0);

  const handleClose = () => {
    setMessage(null);
    setOpen(false);
  };

  const handleNewCase = async (description: string) => {
    setMessage(null);
    try {
      if (!description) {
        throw new Error(m.cases_add_error({ message: m.cases_no_description() }));
      }
      await window.case.create({ description });
      setMessage({
        severity: 'success',
        message: m.cases_add_success(),
      });
      mutate();
    } catch (err) {
      setMessage({
        severity: 'error',
        message: (err as Error).message || m.unknown(),
      });
    } finally {
      setOpen(false);
    }
  };

  const cases = (data || []).filter((c) => !status || c.status & status);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={m.cases_title()} subtitle={m.cases_subtitle()}>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_event, value) => setView((prev) => (!value || prev === value ? prev : value))}
        >
          <ToggleButton value="list">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="grid">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} size="small" onClick={() => setOpen(true)}>
          {m.cases_add_new()}
        </Button>
      </PageHeader>
      <Reasoning message={message} />
      <Paper elevation={1} sx={{ p: 2, borderRadius: 4 }}>
        <CaseStatus status={status} onChange={(status) => setStatus(status)} />
      </Paper>
      {view === 'list' ? (
        <CaseTable cases={cases} />
      ) : (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {cases.map((c) => (
            <CaseCard key={c.id} data={c} />
          ))}
        </Stack>
      )}
      <NewDialog open={open} onCancel={handleClose} onSubmit={handleNewCase} />
    </>
  );
}
