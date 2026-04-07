import { Grid } from '@mui/material';
import type { CaseDescriptionLog, CaseEntityLog, CaseWithRelatedData } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { CaseNotFound, Loading, PageHeader, Reasoning, type ReasoningMessage, SaveButton } from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useStreaming, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getErrorMessage } from '../../utils';
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
  const [message, setMessage] = useState<ReasoningMessage>(null);

  const descriptionRef = useRef('');
  const descriptionDate = useRef(0);
  const descriptionHistory = useRef<History[]>([]);

  const entityRef = useRef('');
  const entityDate = useRef(0);
  const entityHistory = useRef<History[]>([]);

  const {
    text: descriptionDefault,
    reasoningMessage: descriptionMessage,
    isStreaming: isDescriptionRefining,
    onStreaming: onDescriptionRefining,
    setText: setDecriptionDefault,
    generate: refineDescription,
  } = useStreaming();
  const {
    text: entityDefault,
    reasoningMessage: entityMessage,
    isStreaming: isEntityRefining,
    onStreaming: onEntityRefining,
    setText: setEntityDefault,
    generate: refineEntity,
  } = useStreaming();

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

      setDecriptionDefault(data.description || '');
      descriptionRef.current = data.description || '';
      descriptionDate.current = data.updatedAt;

      setEntityDefault(data.entity || '');
      entityRef.current = data.entity || '';
      entityDate.current = data.updatedAt;
    }
  }, [data, setDecriptionDefault, setEntityDefault]);

  useEffect(() => {
    window.refinement.onRefineDescription(onDescriptionRefining);
    window.refinement.onRefineEntity(onEntityRefining);
    return () => {
      window.browser.removeAllListeners();
    };
  }, [onDescriptionRefining, onEntityRefining]);

  const handleSave = async () => {
    if (!data) return;
    setIsSave(false);
    try {
      await window.case.update(data.id, {
        description: descriptionRef.current,
        entity: entityRef.current,
      });
      setMessage({ severity: 'success', message: m.save_success() });
      setIsSave(true);
      mutate();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const handleRefineDescription = async (refine = true) => {
    if (!data) return;
    const log = (await refineDescription(window.refinement.refineDescription, {
      caseId: data.id,
      description: descriptionRef.current,
      entity: refine ? entityRef.current : undefined,
      thai: promptLocale === 'th',
    })) as CaseDescriptionLog;
    if (log) {
      setDecriptionDefault(log.description);
      descriptionRef.current = log.description;
      descriptionDate.current = log.createdAt;
    }
    mutate();
  };

  const handleRefineEntity = async (refine = true) => {
    if (!data) return;
    const log = (await refineEntity(window.refinement.refineEntity, {
      caseId: data.id,
      description: refine ? descriptionRef.current : undefined,
      entity: entityRef.current,
      thai: promptLocale === 'th',
    })) as CaseEntityLog;
    if (log) {
      setEntityDefault(log.entity);
      entityRef.current = log.entity;
      entityDate.current = log.createdAt;
    }
    mutate();
  };

  const handlePrevDescription = () => {
    const prev = descriptionHistory.current.filter((h) => h.time < descriptionDate.current).slice(-1)[0];
    if (prev) {
      setDecriptionDefault(prev.text);
      descriptionRef.current = prev.text;
      descriptionDate.current = prev.time;
    }
  };

  const handleNextDescription = () => {
    const next = descriptionHistory.current.find((h) => h.time > descriptionDate.current);
    if (next) {
      setDecriptionDefault(next.text);
      descriptionRef.current = next.text;
      descriptionDate.current = next.time;
    }
  };

  const handlePrevEntity = () => {
    const prev = entityHistory.current.filter((h) => h.time < entityDate.current).slice(-1)[0];
    if (prev) {
      setEntityDefault(prev.text);
      entityRef.current = prev.text;
      entityDate.current = prev.time;
    }
  };

  const handleNextEntity = () => {
    const next = entityHistory.current.find((h) => h.time > entityDate.current);
    if (next) {
      setEntityDefault(next.text);
      entityRef.current = next.text;
      entityDate.current = next.time;
    }
  };

  if (isLoading) return <Loading />;

  if (!focusCaseId || !data) return <CaseNotFound />;

  return (
    <>
      <PageHeader title={m.refine_title()} subtitle={m.refine_subtitle()}>
        <SaveButton isSave={isSave} onClick={handleSave} />
      </PageHeader>
      <Reasoning message={message} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <PaneEditor
            header={m.case_description()}
            defaultMarkdown={descriptionDefault}
            disabled={isDescriptionRefining}
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
            defaultMarkdown={entityDefault}
            disabled={isEntityRefining}
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
