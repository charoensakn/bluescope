import { Container, Stack } from '@mui/material';

export function PageContainer({ children }: React.PropsWithChildren) {
  return (
    <Container maxWidth="xl" disableGutters>
      <Stack spacing={2}>{children}</Stack>
    </Container>
  );
}
