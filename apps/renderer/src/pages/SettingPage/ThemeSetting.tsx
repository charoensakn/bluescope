import PaletteIcon from '@mui/icons-material/Palette';
import { Stack } from '@mui/material';
import { PaperWithHeader } from '../../components';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { ThemeField } from './ThemeField';

export function ThemeSetting() {
  const { mode, setMode, uiLocale: locale } = useUIStore((state) => state);

  return (
    <PaperWithHeader icon={<PaletteIcon color="primary" />} title={m.setting_theme(undefined, { locale })}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 4 }} alignItems="start">
        <ThemeField
          label={m.setting_light(undefined, { locale })}
          mode="light"
          selected={mode === 'light'}
          onClick={() => setMode('light')}
        />
        <ThemeField
          label={m.setting_dark(undefined, { locale })}
          mode="dark"
          selected={mode === 'dark'}
          onClick={() => setMode('dark')}
        />
        <ThemeField
          label={m.setting_system(undefined, { locale })}
          mode="system"
          selected={mode === 'system'}
          onClick={() => setMode('system')}
        />
      </Stack>
    </PaperWithHeader>
  );
}
