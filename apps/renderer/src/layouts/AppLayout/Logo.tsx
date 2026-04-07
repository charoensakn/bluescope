import { Avatar, Stack, Typography } from '@mui/material';
import logoSrc from '../../assets/icon.png';
import { LogoContainer } from './LogoContainer';

export function Logo() {
  return (
    <Stack direction="row" spacing={2} sx={{ userSelect: 'none', alignItems: 'center', padding: 2 }}>
      <LogoContainer>
        <Avatar src={logoSrc} variant="square" />
      </LogoContainer>
      <Stack sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'start' }}>
        <Typography variant="h1" color="textPrimary" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
          BlueScope
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ letterSpacing: 1.2, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          Case Refinement
        </Typography>
      </Stack>
    </Stack>
  );
}
