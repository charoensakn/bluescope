import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Stack, Typography } from '@mui/material';
import type { CaseType, SkillID } from '@repo/modules';

export type Skill = {
  id: string;
  name: string;
  description: string;
};

export type SkillCardProps = {
  skill?: Skill;
  types?: CaseType[];
  isShowDescription?: boolean;
  onSelected?: (id: SkillID, selected: boolean) => void;
};

export function SkillCard({ skill, types, isShowDescription, onSelected }: SkillCardProps) {
  const selected = skill && types?.some((t) => t.caseType === skill.id && !t.deletedAt);
  const selectedType = skill && types?.find((t) => t.caseType === skill.id);

  return (
    skill && (
      <Stack
        direction="row"
        sx={{
          cursor: 'pointer',
          p: 1,
          borderRadius: 2,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={() => onSelected?.(skill.id as SkillID, !selected)}
      >
        <Box pt={0.2} mr={2} sx={{ height: 28 }}>
          {selected ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon color="disabled" />}
        </Box>
        <Stack spacing={1}>
          <Typography variant="body1" fontWeight="bold" color={selected ? 'primary' : 'textPrimary'}>
            {skill.name}
          </Typography>
          {selectedType?.reason && (
            <Typography variant="body1" color="secondary">
              {selectedType.reason} ({(selectedType.confidence || 0).toFixed(2)})
            </Typography>
          )}
          {isShowDescription && skill.description && (
            <Typography variant="body1" color="textSecondary">
              {skill.description}
            </Typography>
          )}
        </Stack>
      </Stack>
    )
  );
}
