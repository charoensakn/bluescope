import { Stack } from '@mui/material';
import { PageContainer, PageHeader, PaperWithHeader } from '../../components';
import { m } from '../../paraglide/messages';
import { License } from './License';
import { Module } from './Module';

export function AboutPage() {
  const appVersions = window.appversions();
  const browserVersions = window.versions();
  const versions = { ...browserVersions, ...appVersions };
  const modules = versions ? Object.entries(versions).map(([name, version]) => ({ name, version })) : [];

  modules.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PageContainer>
      <PageHeader title={m.about_title()} subtitle={m.about_subtitle()} />
      <License />
      {modules?.length && (
        <PaperWithHeader title={m.about_modules()}>
          <Stack spacing={1}>
            {modules.map((module) => (
              <Module key={module.name} name={module.name} version={module.version} />
            ))}
          </Stack>
        </PaperWithHeader>
      )}
    </PageContainer>
  );
}
