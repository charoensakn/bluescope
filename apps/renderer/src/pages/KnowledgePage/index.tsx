import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import type {
  Asset,
  CaseLink,
  Location as CaseLocation,
  Damage,
  Event,
  Evidence,
  Organization,
  Person,
} from '@repo/modules';
import { useState } from 'react';
import useSWR from 'swr';
import { AIButton, CaseNotFound, PageHeader } from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useGenerate, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { AssetTable } from './AssetTable';
import { DamageTable } from './DamageTable';
import { EventTable } from './EventTable';
import { EvidenceTable } from './EvidenceTable';
import { LinkTable } from './LinkTable';
import { LocationTable } from './LocationTable';
import { NetworkGraph } from './NetworkGraph';
import { OrganizationTable } from './OrganizationTable';
import { PersonTable } from './PersonTable';

export function KnowledgePage() {
  const [view, setView] = useState<'table' | 'graph'>('table');

  const {
    message: personMessage,
    isGenerating: isPersonGenerating,
    generate: personGenerate,
    setIsGenerating: setIsPersonGenerating,
    setMessage: setPersonMessage,
  } = useGenerate();

  const {
    message: organizationMessage,
    isGenerating: isOrganizationGenerating,
    generate: organizationGenerate,
    setIsGenerating: setIsOrganizationGenerating,
    setMessage: setOrganizationMessage,
  } = useGenerate();
  const {
    message: locationMessage,
    isGenerating: isLocationGenerating,
    generate: locationGenerate,
    setIsGenerating: setIsLocationGenerating,
    setMessage: setLocationMessage,
  } = useGenerate();
  const {
    message: assetMessage,
    isGenerating: isAssetGenerating,
    generate: assetGenerate,
    setIsGenerating: setIsAssetGenerating,
    setMessage: setAssetMessage,
  } = useGenerate();
  const {
    message: damageMessage,
    isGenerating: isDamageGenerating,
    generate: damageGenerate,
    setIsGenerating: setIsDamageGenerating,
    setMessage: setDamageMessage,
  } = useGenerate();
  const {
    message: evidenceMessage,
    isGenerating: isEvidenceGenerating,
    generate: evidenceGenerate,
    setIsGenerating: setIsEvidenceGenerating,
    setMessage: setEvidenceMessage,
  } = useGenerate();
  const {
    message: eventMessage,
    isGenerating: isEventGenerating,
    generate: eventGenerate,
    setIsGenerating: setIsEventGenerating,
    setMessage: setEventMessage,
  } = useGenerate();
  const {
    message: linkMessage,
    isGenerating: isLinkGenerating,
    generate: linkGenerate,
    setIsGenerating: setIsLinkGenerating,
    setMessage: setLinkMessage,
  } = useGenerate();

  const isGenerating =
    isPersonGenerating ||
    isOrganizationGenerating ||
    isLocationGenerating ||
    isAssetGenerating ||
    isDamageGenerating ||
    isEvidenceGenerating ||
    isEventGenerating ||
    isLinkGenerating;

  const promptLocale = useUIStore((state) => state.promptLocale);

  const focusCaseId = useCaseStore((state) => state.focusCaseId);
  const { data: persons, mutate: mutatePersons } = useSWR<Person[]>(
    focusCaseId ? `persons:${focusCaseId}` : null,
    fetcher,
  );
  const { data: organizations, mutate: mutateOrganizations } = useSWR<Organization[]>(
    focusCaseId ? `organizations:${focusCaseId}` : null,
    fetcher,
  );
  const { data: locations, mutate: mutateLocations } = useSWR<CaseLocation[]>(
    focusCaseId ? `locations:${focusCaseId}` : null,
    fetcher,
  );
  const { data: assets, mutate: mutateAssets } = useSWR<Asset[]>(focusCaseId ? `assets:${focusCaseId}` : null, fetcher);
  const { data: damages, mutate: mutateDamages } = useSWR<Damage[]>(
    focusCaseId ? `damages:${focusCaseId}` : null,
    fetcher,
  );
  const { data: evidences, mutate: mutateEvidences } = useSWR<Evidence[]>(
    focusCaseId ? `evidence:${focusCaseId}` : null,
    fetcher,
  );
  const { data: events, mutate: mutateEvents } = useSWR<Event[]>(focusCaseId ? `events:${focusCaseId}` : null, fetcher);
  const { data: links, mutate: mutateLinks } = useSWR<CaseLink[]>(focusCaseId ? `links:${focusCaseId}` : null, fetcher);

  const handleRefreshPersons = async () => {
    if (!focusCaseId) return;
    const results = await personGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'person',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setPersonMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setPersonMessage({
        severity: 'warning',
        message: m.knowledge_no_persons(),
      });
    }
    mutatePersons();
  };

  const handleRefreshOrganizations = async () => {
    if (!focusCaseId) return;
    const results = await organizationGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'organization',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setOrganizationMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setOrganizationMessage({
        severity: 'warning',
        message: m.knowledge_no_organizations(),
      });
    }
    mutateOrganizations();
  };

  const handleRefreshLocations = async () => {
    if (!focusCaseId) return;
    const results = await locationGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'location',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setLocationMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setLocationMessage({
        severity: 'warning',
        message: m.knowledge_no_locations(),
      });
    }
    mutateLocations();
  };

  const handleRefreshAssets = async () => {
    if (!focusCaseId) return;
    const results = await assetGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'asset',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setAssetMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setAssetMessage({
        severity: 'warning',
        message: m.knowledge_no_assets(),
      });
    }
    mutateAssets();
  };

  const handleRefreshDamages = async () => {
    if (!focusCaseId) return;
    const results = await damageGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'damage',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setDamageMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setDamageMessage({
        severity: 'warning',
        message: m.knowledge_no_damages(),
      });
    }
    mutateDamages();
  };

  const handleRefreshEvidences = async () => {
    if (!focusCaseId) return;
    const results = await evidenceGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'evidence',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setEvidenceMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setEvidenceMessage({
        severity: 'warning',
        message: m.knowledge_no_evidence(),
      });
    }
    mutateEvidences();
  };

  const handleRefreshEvents = async () => {
    if (!focusCaseId) return;
    const results = await eventGenerate(window.structure.extract, {
      caseId: focusCaseId,
      extract: 'event',
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setEventMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setEventMessage({
        severity: 'warning',
        message: m.knowledge_no_events(),
      });
    }
    mutateEvents();
  };

  const handleRefreshLinks = async () => {
    if (!focusCaseId) return;
    const results = await linkGenerate(window.structure.analyze, {
      caseId: focusCaseId,
      thai: promptLocale === 'th',
    });
    if (Array.isArray(results) && results.length > 0) {
      setLinkMessage({
        severity: 'success',
        message: m.refresh_success(),
      });
    } else {
      setLinkMessage({
        severity: 'warning',
        message: m.knowledge_no_links(),
      });
    }
    mutateLinks();
  };

  const handleAllRefresh = async () => {
    setIsPersonGenerating(true);
    setIsOrganizationGenerating(true);
    setIsLocationGenerating(true);
    setIsAssetGenerating(true);
    setIsDamageGenerating(true);
    setIsEvidenceGenerating(true);
    setIsEventGenerating(true);
    setIsLinkGenerating(true);

    await handleRefreshPersons();
    await handleRefreshOrganizations();
    await handleRefreshLocations();
    await handleRefreshAssets();
    await handleRefreshDamages();
    await handleRefreshEvidences();
    await handleRefreshEvents();
    await handleRefreshLinks();
  };

  if (!focusCaseId) return <CaseNotFound />;

  return (
    <>
      <PageHeader title={m.knowledge_title()} subtitle={m.knowledge_subtitle()}>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_event, value) => setView((prev) => (!value || prev === value ? prev : value))}
        >
          <ToggleButton value="table">
            <TableRowsIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="graph">
            <AccountTreeIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <AIButton isLoading={isGenerating} onClick={handleAllRefresh}>
          {m.refresh()}
        </AIButton>
      </PageHeader>
      {view === 'table' ? (
        <>
          <PersonTable
            message={personMessage}
            rows={persons}
            isRefreshing={isPersonGenerating}
            onRefresh={handleRefreshPersons}
          />
          <OrganizationTable
            message={organizationMessage}
            rows={organizations}
            isRefreshing={isOrganizationGenerating}
            onRefresh={handleRefreshOrganizations}
          />
          <LocationTable
            message={locationMessage}
            rows={locations}
            isRefreshing={isLocationGenerating}
            onRefresh={handleRefreshLocations}
          />
          <AssetTable
            message={assetMessage}
            rows={assets}
            isRefreshing={isAssetGenerating}
            onRefresh={handleRefreshAssets}
          />
          <DamageTable
            message={damageMessage}
            rows={damages}
            isRefreshing={isDamageGenerating}
            onRefresh={handleRefreshDamages}
          />
          <EvidenceTable
            message={evidenceMessage}
            rows={evidences}
            isRefreshing={isEvidenceGenerating}
            onRefresh={handleRefreshEvidences}
          />
          <EventTable
            message={eventMessage}
            rows={events}
            isRefreshing={isEventGenerating}
            onRefresh={handleRefreshEvents}
          />
          <LinkTable
            message={linkMessage}
            rows={links}
            isRefreshing={isLinkGenerating}
            onRefresh={handleRefreshLinks}
          />
        </>
      ) : (
        <NetworkGraph
          persons={persons}
          organizations={organizations}
          locations={locations}
          assets={assets}
          damages={damages}
          evidences={evidences}
          events={events}
          links={links}
        />
      )}
    </>
  );
}
