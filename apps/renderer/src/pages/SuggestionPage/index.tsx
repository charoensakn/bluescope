import DeleteIcon from '@mui/icons-material/Delete';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import { Button, IconButton, Stack } from '@mui/material';
import type { CaseSuggestion, CaseType, Skill, SkillID, StreamFn } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  AIButton,
  CaseNotFound,
  Loading,
  MarkdownRender,
  PageContainer,
  PageHeader,
  PaperWithHeader,
  Reasoning,
  type ReasoningMessage,
} from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useStreaming, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getErrorMessage } from '../../utils';
import { ClearDialog } from './ClearDialog';

export function SuggestionPage() {
  const [isClearDialogOpen, setClearDialogOpen] = useState(false);
  const [message, setMessage] = useState<ReasoningMessage>(null);
  const [suggestionLoadingMap, setSuggestionLoadingMap] = useState<Record<string, boolean>>({});
  const [suggestionMessageMap, setSuggestionMessageMap] = useState<Record<string, ReasoningMessage>>({});
  const [suggestionContentMap, setSuggestionContentMap] = useState<Record<string, string>>({});
  const [suggestionShowMap, setSuggestionShowMap] = useState<Record<string, boolean>>({});
  const { uiLocale, promptLocale } = useUIStore((state) => state);
  const focusCaseId = useCaseStore((state) => state.focusCaseId);

  const runIdToCaseType = useRef<Record<string, string>>({});

  const {
    text: systhesisContent,
    reasoningMessage: synthesisMessage,
    generate: synthesize,
    onStreaming: onSynthesize,
    isStreaming: isSynthesizing,
    setText: setSynthesisContent,
    setReasoningMessage: setSynthesisMessage,
  } = useStreaming();

  const isRefreshing = isSynthesizing || Object.values(suggestionLoadingMap).some((v) => v);

  const { data: skills, isLoading: isSkillsLoading } = useSWR<Skill[]>('classification:getSkills', fetcher);
  const { data: types, isLoading: isTypesLoading } = useSWR<CaseType[]>(
    focusCaseId ? `classification:${focusCaseId}` : null,
    fetcher,
  );
  const {
    data: suggestions,
    isLoading: isSuggesionsLoading,
    mutate: mutateSuggestions,
  } = useSWR<CaseSuggestion[]>(focusCaseId ? `suggestions:${focusCaseId}` : null, fetcher);
  const { data: synthesis, mutate: mutateSynthesis } = useSWR<CaseSuggestion>(
    focusCaseId ? `synthesis:${focusCaseId}` : null,
    fetcher,
  );

  const availableTypes = types ? types.filter((t) => !t.deletedAt) : [];

  useEffect(() => {
    if (!synthesis) return;
    setSynthesisContent(synthesis.suggestion);
  }, [synthesis, setSynthesisContent]);

  useEffect(() => {
    if (!suggestions) return;
    setSuggestionContentMap((prev) => {
      const next = { ...prev };
      for (const s of suggestions) {
        next[s.caseType] = s.suggestion;
      }
      return next;
    });
    setSuggestionShowMap((prev) => {
      const next = { ...prev };
      for (const s of suggestions) {
        next[s.caseType] = !s.deletedAt;
      }
      return next;
    });
  }, [suggestions]);

  useEffect(() => {
    const onSuggest: StreamFn = (_event, runId, type, text) => {
      const caseType = runIdToCaseType.current[runId];
      if (!caseType) return;
      if (type === 'reason-begin') setSuggestionMessageMap((prev) => ({ ...prev, [caseType]: { message: '' } }));
      else if (type === 'reason-stream')
        setSuggestionMessageMap((prev) => {
          const current = prev[caseType];
          return {
            ...prev,
            [caseType]: current ? { ...current, message: current.message + (text ?? '') } : null,
          };
        });
      else if (type === 'reason-end')
        setSuggestionMessageMap((prev) => ({ ...prev, [caseType]: { message: text ?? '' } }));
      else if (type === 'text-begin') setSuggestionContentMap((prev) => ({ ...prev, [caseType]: '' }));
      else if (type === 'text-stream')
        setSuggestionContentMap((prev) => ({
          ...prev,
          [caseType]: (prev[caseType] ?? '') + (text ?? ''),
        }));
      else if (type === 'text-end') setSuggestionContentMap((prev) => ({ ...prev, [caseType]: text ?? '' }));
    };

    window.advisor.onSynthesize(onSynthesize);
    window.advisor.onSuggest(onSuggest);
    return () => {
      window.browser.removeAllListeners();
    };
  }, [onSynthesize]);

  const handleSynthesis = async () => {
    if (!focusCaseId) return;
    await synthesize(window.advisor.synthesize, {
      caseId: focusCaseId,
      thai: promptLocale === 'th',
    });
    mutateSynthesis();
  };

  const handleSuggest = async (caseType: string) => {
    if (!focusCaseId) return;
    const runId = crypto.randomUUID();
    runIdToCaseType.current[runId] = caseType;
    setSuggestionLoadingMap((prev) => ({ ...prev, [caseType]: true }));
    setSuggestionMessageMap((prev) => ({ ...prev, [caseType]: null }));
    try {
      await window.advisor.suggest(runId, {
        caseId: focusCaseId,
        skillId: caseType as SkillID,
        thai: promptLocale === 'th',
      });
      // setSuggestionMessageMap((prev) => ({
      //   ...prev,
      //   [caseType]: { severity: 'success', message: m.suggestion_success() },
      // }));
      mutateSuggestions();
    } catch (err) {
      setSuggestionMessageMap((prev) => ({
        ...prev,
        [caseType]: getErrorMessage(err),
      }));
    } finally {
      setSuggestionLoadingMap((prev) => ({ ...prev, [caseType]: false }));
    }
  };

  const handleClose = () => {
    setMessage(null);
    setClearDialogOpen(false);
  };

  const handleClear = async () => {
    if (!focusCaseId) return;
    setMessage(null);
    try {
      await window.advisor.deleteAll(focusCaseId);
      setSynthesisMessage(null);
      setSynthesisContent('');
      setSuggestionMessageMap({});
      setSuggestionContentMap({});
      setMessage({
        severity: 'success',
        message: m.suggestion_clear_success(),
      });
      mutateSuggestions();
      mutateSynthesis();
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      setClearDialogOpen(false);
    }
  };

  const handleRefresh = async () => {
    if (!focusCaseId) return;
    setMessage(null);
    try {
      await window.advisor.deleteAll(focusCaseId);
      for (const { caseType } of availableTypes) {
        await handleSuggest(caseType);
      }
      await handleSynthesis();
      setMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } catch (err) {
      setMessage(getErrorMessage(err));
    } finally {
      mutateSuggestions();
      mutateSynthesis();
    }
  };

  const handleToggleShow = async (caseType: string, showed: boolean) => {
    if (!focusCaseId) return;
    try {
      await window.advisor.toggle(focusCaseId, caseType, !showed);
      setSuggestionShowMap((prev) => ({ ...prev, [caseType]: showed }));
    } catch (err) {
      setSuggestionMessageMap((prev) => ({
        ...prev,
        [caseType]: getErrorMessage(err),
      }));
    }
  };

  if (isSkillsLoading || isTypesLoading || isSuggesionsLoading) return <Loading />;

  if (!focusCaseId) return <CaseNotFound />;

  return (
    <PageContainer>
      <PageHeader title={m.suggestion_title()} subtitle={m.suggestion_subtitle()}>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setClearDialogOpen(true)}>
          {m.clear()}
        </Button>
        <AIButton isLoading={isRefreshing} onClick={handleRefresh}>
          {m.refresh()}
        </AIButton>
      </PageHeader>
      <Reasoning message={message} />
      <PaperWithHeader
        title={m.suggestion_synthesis()}
        subtitle={m.suggestion_synthesis_description()}
        controls={
          <AIButton variant="outlined" isLoading={isSynthesizing} size="small" onClick={handleSynthesis}>
            {m.refresh()}
          </AIButton>
        }
      >
        <Reasoning message={synthesisMessage} />
        <MarkdownRender content={systhesisContent} collapsible />
      </PaperWithHeader>
      {availableTypes.map((t) => {
        const selectedSkill = skills?.find((s) => s.skillId === t.caseType);
        return (
          <PaperWithHeader
            key={t.caseType}
            title={(uiLocale === 'th' ? selectedSkill?.skillNameTh : selectedSkill?.skillNameEn) || t.caseType}
            subtitle={selectedSkill?.description}
            controls={
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={() => handleToggleShow(t.caseType, !suggestionShowMap[t.caseType])}>
                  {suggestionShowMap[t.caseType] ? (
                    <SpeakerNotesIcon fontSize="small" />
                  ) : (
                    <SpeakerNotesOffIcon fontSize="small" />
                  )}
                </IconButton>
                <AIButton
                  variant="outlined"
                  isLoading={suggestionLoadingMap[t.caseType]}
                  size="small"
                  onClick={() => handleSuggest(t.caseType)}
                >
                  {m.refresh()}
                </AIButton>
              </Stack>
            }
            blur={!suggestionShowMap[t.caseType]}
          >
            <Reasoning message={suggestionMessageMap[t.caseType]} />
            <MarkdownRender content={suggestionContentMap[t.caseType]} collapsible />
          </PaperWithHeader>
        );
      })}
      <ClearDialog open={isClearDialogOpen} onCancel={handleClose} onSubmit={handleClear} />
    </PageContainer>
  );
}
