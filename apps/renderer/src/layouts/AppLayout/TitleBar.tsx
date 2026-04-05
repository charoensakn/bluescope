import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { SearchBox } from './SearchBox';
import { WindowControl } from './WindowControl';

export type TitleBarProps = {
  searchLabel?: string;
  onCloseClick?: () => void;
  onMaximizeClick?: () => void;
  onMinimizeClick?: () => void;
  onSearchClick?: () => void;
  onGitHubClick?: () => void;
  onHelpClick?: () => void;
};

export function TitleBar({
  searchLabel,
  onCloseClick,
  onMaximizeClick,
  onMinimizeClick,
  onSearchClick,
  onGitHubClick,
  onHelpClick,
}: TitleBarProps) {
  return (
    <Stack component="header" direction="row" sx={{ backgroundColor: 'background.default' }}>
      <Stack direction="row" spacing={1} sx={{ height: 51, alignItems: 'center', justifyContent: 'center', pl: 2 }}>
        <SearchBox
          direction="row"
          spacing={2}
          onClick={() => onSearchClick?.()}
          sx={{ textAlign: 'center', pr: { xs: 2, sm: 10 } }}
        >
          <SearchIcon fontSize="small" color="disabled" />
          <Typography variant="body2" color="textSecondary" fontSize="small">
            {searchLabel ?? 'ui.search'}
          </Typography>
        </SearchBox>
        <Box>
          <IconButton size="small" onClick={() => onGitHubClick?.()}>
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box>
          <IconButton size="small" onClick={() => onHelpClick?.()}>
            <HelpIcon fontSize="small" />
          </IconButton>
        </Box>
      </Stack>
      <Box className="titlebar" sx={{ flex: 1, display: 'none' }} />
      <Stack
        direction="row"
        spacing={1}
        sx={{ height: 51, display: 'none', alignItems: 'start', justifyContent: 'center' }}
      >
        <WindowControl size="small" onClick={() => onMinimizeClick?.()}>
          <RemoveIcon fontSize="small" />
        </WindowControl>
        <WindowControl size="small" onClick={() => onMaximizeClick?.()}>
          <FullscreenIcon fontSize="small" />
        </WindowControl>
        <WindowControl
          size="small"
          sx={{
            '&:hover': {
              color: 'common.white',
              backgroundColor: 'error.main',
            },
          }}
          onClick={() => onCloseClick?.()}
        >
          <CloseIcon fontSize="small" />
        </WindowControl>
      </Stack>
    </Stack>
  );
}
