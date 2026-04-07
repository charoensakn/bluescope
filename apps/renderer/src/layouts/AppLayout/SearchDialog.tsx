import SearchIcon from '@mui/icons-material/Search';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Case } from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useCaseStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getShortId } from '../../utils';

export type SearchDialogProps = {
  open: boolean;
  onCancel?: () => void;
};

export function SearchDialog({ open, onCancel }: SearchDialogProps) {
  const navigate = useNavigate();
  const setFocusCaseId = useCaseStore((state) => state.setFocusCaseId);
  const [query, setQuery] = useState('');
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setQuery('');
    setCases([]);
    if (!open) {
      return;
    }
    setLoading(true);
    window.case.getAll().then((all: Case[]) => {
      all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setAllCases(all.filter((c) => !c.deletedAt));
      setCases(all.filter((c) => !c.deletedAt).slice(0, 10));
      setLoading(false);
    });
  }, [open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (allCases.length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const s = value?.trim().toLocaleLowerCase();

    if (!s) {
      setLoading(true);
      setCases(allCases.slice(0, 10));
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const ids: string[] = await window.search.search(s);
        const results = allCases
          .filter((c) =>
            ids.length > 0
              ? ids.includes(c.id)
              : c.title.toLocaleLowerCase().indexOf(s) !== -1 || c.description.toLocaleLowerCase().indexOf(s) !== -1,
          )
          .slice(0, 10);
        setCases(results);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (c: Case) => {
    setFocusCaseId(c.id);
    if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/cases')) {
      navigate('/description');
    }
    onCancel?.();
  };

  return (
    <Dialog open={open} onClose={() => onCancel?.()} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 2 }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={m.ui_search()}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <Stack divider={<Divider />}>
          {cases.map((c) => (
            <Stack
              key={c.id}
              direction="row"
              spacing={2}
              onClick={() => handleSelect(c)}
              sx={{
                cursor: 'pointer',
                alignItems: 'center',
                px: 3,
                py: 1.5,
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Typography
                variant="body1"
                color="secondary"
                sx={{ flexBasis: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {c.caseNumber || getShortId(c.id)}
              </Typography>
              <Typography
                variant="body1"
                sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {c.title || m.no_title()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
