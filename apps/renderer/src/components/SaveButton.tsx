import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { Button, type ButtonProps } from '@mui/material';
import { useEffect, useState } from 'react';
import { m } from '../paraglide/messages';

export type SaveButtonProps = ButtonProps & {
  isSave?: boolean;
};

export function SaveButton({ isSave, ...props }: SaveButtonProps) {
  const [showSaveIcon, setShowSaveIcon] = useState(false);

  useEffect(() => {
    setShowSaveIcon(isSave);
    if (isSave) {
      const timer = setTimeout(() => {
        setShowSaveIcon(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSave]);

  return (
    <Button variant="contained" startIcon={showSaveIcon ? <CheckIcon /> : <SaveIcon />} {...props}>
      {m.save()}
    </Button>
  );
}
