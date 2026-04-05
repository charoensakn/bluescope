import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { m } from '../paraglide/messages';

export function CaseNotFound() {
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
      <Typography variant="h4">{m.nocase_title()}</Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
        {m.nocase_subtitle()}
      </Typography>

      <Button variant="contained" size="large" onClick={() => navigate('/cases')}>
        {m.nocase_back()}
      </Button>
    </Stack>
  );
}
