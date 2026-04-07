import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { MenuButton } from './MenuButton';

export type MenuItemProps = {
  icon: React.ReactNode;
  iconSelected?: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function MenuItem({ icon, iconSelected, label, selected, onClick }: MenuItemProps) {
  return (
    <ListItem>
      <MenuButton
        selected={selected}
        sx={{
          width: { xs: 48, lg: 255 },
          alignItems: { xs: 'center' },
          px: { xs: 0, lg: '12px' },
          py: { xs: 1, lg: '3.5px' },
          justifyContent: { xs: 'center', lg: 'flex-center' },
        }}
        onClick={() => onClick?.()}
      >
        <ListItemIcon
          sx={{
            color: selected ? 'primary.main' : 'text.secondary',
            minWidth: { xs: 'auto', lg: 56 },
          }}
        >
          {(selected && iconSelected) || icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          slotProps={{
            primary: {
              sx: { fontWeight: 'bold' },
            },
          }}
          sx={{
            display: { xs: 'none', lg: 'block' },
            color: selected ? 'primary.main' : 'text.secondary',
          }}
        />
      </MenuButton>
    </ListItem>
  );
}
