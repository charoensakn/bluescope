import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useId } from 'react';

export type SelectFieldProps = {
  label?: string;
  value?: string;
  options?: Record<string, string>;
  onChange?: (value: string) => void;
};

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId();

  return (
    <FormControl fullWidth>
      {label && <InputLabel id={id}>{label}</InputLabel>}
      <Select labelId={id} label={label} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
        {Object.entries(options ?? {}).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
