import ApiIcon from '@mui/icons-material/Api';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';

export type ModuleProps = {
  name?: string;
  version?: string;
};

export function Module({ name, version }: ModuleProps) {
  const theme = useTheme();

  let backgroundColor = 'background.default';
  let color: 'primary' | 'secondary' | 'disabled' = 'disabled';
  if (isPrimaryModule(name || '')) {
    backgroundColor = theme.palette.mode === 'light' ? 'rgb(223, 240, 255)' : 'rgb(21, 48, 92)';
    color = 'primary';
  } else if (isSecondaryModule(name || '')) {
    backgroundColor = theme.palette.mode === 'light' ? 'rgb(248, 221, 248)' : 'rgb(63, 1, 63)';
    color = 'secondary';
  }

  return (
    <Paper elevation={2} sx={{ px: 2, py: 1 }}>
      <Stack direction="row" sx={{ py: 1 }} alignItems="center">
        <Stack flex={{ xs: 0.5, md: 0.3 }} direction="row" spacing={2} alignItems="center">
          <Box
            display="flex"
            sx={{
              backgroundColor,
              p: 0.75,
              borderRadius: 2,
            }}
            alignItems="center"
            justifyContent="center"
          >
            <ApiIcon fontSize="small" color={color} />
          </Box>
          <Typography
            variant="caption"
            color="textPrimary"
            fontWeight="bold"
            fontSize="0.875rem"
            textTransform="uppercase"
          >
            {name || 'unknown'}
          </Typography>
        </Stack>
        <Typography
          flex={{ xs: 0.5, md: 0.7 }}
          variant="caption"
          color="textSecondary"
          fontWeight="bold"
          fontSize="0.875rem"
        >
          {version || 'unknown'}
        </Typography>
      </Stack>
    </Paper>
  );
}

function isPrimaryModule(moduleName: string) {
  const modules = ['bs_app', 'bs_main', 'bs_renderer', 'bs_modules', 'bs_repos', 'bs_skills', 'bs_agents'];
  return modules.some((prefix) => moduleName.toLocaleLowerCase().startsWith(prefix));
}

function isSecondaryModule(moduleName: string) {
  const modules = ['node', 'chrome', 'electron', 'sqlite'];
  return modules.some((prefix) => moduleName.toLocaleLowerCase().startsWith(prefix));
}
