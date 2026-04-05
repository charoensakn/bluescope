import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoDevOutlinedIcon from '@mui/icons-material/LogoDevOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { Divider, List } from '@mui/material';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { MenuItem } from './MenuItem';

export type MenuItemKey =
  | 'dashboard'
  | 'cases'
  | 'description'
  | 'refine'
  | 'knowledge'
  | 'classification'
  | 'suggestion'
  | 'dev'
  | 'setting'
  | 'about';

export type MenuProps = {
  selected?: MenuItemKey;
  onMenuItemClick?: (key: MenuItemKey) => void;
};

export function Menu({ selected, onMenuItemClick }: MenuProps) {
  const locale = useUIStore((state) => state.uiLocale);

  return (
    <>
      <List sx={{ flex: 1 }}>
        <MenuItem
          icon={<DashboardOutlinedIcon />}
          iconSelected={<DashboardIcon />}
          label={m.ui_dashboard(undefined, { locale })}
          selected={selected === 'dashboard'}
          onClick={() => onMenuItemClick?.('dashboard')}
        />
        <MenuItem
          icon={<FolderOutlinedIcon />}
          iconSelected={<FolderIcon />}
          label={m.ui_cases(undefined, { locale })}
          selected={selected === 'cases'}
          onClick={() => onMenuItemClick?.('cases')}
        />
        <Divider sx={{ mx: 2 }} />
        <MenuItem
          icon={<DescriptionOutlinedIcon />}
          iconSelected={<DescriptionIcon />}
          label={m.ui_description(undefined, { locale })}
          selected={selected === 'description'}
          onClick={() => onMenuItemClick?.('description')}
        />
        <MenuItem
          icon={<AutoFixHighOutlinedIcon />}
          iconSelected={<AutoFixHighIcon />}
          label={m.ui_refine(undefined, { locale })}
          selected={selected === 'refine'}
          onClick={() => onMenuItemClick?.('refine')}
        />
        <MenuItem
          icon={<AccountTreeOutlinedIcon />}
          iconSelected={<AccountTreeIcon />}
          label={m.ui_knowledge(undefined, { locale })}
          selected={selected === 'knowledge'}
          onClick={() => onMenuItemClick?.('knowledge')}
        />
        <MenuItem
          icon={<CategoryOutlinedIcon />}
          iconSelected={<CategoryIcon />}
          label={m.ui_classification(undefined, { locale })}
          selected={selected === 'classification'}
          onClick={() => onMenuItemClick?.('classification')}
        />
        <MenuItem
          icon={<TipsAndUpdatesOutlinedIcon />}
          iconSelected={<TipsAndUpdatesIcon />}
          label={m.ui_suggestion(undefined, { locale })}
          selected={selected === 'suggestion'}
          onClick={() => onMenuItemClick?.('suggestion')}
        />
        <MenuItem
          icon={<LogoDevOutlinedIcon />}
          label={m.ui_dev(undefined, { locale })}
          selected={selected === 'dev'}
          onClick={() => onMenuItemClick?.('dev')}
        />
      </List>
      <List>
        <MenuItem
          icon={<SettingsOutlinedIcon />}
          iconSelected={<SettingsIcon />}
          label={m.ui_setting(undefined, { locale })}
          selected={selected === 'setting'}
          onClick={() => onMenuItemClick?.('setting')}
        />
        <MenuItem
          icon={<InfoOutlinedIcon />}
          iconSelected={<InfoIcon />}
          label={m.ui_about(undefined, { locale })}
          selected={selected === 'about'}
          onClick={() => onMenuItemClick?.('about')}
        />
      </List>
    </>
  );
}
