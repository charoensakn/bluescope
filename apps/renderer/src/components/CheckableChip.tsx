import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Chip } from '@mui/material';

export type CheckableChipProps = {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function CheckableChip({ label, checked = false, onChange }: CheckableChipProps) {
  return (
    <Chip
      clickable
      icon={checked ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
      label={label}
      variant={checked ? 'filled' : 'outlined'}
      color={checked ? 'primary' : 'default'}
      onClick={() => onChange?.(!checked)}
    />
  );
}
