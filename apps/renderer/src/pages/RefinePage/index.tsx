import { Grid } from '@mui/material';
import type { CaseWithRelatedData, StreamFn } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { CaseNotFound, Loading, PageHeader, type ReasoningMessage, SaveButton } from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { PaneEditor } from './PaneEditor';

type History = {
  time: number;
  text: string;
};

export function RefinePage() {
  const { focusCaseId } = useCaseStore((state) => state);
  const { data, mutate, isLoading } = useSWR<CaseWithRelatedData>(
    focusCaseId ? `casedata:${focusCaseId}` : null,
    fetcher,
  );
  const { promptLocale } = useUIStore((state) => state);
  const [isSave, setIsSave] = useState(false);
  const firstLoad = useRef(true);

  const descriptionRef = useRef('');
  const descriptionDate = useRef(0);
  const descriptionHistory = useRef<History[]>([]);
  const [defaultDescription, setDefaultDescription] = useState('');
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);
  const [descriptionMessage, setDescriptionMessage] = useState<ReasoningMessage>(null);

  const entityRef = useRef('');
  const entityDate = useRef(0);
  const entityHistory = useRef<History[]>([]);
  const [defaultEntity, setDefaultEntity] = useState('');
  const [entityDisabled, setEntityDisabled] = useState(false);
  const [entityMessage, setEntityMessage] = useState<ReasoningMessage>(null);

  const descriptionRunId = useRef(crypto.randomUUID());
  const entityRunId = useRef(crypto.randomUUID());

  const handleSave = async () => {
    if (!data) return;
    setIsSave(false);
    await window.case.update(data.id, {
      description: descriptionRef.current,
      entity: entityRef.current,
    });
    setIsSave(true);
    mutate();
  };

  const handleRefineDescription = async (refine = true) => {
    if (!data) return;
    setDescriptionMessage(null);
    try {
      setDescriptionDisabled(true);
      descriptionRunId.current = crypto.randomUUID();
      const log = await window.refinement.refineDescription(descriptionRunId.current, {
        caseId: data.id,
        description: descriptionRef.current,
        entity: refine ? entityRef.current : undefined,
        thai: promptLocale === 'th',
      });
      if (log) {
        setDefaultDescription(log.description);
        descriptionRef.current = log.description;
        descriptionDate.current = log.createdAt;
      }
    } finally {
      setDescriptionDisabled(false);
      mutate();
    }
  };

  const handleRefineEntity = async (refine = true) => {
    if (!data) return;
    setEntityMessage(null);
    try {
      setEntityDisabled(true);
      entityRunId.current = crypto.randomUUID();
      const log = await window.refinement.refineEntity(entityRunId.current, {
        caseId: data.id,
        description: refine ? descriptionRef.current : undefined,
        entity: entityRef.current,
        thai: promptLocale === 'th',
      });
      if (log) {
        setDefaultEntity(log.entity);
        entityRef.current = log.entity;
        entityDate.current = log.createdAt;
      }
    } finally {
      setEntityDisabled(false);
      mutate();
    }
  };

  const handlePrevDescription = () => {
    const prev = descriptionHistory.current.filter((h) => h.time < descriptionDate.current).slice(-1)[0];
    if (prev) {
      setDefaultDescription(prev.text);
      descriptionRef.current = prev.text;
      descriptionDate.current = prev.time;
    }
  };

  const handleNextDescription = () => {
    const next = descriptionHistory.current.find((h) => h.time > descriptionDate.current);
    if (next) {
      setDefaultDescription(next.text);
      descriptionRef.current = next.text;
      descriptionDate.current = next.time;
    }
  };

  const handlePrevEntity = () => {
    const prev = entityHistory.current.filter((h) => h.time < entityDate.current).slice(-1)[0];
    if (prev) {
      setDefaultEntity(prev.text);
      entityRef.current = prev.text;
      entityDate.current = prev.time;
    }
  };

  const handleNextEntity = () => {
    const next = entityHistory.current.find((h) => h.time > entityDate.current);
    if (next) {
      setDefaultEntity(next.text);
      entityRef.current = next.text;
      entityDate.current = next.time;
    }
  };

  useEffect(() => {
    if (!data) return;

    descriptionHistory.current = [];
    const descSet = new Set<string>();
    descriptionHistory.current.push({ time: data.updatedAt, text: data.description || '' });
    descSet.add(data.description || '');
    for (const { createdAt: time, description: text } of data.descriptionLogs) {
      if (text && !descSet.has(text)) {
        descriptionHistory.current.push({ time, text });
        descSet.add(text);
      }
    }
    descriptionHistory.current.sort((a, b) => a.time - b.time);

    entityHistory.current = [];
    const entitySet = new Set<string>();
    entityHistory.current.push({ time: data.updatedAt, text: data.entity || '' });
    entitySet.add(data.entity || '');
    for (const { createdAt: time, entity: text } of data.entityLogs) {
      if (text && !entitySet.has(text)) {
        entityHistory.current.push({ time, text });
        entitySet.add(text);
      }
    }
    entityHistory.current.sort((a, b) => a.time - b.time);

    if (firstLoad.current) {
      firstLoad.current = false;

      setDefaultDescription(data.description || '');
      descriptionRef.current = data.description || '';
      descriptionDate.current = data.updatedAt;

      setDefaultEntity(data.entity || '');
      entityRef.current = data.entity || '';
      entityDate.current = data.updatedAt;
    }
  }, [data]);

  useEffect(() => {
    const onRefineDescription: StreamFn = (_event, runId, type, text) => {
      if (runId !== descriptionRunId.current) return;
      if (type === 'reason-begin') setDescriptionMessage({ message: '' });
      else if (type === 'reason-stream')
        setDescriptionMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setDescriptionMessage({ message: text ?? '' });
      else if (type === 'text-begin') setDefaultDescription('');
      else if (type === 'text-stream') setDefaultDescription((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setDefaultDescription(text ?? '');
    };

    const onRefineEntity: StreamFn = (_event, runId, type, text) => {
      if (runId !== entityRunId.current) return;
      if (type === 'reason-begin') setEntityMessage({ message: '' });
      else if (type === 'reason-stream')
        setEntityMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setEntityMessage({ message: text ?? '' });
      else if (type === 'text-begin') setDefaultEntity('');
      else if (type === 'text-stream') setDefaultEntity((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setDefaultEntity(text ?? '');
    };

    window.refinement.onRefineDescription(onRefineDescription);
    window.refinement.onRefineEntity(onRefineEntity);

    return () => {
      window.browser.removeAllListeners();
    };
  }, []);

  if (isLoading) return <Loading />;

  if (!focusCaseId || !data) return <CaseNotFound />;

  return (
    <>
      <PageHeader title={m.refine_title()} subtitle={m.refine_subtitle()}>
        <SaveButton isSave={isSave} onClick={handleSave} />
      </PageHeader>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <PaneEditor
            header={m.case_description()}
            defaultMarkdown={defaultDescription}
            disabled={descriptionDisabled}
            message={descriptionMessage}
            onPrevClick={handlePrevDescription}
            onNextClick={handleNextDescription}
            onUpdateContent={(md) => (descriptionRef.current = md)}
            onRearrangeClick={() => handleRefineDescription(false)}
            onRefineClick={() => handleRefineDescription()}
          />
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <PaneEditor
            header={m.case_entity()}
            defaultMarkdown={defaultEntity}
            disabled={entityDisabled}
            message={entityMessage}
            onPrevClick={handlePrevEntity}
            onNextClick={handleNextEntity}
            onUpdateContent={(md) => (entityRef.current = md)}
            onRearrangeClick={() => handleRefineEntity(false)}
            onRefineClick={() => handleRefineEntity()}
          />
        </Grid>
      </Grid>
    </>
  );
}
