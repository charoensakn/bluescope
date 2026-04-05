import { Chip, Divider, Stack, Typography } from '@mui/material';
import type { Case } from '@repo/modules';
import dayjs from 'dayjs';
import enLocale from 'dayjs/locale/en';
import thLocale from 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router';
import { Empty, PaperWithHeader } from '../../components';
import { useCaseStore, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { baseMono } from '../../theme';
import { getPriorityColor, getPriorityLabel, getShortId } from '../../utils';

dayjs.extend(relativeTime);

export type RecentCaseProps = {
  cases: Case[];
};

export function RecentCase({ cases }: RecentCaseProps) {
  const locale = useUIStore((state) => state.uiLocale);
  const setFocusCaseId = useCaseStore((state) => state.setFocusCaseId);
  const navigate = useNavigate();

  const handleClick = (c: Case) => {
    setFocusCaseId(c.id);
    navigate(`/description`);
  };

  return (
    <PaperWithHeader title={m.dashboard_recent_cases()}>
      {cases?.length > 0 ? (
        <Stack divider={<Divider />}>
          {cases.slice(0, 10).map((c) => (
            <Stack
              key={c.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              py={1.5}
              spacing={2}
              onClick={() => handleClick(c)}
              sx={{
                cursor: 'pointer',
              }}
            >
              <Stack spacing={0.25} sx={{ flex: 1, maxWidth: { xs: 200, md: 400 } }}>
                <Typography variant="caption" color="secondary">
                  {c.caseNumber || getShortId(c.id)}
                </Typography>
                <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.title || m.no_title()}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="end" spacing={1} flexBasis={200}>
                {c.priority >= 1 && (
                  <Chip
                    label={getPriorityLabel(c.priority)}
                    color={getPriorityColor(c.priority)}
                    size="small"
                    sx={{
                      fontFamily: baseMono,
                      textTransform: 'uppercase',
                      borderRadius: 1,
                      fontSize: 10,
                    }}
                  />
                )}
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 52, textAlign: 'right' }}>
                  {dayjs(c.updatedAt)
                    .locale(locale === 'th' ? thLocale : enLocale)
                    .fromNow()}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Empty />
      )}
    </PaperWithHeader>
  );
}
