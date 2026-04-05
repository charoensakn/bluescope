import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { Provider } from '@repo/modules';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getProviderName, getShortId } from '../../utils';

export type ProviderCardProps = {
  provider: Provider;
  onUpClick?: () => void;
  onDownClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onMakeDefaultClick?: () => void;
};

export function ProviderCard({
  provider,
  onDeleteClick,
  onDownClick,
  onEditClick,
  onMakeDefaultClick,
  onUpClick,
}: ProviderCardProps) {
  const locale = useUIStore((state) => state.uiLocale);
  const displayName = getProviderName(provider.providerName);
  const shortId = getShortId(provider.id);

  return (
    <Card>
      <CardHeader
        action={
          <Stack direction="row" spacing={1}>
            <IconButton disabled={!onUpClick} onClick={() => onUpClick?.()}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton disabled={!onDownClick} onClick={() => onDownClick?.()}>
              <ArrowDownwardIcon />
            </IconButton>
          </Stack>
        }
        title={
          <Typography
            variant="caption"
            color="primary"
            textTransform="uppercase"
            fontWeight="bold"
            fontSize="0.65rem"
            letterSpacing={1}
          >
            {shortId}
          </Typography>
        }
        subheader={
          <Typography variant="h6">
            {displayName}
            {provider.modelName ? ` - ${provider.modelName}` : ''}
            {provider.default ? ' *' : ''}
          </Typography>
        }
      />
      <CardContent>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {provider.titleAgent && <Chip variant="outlined" label={m.agent_title(undefined, { locale })} />}
          {provider.summaryAgent && <Chip variant="outlined" label={m.agent_summary(undefined, { locale })} />}
          {provider.descriptionRefinementAgent && (
            <Chip variant="outlined" label={m.agent_description_refinement(undefined, { locale })} />
          )}
          {provider.entityRefinementAgent && (
            <Chip variant="outlined" label={m.agent_entity_refinement(undefined, { locale })} />
          )}
          {provider.structureExtractionAgent && (
            <Chip variant="outlined" label={m.agent_structure_extraction(undefined, { locale })} />
          )}
          {provider.linkAnalysisAgent && (
            <Chip variant="outlined" label={m.agent_link_analysis(undefined, { locale })} />
          )}
          {provider.classificationAgent && (
            <Chip variant="outlined" label={m.agent_classification(undefined, { locale })} />
          )}
          {provider.advisoryAgent && <Chip variant="outlined" label={m.agent_advisory(undefined, { locale })} />}
        </Stack>
      </CardContent>
      <CardActions>
        <Stack direction="row" spacing={1} width="100%" px={1} pb={1}>
          <Button disabled={provider.default} size="small" onClick={() => onMakeDefaultClick?.()}>
            {m.setting_make_default(undefined, { locale })}
          </Button>
          <Box flex={1} />
          <Button variant="outlined" startIcon={<EditIcon />} size="small" onClick={() => onEditClick?.()}>
            {m.edit(undefined, { locale })}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            size="small"
            onClick={() => onDeleteClick?.()}
          >
            {m.delete(undefined, { locale })}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
