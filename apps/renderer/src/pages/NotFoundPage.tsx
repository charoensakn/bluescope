import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { m } from '../paraglide/messages';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Stack
      spacing={3}
      sx={{
        height: '100%',
        textAlign: 'center',
        p: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: 'textSecondary', mb: 1 }} />
      <Typography variant="h2" sx={{ textAlign: 'center' }}>
        {m.notfound_title()}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
        {m.notfound_subtitle()}
      </Typography>

      <Button variant="text" size="large" onClick={() => navigate('/')}>
        {m.notfound_back()}
      </Button>
    </Stack>
  );
}
