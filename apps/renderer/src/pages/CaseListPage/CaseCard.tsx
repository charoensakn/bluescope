import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import type { Case } from '@repo/modules';
import { useNavigate } from 'react-router';
import { CaseStatus, LineClamp } from '../../components';
import { useCaseStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getShortId } from '../../utils';

export type CaseCardProps = {
  data: Case;
};

export function CaseCard({ data }: CaseCardProps) {
  const navigate = useNavigate();
  const { focusCaseId, setFocusCaseId } = useCaseStore((state) => state);
  const selected = focusCaseId === data.id;

  const handleClick = () => {
    setFocusCaseId(data.id);
    navigate('/description');
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: 250,
        width: 473,
        borderColor: selected ? 'primary.main' : undefined,
        borderRadius: 4,
        '&:hover': { boxShadow: 4, borderColor: 'primary.main', transition: '0.2s' },
      }}
    >
      <CardActionArea
        onClick={handleClick}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <CardContent sx={{ width: '100%', p: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: selected ? 'primary.main' : 'text.secondary',
                lineHeight: 1,
              }}
            >
              {data.caseNumber || getShortId(data.id)}
            </Typography>
            <CaseStatus status={data.status} readonly />
          </Stack>

          <LineClamp lines={2}>
            <Typography variant="h3" sx={{ mb: 1.5, color: selected ? 'primary.main' : undefined }}>
              {data.title || m.case_notitle()}
            </Typography>
          </LineClamp>

          <LineClamp lines={3} sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {data.summary || data.description}
            </Typography>
          </LineClamp>

          <Stack flex={1} direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {new Date(data.updatedAt).toLocaleString('th-TH')}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
