import { TextField } from '@mui/material';
import type { Provider } from '@repo/modules';
import { useEffect, useState } from 'react';
import {
  AIButton,
  CheckableChip,
  FormDialog,
  PaperGroup,
  PasswordField,
  Reasoning,
  type ReasoningMessage,
  SelectField,
} from '../../components';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getErrorMessage, PROVIDER_NAME_MAP } from '../../utils';

export type ProviderDialogProps = {
  open?: boolean;
  provider?: Provider;
  onAddProvider?: (provider: Provider) => void;
  onCancel?: () => void;
};

export function ProviderDialog({ open, provider, onAddProvider, onCancel }: ProviderDialogProps) {
  const [formValues, setFormValues] = useState<Provider>(defaultProviderFormValues);
  const [checked, setChecked] = useState(false);
  const promptLocale = useUIStore((state) => state.promptLocale);
  const [connecting, setConnecting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<ReasoningMessage>(null);
  const [reasoningMessage, setReasoningMessage] = useState<ReasoningMessage>(null);
  const [generatingMessage, setGeneratingMessage] = useState<ReasoningMessage>(null);

  const allAgentsChecked =
    formValues.titleAgent &&
    formValues.summaryAgent &&
    formValues.descriptionRefinementAgent &&
    formValues.entityRefinementAgent &&
    formValues.structureExtractionAgent &&
    formValues.linkAnalysisAgent &&
    formValues.classificationAgent &&
    formValues.advisoryAgent;

  useEffect(() => {
    if (open && provider) {
      setFormValues(provider);
      setChecked(provider.default);
    } else if (open) {
      setFormValues(defaultProviderFormValues);
      setChecked(false);
    }
  }, [open, provider]);

  const handleClose = () => {
    setConnectionMessage(null);
    setReasoningMessage(null);
    setGeneratingMessage(null);
    onCancel?.();
  };

  const handleSubmit = (checked?: boolean) => {
    onAddProvider?.({ ...formValues, default: checked ?? formValues.default });
    handleClose();
  };

  const handleTestConnection = async () => {
    setConnecting(true);
    try {
      await window.llm.generateSampleText({
        providerName: formValues.providerName,
        baseUrl: formValues.baseUrl,
        apiKey: formValues.apiKey,
        modelName: formValues.modelName,
      });
      setConnectionMessage({
        severity: 'success',
        message: m.setting_connect_success(),
      });
    } catch (err) {
      const message = (err as Error).message || m.unknown();
      setConnectionMessage({
        severity: 'error',
        message: m.setting_connect_fail({ message }),
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleTestGenerating = async () => {
    setReasoningMessage(null);
    setGenerating(true);
    try {
      const { reasoning, text } = await window.llm.generateText({
        providerName: formValues.providerName,
        baseUrl: formValues.baseUrl,
        apiKey: formValues.apiKey,
        temperature: formValues.temperature,
        maxOutputTokens: formValues.maxOutputTokens,
        modelName: formValues.modelName,
        prompt: promptLocale === 'th' ? 'สวัสดี' : 'Hello',
      });
      if (reasoning) {
        setReasoningMessage({
          severity: 'info',
          message: reasoning,
        });
      } else {
        setReasoningMessage(null);
      }
      setGeneratingMessage({
        severity: 'success',
        message: text,
      });
    } catch (err) {
      setGeneratingMessage(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <FormDialog
      open={!!open}
      title={provider ? m.setting_edit_provider() : m.setting_add_provider()}
      checkLabel={m.setting_make_default()}
      cancelLabel={m.cancel()}
      submitLabel={provider ? m.save() : m.add()}
      maxWidth="md"
      defaultChecked={checked}
      onCancel={handleClose}
      onSubmit={handleSubmit}
    >
      <PaperGroup title={m.setting_connection()}>
        <SelectField
          label={m.setting_provider_name()}
          value={formValues.providerName}
          onChange={(value) =>
            setFormValues((prev) => ({
              ...prev,
              providerName: value,
            }))
          }
          options={PROVIDER_NAME_MAP}
        />
        {formValues.providerName === 'compat' && (
          <TextField
            label="Base URL"
            type="url"
            value={formValues.baseUrl}
            onChange={(e) => setFormValues((prev) => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.example.com/v1"
          />
        )}
        <PasswordField
          label="API KEY"
          value={formValues.apiKey}
          onChange={(value) => setFormValues((prev) => ({ ...prev, apiKey: value }))}
        />
        <TextField
          label={m.setting_model_name()}
          value={formValues.modelName}
          onChange={(e) => setFormValues((prev) => ({ ...prev, modelName: e.target.value }))}
          placeholder="gpt-5.4, gpt-5.4-mini, gpt-5.4-nano"
        />
        <AIButton isLoading={connecting} variant="outlined" size="small" onClick={handleTestConnection}>
          {m.test()}
        </AIButton>
        <Reasoning message={connectionMessage} />
      </PaperGroup>
      <PaperGroup title={m.setting_generation()}>
        <SelectField
          label="Reasoning"
          value={`${formValues.reasoning}`}
          onChange={(value) =>
            setFormValues((prev) => ({
              ...prev,
              reasoning: Number(value),
            }))
          }
          options={{
            '-1': 'default',
            '0': 'none',
            '1': 'low',
            '2': 'medium',
            '3': 'high',
          }}
        />
        <TextField
          fullWidth
          label="Temperature"
          type="number"
          value={formValues.temperature}
          onChange={(e) =>
            setFormValues((prev) => {
              const temperature = Number(e.target.value);
              if (Number.isNaN(temperature)) {
                return prev; // Ignore invalid values
              }
              return { ...prev, temperature };
            })
          }
        />
        <TextField
          fullWidth
          label="Max Output Tokens"
          type="number"
          value={formValues.maxOutputTokens}
          onChange={(e) =>
            setFormValues((prev) => {
              const maxOutputTokens = Number(e.target.value);
              if (Number.isNaN(maxOutputTokens)) {
                return prev; // Ignore invalid values
              }
              return { ...prev, maxOutputTokens };
            })
          }
        />
        <AIButton isLoading={generating} variant="outlined" size="small" onClick={handleTestGenerating}>
          {m.test()}
        </AIButton>
        <Reasoning message={reasoningMessage} />
        <Reasoning message={generatingMessage} />
      </PaperGroup>
      <PaperGroup title={m.setting_agents()} row>
        <CheckableChip
          label={m.all()}
          checked={allAgentsChecked}
          onChange={() => {
            setFormValues((prev) => ({
              ...prev,
              titleAgent: !allAgentsChecked,
              summaryAgent: !allAgentsChecked,
              descriptionRefinementAgent: !allAgentsChecked,
              entityRefinementAgent: !allAgentsChecked,
              structureExtractionAgent: !allAgentsChecked,
              linkAnalysisAgent: !allAgentsChecked,
              classificationAgent: !allAgentsChecked,
              advisoryAgent: !allAgentsChecked,
            }));
          }}
        />
        <CheckableChip
          label={m.agent_title()}
          checked={formValues.titleAgent}
          onChange={() => setFormValues((prev) => ({ ...prev, titleAgent: !prev.titleAgent }))}
        />
        <CheckableChip
          label={m.agent_summary()}
          checked={formValues.summaryAgent}
          onChange={() => setFormValues((prev) => ({ ...prev, summaryAgent: !prev.summaryAgent }))}
        />
        <CheckableChip
          label={m.agent_description_refinement()}
          checked={formValues.descriptionRefinementAgent}
          onChange={() =>
            setFormValues((prev) => ({
              ...prev,
              descriptionRefinementAgent: !prev.descriptionRefinementAgent,
            }))
          }
        />
        <CheckableChip
          label={m.agent_entity_refinement()}
          checked={formValues.entityRefinementAgent}
          onChange={() =>
            setFormValues((prev) => ({
              ...prev,
              entityRefinementAgent: !prev.entityRefinementAgent,
            }))
          }
        />
        <CheckableChip
          label={m.agent_structure_extraction()}
          checked={formValues.structureExtractionAgent}
          onChange={() =>
            setFormValues((prev) => ({
              ...prev,
              structureExtractionAgent: !prev.structureExtractionAgent,
            }))
          }
        />
        <CheckableChip
          label={m.agent_link_analysis()}
          checked={formValues.linkAnalysisAgent}
          onChange={() => setFormValues((prev) => ({ ...prev, linkAnalysisAgent: !prev.linkAnalysisAgent }))}
        />
        <CheckableChip
          label={m.agent_classification()}
          checked={formValues.classificationAgent}
          onChange={() => setFormValues((prev) => ({ ...prev, classificationAgent: !prev.classificationAgent }))}
        />
        <CheckableChip
          label={m.agent_advisory()}
          checked={formValues.advisoryAgent}
          onChange={() => setFormValues((prev) => ({ ...prev, advisoryAgent: !prev.advisoryAgent }))}
        />
      </PaperGroup>
    </FormDialog>
  );
}

const defaultProviderFormValues: Provider = {
  providerName: 'compat',
  baseUrl: '',
  apiKey: '',
  reasoning: -1,
  temperature: -1,
  maxOutputTokens: -1,
  modelName: '',
  titleAgent: true,
  summaryAgent: true,
  descriptionRefinementAgent: true,
  entityRefinementAgent: true,
  structureExtractionAgent: true,
  linkAnalysisAgent: true,
  classificationAgent: true,
  advisoryAgent: true,
  default: false,
};
