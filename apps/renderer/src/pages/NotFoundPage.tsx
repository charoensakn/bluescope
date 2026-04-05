import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { m } from '../paraglide/messages';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{
        height: '100%',
        textAlign: 'center',
        p: 3,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 1 }} />
      <Typography variant="h2" textAlign="center">
        {m.notfound_title()}
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
        {m.notfound_subtitle()}
      </Typography>

      <Button variant="text" size="large" onClick={() => navigate('/')}>
        {m.notfound_back()}
      </Button>
    </Stack>
  );
}
