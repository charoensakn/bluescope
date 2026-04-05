import { Box } from '@mui/material';

export type MiniUIProps = {
  side: 'light' | 'dark';
};

export function MiniUI({ side }: MiniUIProps) {
  const bg = side === 'light' ? '#f5f5f5' : '#121212';
  const sidebar = side === 'light' ? '#e0e0e0' : '#1e1e1e';
  const line = side === 'light' ? '#c2c2c2' : '#3a3a3a';
  const topbar = side === 'light' ? '#eeeeee' : '#1a1a1a';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', bgcolor: bg }}>
      {/* Top bar */}
      <Box
        sx={{
          height: 10,
          bgcolor: topbar,
          display: 'flex',
          alignItems: 'center',
          px: 0.5,
          gap: 0.3,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ff5f57' }} />
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#28c840' }} />
      </Box>
      {/* Body */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 18,
            bgcolor: sidebar,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.4,
            p: 0.4,
            pt: 0.6,
          }}
        >
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '80%' }} />
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '60%' }} />
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '70%' }} />
        </Box>
        {/* Content */}
        <Box sx={{ flex: 1, p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5 }} />
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '75%' }} />
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '55%' }} />
          <Box sx={{ height: 3, bgcolor: line, borderRadius: 0.5, width: '85%' }} />
        </Box>
      </Box>
    </Box>
  );
}
