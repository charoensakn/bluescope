import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Grid, Stack, TextField } from '@mui/material';
import type { Preset, Provider } from '@repo/modules';
import { useEffect, useState } from 'react';
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
import { useCaseStore, useMarkdownEditor, useStreaming, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getErrorMessage, getProviderName } from '../../utils';
import { demo1 } from './demo1';
import { demo2 } from './demo2';
import { demo3 } from './demo3';

export function DevPage() {
  const focusCaseId = useCaseStore((state) => state.focusCaseId);
  const locale = useUIStore((state) => state.promptLocale);
  const { editor, tick, getContent } = useMarkdownEditor();
  const [providerId, setProviderId] = useState<string>('');
  const [isSave, setIsSave] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('new');
  const [presetName, setPresetName] = useState<string>('');
  const [presetOptions, setPresetOptions] = useState<Record<string, string>>({});
  const [presetMessage, setPresetMessage] = useState<ReasoningMessage>(null);
  const [resultMessage, setResultMessage] = useState<ReasoningMessage>(null);

  const { data: providers, isLoading: isProvidersLoading } = useSWR<Provider[]>('provider:getAll', fetcher);
  const { data: presets, isLoading: isPresetsLoading, mutate } = useSWR<Preset[]>('preset:getAll', fetcher);

  const { generate, isStreaming, text, reasoningMessage, onStreaming } = useStreaming();

  useEffect(() => {
    window.dev.onGenerate(onStreaming);
    return () => {
      window.browser.removeAllListeners();
    };
  }, [onStreaming]);

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
    try {
      if (existing) {
        await window.preset.update(existing.id, {
          name: presetName,
          providerId,
          prompt: getContent(),
        });
        setPresetMessage({
          severity: 'success',
          message: m.save_success(),
        });
        setIsSave(true);
        mutate();
      } else {
        const newPreset = await window.preset.create({
          name: presetName,
          providerId,
          prompt: getContent(),
        });
        setPresetMessage({
          severity: 'success',
          message: m.save_success(),
        });
        setIsSave(true);
        mutate();
        setTimeout(() => {
          setSelectedPresetId(newPreset.id);
        }, 500);
      }
    } catch (err) {
      setPresetMessage(getErrorMessage(err));
    }
  };

  const handleDeletePreset = async () => {
    if (!selectedPresetId) return;
    try {
      await window.preset.remove(selectedPresetId);
      handleSelectPreset('new');
      setPresetMessage({
        severity: 'success',
        message: m.delete_success(),
      });
      mutate();
    } catch (err) {
      setPresetMessage(getErrorMessage(err));
    }
  };

  const handleGenerate = async () => {
    if (!focusCaseId) return;
    if (!getContent()) {
      setResultMessage({
        severity: 'error',
        message: m.dev_missing_system_prompt(),
      });
      return;
    }
    setResultMessage(null);
    try {
      const result = await generate(window.dev.generate, {
        caseId: focusCaseId,
        providerId,
        thai: locale === 'th',
        system: getContent(),
      });
      if (result) {
        setResultMessage({
          severity: 'success',
          message: m.dev_generate_success(),
        });
      } else {
        setResultMessage({
          severity: 'warning',
          message: m.dev_generate_no_response(),
        });
      }
    } catch (err) {
      setResultMessage(getErrorMessage(err));
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
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
                <Reasoning message={presetMessage} />
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
              <AIButton isLoading={isStreaming} size="small" onClick={handleGenerate}>
                {m.refresh()}
              </AIButton>
            }
          >
            <Reasoning message={reasoningMessage} />
            <Reasoning message={resultMessage} />
            <MarkdownRender content={text} />
          </PaperWithHeader>
        </Grid>
      </Grid>
    </>
  );
}
