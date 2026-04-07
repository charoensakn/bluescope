import CircleIcon from '@mui/icons-material/Circle';
import { Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const light = {
  red: '#F44336',
  pink: '#E91E63',
  purple: '#9C27B0',
  deepPurple: '#673AB7',
  indigo: '#3F51B5',
  blue: '#2196F3',
  lightBlue: '#03A9F4',
  cyan: '#00BCD4',
  teal: '#009688',
  green: '#4CAF50',
  lightGreen: '#8BC34A',
  lime: '#CDDC39',
  yellow: '#FFEB3B',
  amber: '#FFC107',
  orange: '#FF9800',
  deepOrange: '#FF5722',
};

const dark = {
  red: '#FF1744',
  pink: '#F50057',
  purple: '#D500F9',
  deepPurple: '#651FFF',
  indigo: '#3D5AFE',
  blue: '#2979FF',
  lightBlue: '#00B0FF',
  cyan: '#00E5FF',
  teal: '#1DE9B6',
  green: '#00E676',
  lightGreen: '#76FF03',
  lime: '#C6FF00',
  yellow: '#FFEA00',
  amber: '#FFC400',
  orange: '#FF9100',
  deepOrange: '#FF3D00',
};

export type CaseStatusProps = {
  status: number;
  readonly?: boolean;
  onChange?: (status: number) => void;
};

export function CaseStatus({ status, readonly, onChange }: CaseStatusProps) {
  const theme = useTheme();
  const colors = theme.palette.mode === 'light' ? light : dark;
  const colorList = [
    colors.red,
    colors.pink,
    colors.purple,
    colors.deepPurple,
    colors.indigo,
    colors.blue,
    colors.lightBlue,
    colors.cyan,
    colors.teal,
    colors.green,
    colors.lightGreen,
    colors.lime,
    colors.yellow,
    colors.amber,
    colors.orange,
    colors.deepOrange,
  ];

  const handleToggle = (index: number) => {
    onChange?.(status ^ (1 << index));
  };

  if (readonly) {
    const selectedColors: string[] = [];
    for (let i = 0; i < colorList.length; i++) {
      if ((status & (1 << i)) > 0) {
        selectedColors.push(colorList[i]);
      }
    }
    const spacing = 0.6 + selectedColors.length * -0.11;
    return (
      <Stack direction="row" spacing={spacing}>
        {selectedColors.map((color) => (
          <CircleIcon key={color} sx={{ color, fontSize: 15 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
      {colorList.map((color, i) => {
        const isSelected = (status & (1 << i)) > 0;
        return (
          <CircleIcon
            key={color}
            onClick={() => handleToggle(i)}
            sx={{
              color,
              fontSize: 15,
              cursor: 'pointer',
              outline: isSelected ? `1px solid ${color}` : '1px solid transparent',
              borderRadius: '50%',
              '&:hover': { outline: `2px solid ${color}` },
            }}
          />
        );
      })}
    </Stack>
  );
}
