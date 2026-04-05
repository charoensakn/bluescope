import { Avatar, Stack, Typography } from '@mui/material';
import logoSrc from '../../assets/icon.png';
import { LogoContainer } from './LogoContainer';

export function Logo() {
  return (
    <Stack direction="row" spacing={2} alignItems="center" padding={2} sx={{ userSelect: 'none' }}>
      <LogoContainer>
        <Avatar src={logoSrc} variant="square" />
      </LogoContainer>
      <Stack alignItems="start" display={{ xs: 'none', lg: 'flex' }}>
        <Typography variant="h1" color="textPrimary" fontSize="1rem" fontWeight="bold">
          BlueScope
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          fontSize="0.75rem"
          fontWeight="bold"
          sx={{ letterSpacing: 1.2, textTransform: 'uppercase' }}
        >
          Case Refinement
        </Typography>
      </Stack>
    </Stack>
  );
}
