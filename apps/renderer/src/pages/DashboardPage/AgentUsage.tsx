import { Box, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { PaperWithHeader } from '../../components';
import { m } from '../../paraglide/messages';

const numFmt = new Intl.NumberFormat('th-TH');

export type AgentUsageLog = {
  agentName: string;
  calls: number;
  input: number;
  output: number;
  total: number;
};

export type AgentUsageProps = {
  usages: AgentUsageLog[];
};

export function AgentUsage({ usages }: AgentUsageProps) {
  return (
    <PaperWithHeader title={m.dashboard_usage_logs()}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'end' }}>
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'end', fontWeight: 'bold', width: 120 }}>
          {m.dashboard_input_tokens()}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'end', fontWeight: 'bold', width: 120 }}>
          {m.dashboard_output_tokens()}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ display: { xs: 'none', md: 'inline' }, textAlign: 'end', fontWeight: 'bold', width: 120 }}
        >
          {m.total()}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ display: { xs: 'none', md: 'inline' }, textAlign: 'end', fontWeight: 'bold', width: 100 }}
        >
          {m.call()}
        </Typography>
      </Stack>
      {usages?.map((row) => (
        <Stack key={row.agentName} spacing={0.75}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ flexBasis: 180 }}>
              {row.agentName}
            </Typography>

            <Box
              sx={{
                flex: 1,
                position: 'relative',
                height: 10,
                borderRadius: 5,
                overflow: 'hidden',
                bgcolor: 'action.hover',
              }}
            >
              <Tooltip
                title={`${m.dashboard_input_tokens()}: ${numFmt.format(row.input)} ${m.dashboard_tokens()}`}
                placement="top"
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    height: '100%',
                    width: `${(row.input / row.total) * 100}%`,
                    bgcolor: 'primary.main',
                    opacity: 0.7,
                    borderRadius: '5px 0 0 5px',
                  }}
                />
              </Tooltip>
              <Tooltip
                title={`${m.dashboard_output_tokens()}: ${numFmt.format(row.output)} ${m.dashboard_tokens()}`}
                placement="top"
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${(row.input / row.total) * 100}%`,
                    height: '100%',
                    width: `${(row.output / row.total) * 100}%`,
                    bgcolor: 'secondary.main',
                    opacity: 0.7,
                  }}
                />
              </Tooltip>
            </Box>

            <Stack direction="row" spacing={1} sx={{ justifyContent: 'end' }}>
              <Typography variant="caption" color="primary" sx={{ width: 120, textAlign: 'end' }}>
                {numFmt.format(row.input)}
              </Typography>
              <Typography variant="caption" color="secondary" sx={{ width: 120, textAlign: 'end' }}>
                {numFmt.format(row.output)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ width: 120, textAlign: 'end', display: { xs: 'none', md: 'inline' } }}
              >
                {numFmt.format(row.total)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ width: 100, textAlign: 'end', display: { xs: 'none', md: 'inline' } }}
              >
                {numFmt.format(row.calls)}
              </Typography>
            </Stack>
          </Stack>
          <Divider sx={{ pb: 1 }} />
        </Stack>
      ))}
    </PaperWithHeader>
  );
}
