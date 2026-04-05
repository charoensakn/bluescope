import TranslateIcon from '@mui/icons-material/Translate';
import { PaperWithHeader, SelectField } from '../../components';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';

export function LocalizationSetting() {
  const { uiLocale, setUILocale, promptLocale, setPromptLocale } = useUIStore((state) => state);

  return (
    <PaperWithHeader
      icon={<TranslateIcon color="primary" />}
      title={m.setting_localization(undefined, { locale: uiLocale })}
    >
      <SelectField
        label={m.setting_ui_language(undefined, { locale: uiLocale })}
        value={uiLocale}
        options={{ th: 'ภาษาไทย', en: 'English' }}
        onChange={(locale) => setUILocale(locale as 'en' | 'th')}
      />
      <SelectField
        label={m.setting_prompt_language(undefined, { locale: uiLocale })}
        value={promptLocale}
        options={{ th: 'ภาษาไทย', en: 'English' }}
        onChange={(locale) => setPromptLocale(locale as 'en' | 'th')}
      />
    </PaperWithHeader>
  );
}
