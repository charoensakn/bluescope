import { Stack } from '@mui/material';
import { PageContainer, PageHeader } from '../../components';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { LocalizationSetting } from './LocalizationSetting';
import { ProvidersSetting } from './ProvidersSetting';
import { ReasoningSetting } from './ReasoningSetting';
import { ThemeSetting } from './ThemeSetting';

export function SettingPage() {
  const locale = useUIStore((state) => state.uiLocale);

  return (
    <PageContainer>
      <PageHeader title={m.setting_title(undefined, { locale })} subtitle={m.setting_subtitle(undefined, { locale })} />
      <Stack spacing={2}>
        <ThemeSetting />
        <LocalizationSetting />
        <ReasoningSetting />
        <ProvidersSetting />
      </Stack>
    </PageContainer>
  );
}
