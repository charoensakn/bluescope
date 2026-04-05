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
import { AIButton, CaseNotFound, PageHeader, type ReasoningMessage } from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useUIStore } from '../../hooks';
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
  const [personMessage, setPersonMessage] = useState<ReasoningMessage>(null);
  const [organizationMessage, setOrganizationMessage] = useState<ReasoningMessage>(null);
  const [locationMessage, setLocationMessage] = useState<ReasoningMessage>(null);
  const [assetMessage, setAssetMessage] = useState<ReasoningMessage>(null);
  const [damageMessage, setDamageMessage] = useState<ReasoningMessage>(null);
  const [evidenceMessage, setEvidenceMessage] = useState<ReasoningMessage>(null);
  const [eventMessage, setEventMessage] = useState<ReasoningMessage>(null);
  const [linkMessage, setLinkMessage] = useState<ReasoningMessage>(null);
  const [isPersonRefreshing, setIsPersonRefreshing] = useState(false);
  const [isOrganizationRefreshing, setIsOrganizationRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);
  const [isAssetRefreshing, setIsAssetRefreshing] = useState(false);
  const [isDamageRefreshing, setIsDamageRefreshing] = useState(false);
  const [isEvidenceRefreshing, setIsEvidenceRefreshing] = useState(false);
  const [isEventRefreshing, setIsEventRefreshing] = useState(false);
  const [isLinkRefreshing, setIsLinkRefreshing] = useState(false);

  const isRefreshing =
    isPersonRefreshing ||
    isOrganizationRefreshing ||
    isLocationRefreshing ||
    isAssetRefreshing ||
    isDamageRefreshing ||
    isEvidenceRefreshing ||
    isEventRefreshing ||
    isLinkRefreshing;

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
    setIsPersonRefreshing(true);
    setPersonMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'person',
        thai: promptLocale === 'th',
      });
      setPersonMessage({ severity: 'success', message: m.refresh_success() });
      mutatePersons();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setPersonMessage({ severity: 'error', message });
    } finally {
      setIsPersonRefreshing(false);
    }
  };

  const handleRefreshOrganizations = async () => {
    if (!focusCaseId) return;
    setIsOrganizationRefreshing(true);
    setOrganizationMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'organization',
        thai: promptLocale === 'th',
      });
      setOrganizationMessage({ severity: 'success', message: m.refresh_success() });
      mutateOrganizations();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setOrganizationMessage({ severity: 'error', message });
    } finally {
      setIsOrganizationRefreshing(false);
    }
  };

  const handleRefreshLocations = async () => {
    if (!focusCaseId) return;
    setIsLocationRefreshing(true);
    setLocationMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'location',
        thai: promptLocale === 'th',
      });
      setLocationMessage({ severity: 'success', message: m.refresh_success() });
      mutateLocations();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setLocationMessage({ severity: 'error', message });
    } finally {
      setIsLocationRefreshing(false);
    }
  };

  const handleRefreshAssets = async () => {
    if (!focusCaseId) return;
    setIsAssetRefreshing(true);
    setAssetMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'asset',
        thai: promptLocale === 'th',
      });
      setAssetMessage({ severity: 'success', message: m.refresh_success() });
      mutateAssets();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setAssetMessage({ severity: 'error', message });
    } finally {
      setIsAssetRefreshing(false);
    }
  };

  const handleRefreshDamages = async () => {
    if (!focusCaseId) return;
    setIsDamageRefreshing(true);
    setDamageMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'damage',
        thai: promptLocale === 'th',
      });
      setDamageMessage({ severity: 'success', message: m.refresh_success() });
      mutateDamages();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setDamageMessage({ severity: 'error', message });
    } finally {
      setIsDamageRefreshing(false);
    }
  };

  const handleRefreshEvidences = async () => {
    if (!focusCaseId) return;
    setIsEvidenceRefreshing(true);
    setEvidenceMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'evidence',
        thai: promptLocale === 'th',
      });
      setEvidenceMessage({ severity: 'success', message: m.refresh_success() });
      mutateEvidences();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setEvidenceMessage({ severity: 'error', message });
    } finally {
      setIsEvidenceRefreshing(false);
    }
  };

  const handleRefreshEvents = async () => {
    if (!focusCaseId) return;
    setIsEventRefreshing(true);
    setEventMessage(null);
    try {
      await window.structure.extract({
        caseId: focusCaseId,
        extract: 'event',
        thai: promptLocale === 'th',
      });
      setEventMessage({ severity: 'success', message: m.refresh_success() });
      mutateEvents();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setEventMessage({ severity: 'error', message });
    } finally {
      setIsEventRefreshing(false);
    }
  };

  const handleRefreshLinks = async () => {
    if (!focusCaseId) return;
    setIsLinkRefreshing(true);
    setLinkMessage(null);
    try {
      await window.structure.analyze({
        caseId: focusCaseId,
        thai: promptLocale === 'th',
      });
      setLinkMessage({ severity: 'success', message: m.refresh_success() });
      mutateLinks();
    } catch (err) {
      const message = m.error({ message: (err as Error).message });
      setLinkMessage({ severity: 'error', message });
    } finally {
      setIsLinkRefreshing(false);
    }
  };

  const handleAllRefresh = async () => {
    setIsPersonRefreshing(true);
    setIsOrganizationRefreshing(true);
    setIsLocationRefreshing(true);
    setIsAssetRefreshing(true);
    setIsDamageRefreshing(true);
    setIsEvidenceRefreshing(true);
    setIsEventRefreshing(true);
    setIsLinkRefreshing(true);

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
        <AIButton isLoading={isRefreshing} onClick={handleAllRefresh}>
          {m.refresh()}
        </AIButton>
      </PageHeader>
      {view === 'table' ? (
        <>
          <PersonTable
            message={personMessage}
            rows={persons}
            isRefreshing={isPersonRefreshing}
            onRefresh={handleRefreshPersons}
          />
          <OrganizationTable
            message={organizationMessage}
            rows={organizations}
            isRefreshing={isOrganizationRefreshing}
            onRefresh={handleRefreshOrganizations}
          />
          <LocationTable
            message={locationMessage}
            rows={locations}
            isRefreshing={isLocationRefreshing}
            onRefresh={handleRefreshLocations}
          />
          <AssetTable
            message={assetMessage}
            rows={assets}
            isRefreshing={isAssetRefreshing}
            onRefresh={handleRefreshAssets}
          />
          <DamageTable
            message={damageMessage}
            rows={damages}
            isRefreshing={isDamageRefreshing}
            onRefresh={handleRefreshDamages}
          />
          <EvidenceTable
            message={evidenceMessage}
            rows={evidences}
            isRefreshing={isEvidenceRefreshing}
            onRefresh={handleRefreshEvidences}
          />
          <EventTable
            message={eventMessage}
            rows={events}
            isRefreshing={isEventRefreshing}
            onRefresh={handleRefreshEvents}
          />
          <LinkTable
            message={linkMessage}
            rows={links}
            isRefreshing={isLinkRefreshing}
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
