import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useCaseStore, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getShortId } from '../../utils';
import { Logo } from './Logo';
import { Menu, type MenuItemKey } from './Menu';
import { SearchDialog } from './SearchDialog';
import { SideBarPanel } from './SideBarPanel';
import { TitleBar } from './TitleBar';

export function AppLayout() {
  const mainRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { uiLocale: locale, promptLocale, isShowReasoning } = useUIStore((state) => state);
  const focusCaseId = useCaseStore((state) => state.focusCaseId);
  const [hasDescription, setHasDescription] = useState(false);
  const [hasEntity, setHasEntity] = useState(false);
  const [hasPerson, setHasPerson] = useState(false);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [hasAsset, setHasAsset] = useState(false);
  const [hasDamage, setHasDamage] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);
  const [hasEvent, setHasEvent] = useState(false);
  const [hasLink, setHasLink] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    if (pathname && focusCaseId) {
      window.case
        .get(focusCaseId)
        .then((value) => {
          document.title = `BlueScope - ${value.title || m.no_title()}`;
          window.browser.setTitle(value.title || m.no_title());

          setHasDescription(!!value.description);
          setHasEntity(!!value.entity);

          window.structure.getAllPersons(focusCaseId).then((persons) => setHasPerson(persons.length > 0));
          window.structure
            .getAllOrganizations(focusCaseId)
            .then((organizations) => setHasOrganization(organizations.length > 0));
          window.structure.getAllLocations(focusCaseId).then((locations) => setHasLocation(locations.length > 0));
          window.structure.getAllAssets(focusCaseId).then((assets) => setHasAsset(assets.length > 0));
          window.structure.getAllDamages(focusCaseId).then((damages) => setHasDamage(damages.length > 0));
          window.structure.getAllEvidence(focusCaseId).then((evidences) => setHasEvidence(evidences.length > 0));
          window.structure.getAllEvents(focusCaseId).then((events) => setHasEvent(events.length > 0));
          window.structure.getAllLinks(focusCaseId).then((links) => setHasLink(links.length > 0));
        })
        .catch(() => {
          document.title = 'BlueScope';
          window.browser.setTitle();
        });
    }
  }, [focusCaseId, pathname]);

  const version = window.appversions()?.bs_app;

  return (
    <>
      <Stack direction="row" sx={{ height: '100%' }}>
        <SideBarPanel>
          <Logo />
          <Menu
            selected={pathname === '/' ? 'dashboard' : (pathname.split('/')[1] as MenuItemKey)}
            onMenuItemClick={(key) => navigate(`/${key}/`)}
          />
        </SideBarPanel>
        <Stack sx={{ flex: 1 }}>
          <Stack
            sx={{
              width: { xs: 'calc(100vw - 80px - 1.5rem)', lg: 'calc(100vw - 287px - 1.5rem)' },
              position: 'fixed',
              zIndex: 1000,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'background.default',
                pr: '0.5rem',
              }}
            >
              <TitleBar
                searchLabel={m.ui_search(undefined, { locale })}
                onSearchClick={() => setSearchOpen(true)}
                onGitHubClick={() => window.openExternal('https://github.com/charoensakn/bluescope')}
                onMinimizeClick={() => window.browser.minimize()}
                onMaximizeClick={() => window.browser.maximize()}
                onCloseClick={() => window.browser.close()}
              />
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                {version && (
                  <Typography
                    variant="caption"
                    color={'textDisabled'}
                    sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}
                  >
                    {`v${version}`}
                  </Typography>
                )}
                {focusCaseId && (
                  <Typography variant="caption" color="primary" sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}>
                    {getShortId(focusCaseId)}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color={'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}
                >
                  {promptLocale === 'th' ? 'THA' : 'ENG'}
                </Typography>
                <Typography
                  variant="caption"
                  color={isShowReasoning ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}
                >
                  RSN
                </Typography>
                <Typography
                  variant="caption"
                  color={hasDescription ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}
                >
                  DSC
                </Typography>
                <Typography
                  variant="caption"
                  color={hasEntity ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem' }}
                >
                  ENT
                </Typography>
                <Typography
                  variant="caption"
                  color={
                    hasPerson ||
                    hasOrganization ||
                    hasLocation ||
                    hasAsset ||
                    hasDamage ||
                    hasEvidence ||
                    hasEvent ||
                    hasLink
                      ? 'secondary'
                      : 'textDisabled'
                  }
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { md: 'none' } }}
                >
                  STRUCT
                </Typography>
                <Typography
                  variant="caption"
                  color={hasPerson ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  PER
                </Typography>
                <Typography
                  variant="caption"
                  color={hasOrganization ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  ORG
                </Typography>
                <Typography
                  variant="caption"
                  color={hasLocation ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  LOC
                </Typography>
                <Typography
                  variant="caption"
                  color={hasAsset ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  AST
                </Typography>
                <Typography
                  variant="caption"
                  color={hasDamage ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  DMG
                </Typography>
                <Typography
                  variant="caption"
                  color={hasEvidence ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  EVD
                </Typography>
                <Typography
                  variant="caption"
                  color={hasEvent ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  EVT
                </Typography>
                <Typography
                  variant="caption"
                  color={hasLink ? 'secondary' : 'textDisabled'}
                  sx={{ fontSize: '0.625rem', lineHeight: '0.625rem', display: { xs: 'none', md: 'inline' } }}
                >
                  LNK
                </Typography>
              </Stack>
            </Stack>
            <Box
              sx={{
                width: { xs: 'calc(100vw - 80px - 1.5rem)', lg: 'calc(100vw - 287px - 1.5rem)' },
                height: 10,
                background: (theme) => `linear-gradient(to bottom, ${theme.palette.background.default}, transparent)`,
              }}
            />
          </Stack>
          <Stack
            ref={mainRef}
            component="main"
            spacing={2}
            sx={{
              flex: 1,
              pt: 8,
              px: 2,
              pb: 2,
              width: { xs: 'calc(100vw - 80px)', lg: 'calc(100vw - 287px)' },
              overflowX: 'hidden',
              overflowY: 'scroll',
              scrollbarColor: (theme) => `${theme.palette.action.active} ${theme.palette.background.default}`,
            }}
          >
            <Outlet />
          </Stack>
        </Stack>
      </Stack>
      <SearchDialog open={searchOpen} onCancel={() => setSearchOpen(false)} />
    </>
  );
}
