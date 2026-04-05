import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Grid, Stack, TextField } from '@mui/material';
import type { Preset, Provider, StreamFn } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  AIButton,
  CaseNotFound,
  Loading,
  MarkdownEditor,
  MarkdownRender,
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
import { getProviderName } from '../../utils';
import { demo1 } from './demo1';
import { demo2 } from './demo2';
import { demo3 } from './demo3';

export function DevPage() {
  const focusCaseId = useCaseStore((state) => state.focusCaseId);
  const locale = useUIStore((state) => state.promptLocale);
  const { editor, tick } = useMarkdownEditor();

  const [providerId, setProviderId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState<ReasoningMessage>(null);
  const [content, setContent] = useState('');
  const [isSave, setIsSave] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('new');
  const [presetName, setPresetName] = useState<string>('');
  const [presetOptions, setPresetOptions] = useState<Record<string, string>>({});

  const { data: providers, isLoading: isProvidersLoading } = useSWR<Provider[]>('provider:getAll', fetcher);
  const { data: presets, isLoading: isPresetsLoading, mutate } = useSWR<Preset[]>('preset:getAll', fetcher);

  const devRunId = useRef(crypto.randomUUID());

  useEffect(() => {
    const onGenerate: StreamFn = (_event, runId, type, text) => {
      if (runId !== devRunId.current) return;
      if (type === 'reason-begin') setGeneratingMessage({ message: '' });
      else if (type === 'reason-stream')
        setGeneratingMessage((prev) => (prev ? { ...prev, message: prev.message + (text ?? '') } : null));
      else if (type === 'reason-end') setGeneratingMessage({ message: text ?? '' });
      else if (type === 'text-begin') setContent('');
      else if (type === 'text-stream') setContent((prev) => prev + (text ?? ''));
      else if (type === 'text-end') setContent(text ?? '');
    };

    window.dev.onGenerate(onGenerate);
    return () => {
      window.browser.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent('', { contentType: 'markdown' });
    }
  }, [editor]);

  useEffect(() => {
    if (providers && providers.length > 0) {
      setProviderId(providers.find((p) => p.default)?.id || providers[0].id);
    }
  }, [providers]);

  useEffect(() => {
    const options: Record<string, string> = {
      'new': m.dev_preset_new(),
    };
    if (presets) {
      for (const preset of presets) {
        options[preset.id] = preset.name || m.dev_unname();
      }
      setPresetOptions(options);
    }
  }, [presets]);

  const providerOptions = providers
    ? providers.reduce(
        (acc, provider) => {
          acc[provider.id] = `${getProviderName(provider.providerName)} - ${provider.modelName}`;
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const handleSelectPreset = (id: string) => {
    if (selectedPresetId === id || !editor) return;
    if (id === 'new') {
      setSelectedPresetId('new');
      setPresetName('');
      editor.commands.setContent('', { contentType: 'markdown' });
    } else {
      const preset = presets.find((p) => p.id === id);
      if (!preset) return;
      setSelectedPresetId(id);
      setPresetName(preset.name);
      setProviderId(preset.providerId);
      editor.commands.setContent(preset.prompt, { contentType: 'markdown' });
    }
  };

  const handleSavePreset = async () => {
    if (!editor) return;
    const existing = presets.find((p) => p.id === selectedPresetId);
    setIsSave(false);
    if (existing) {
      await window.preset.update(existing.id, {
        name: presetName,
        providerId,
        prompt: editor.getMarkdown().replaceAll('&nbsp;', ' ') || '',
      });
      mutate();
    } else {
      const newPreset = await window.preset.create({
        name: presetName,
        providerId,
        prompt: editor.getMarkdown().replaceAll('&nbsp;', ' ') || '',
      });
      mutate();
      setTimeout(() => {
        setSelectedPresetId(newPreset.id);
      }, 500);
    }

    setIsSave(true);
  };

  const handleDeletePreset = async () => {
    if (!selectedPresetId) return;
    await window.preset.remove(selectedPresetId);
    handleSelectPreset('new');
    mutate();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratingMessage(null);
    try {
      await window.dev.generate(devRunId.current, {
        caseId: focusCaseId,
        providerId,
        thai: locale === 'th',
        system: editor?.getMarkdown(),
      });
    } catch (err) {
      setGeneratingMessage({
        severity: 'error',
        message: (err as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isProvidersLoading || isPresetsLoading) {
    return <Loading />;
  }

  if (!focusCaseId) {
    return <CaseNotFound />;
  }

  return (
    <>
      <PageHeader title={m.dev_title()} subtitle={m.dev_subtitle()}></PageHeader>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <Stack spacing={2}>
            {presetOptions?.new && (
              <PaperWithHeader
                title={m.dev_presets()}
                subtitle={m.dev_presets_description()}
                controls={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDeletePreset}
                    >
                      {m.delete()}
                    </Button>
                    <SaveButton isSave={isSave} size="small" onClick={handleSavePreset} />
                  </Stack>
                }
              >
                <SelectField
                  label={m.dev_preset_select()}
                  value={selectedPresetId}
                  options={presetOptions}
                  onChange={handleSelectPreset}
                />
                <TextField
                  label={m.dev_preset_name()}
                  value={presetName}
                  fullWidth
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </PaperWithHeader>
            )}
            <PaperWithHeader title={m.dev_system_prompt()} subtitle={m.dev_system_prompt_description()}>
              <SelectField
                label={m.setting_providers()}
                value={providerId}
                options={providerOptions}
                onChange={(value) => setProviderId(value)}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    editor?.commands.setContent(demo1, {
                      contentType: 'markdown',
                    })
                  }
                >
                  {m.dev_demo({ no: 1 })}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    editor?.commands.setContent(demo2, {
                      contentType: 'markdown',
                    })
                  }
                >
                  {m.dev_demo({ no: 2 })}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    editor?.commands.setContent(demo3, {
                      contentType: 'markdown',
                    })
                  }
                >
                  {m.dev_demo({ no: 3 })}
                </Button>
              </Stack>
              <MarkdownEditor editor={editor} tick={tick} />
            </PaperWithHeader>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, xl: 6 }}>
          <PaperWithHeader
            title={m.dev_result()}
            subtitle={m.dev_result_description()}
            controls={
              <AIButton isLoading={isGenerating} size="small" onClick={handleGenerate}>
                {m.refresh()}
              </AIButton>
            }
          >
            <Reasoning message={generatingMessage} />
            <MarkdownRender content={content} />
          </PaperWithHeader>
        </Grid>
      </Grid>
    </>
  );
}
