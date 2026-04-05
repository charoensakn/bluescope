import DeleteIcon from '@mui/icons-material/Delete';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff';
import { Box, Button, Chip, Divider, IconButton, Stack } from '@mui/material';
import type { Skill as CaseSkill, CaseType, SkillID } from '@repo/modules';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  AIButton,
  CaseNotFound,
  Loading,
  PageContainer,
  PageHeader,
  PaperWithHeader,
  Reasoning,
  type ReasoningMessage,
} from '../../components';
import fetcher from '../../fetcher';
import { useCaseStore, useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { baseMono } from '../../theme';
import { ClearDialog } from './ClearDialog';
import { type Skill, SkillCard } from './SkillCard';

type SkillCategory = {
  id: string;
  name: string;
  skills: Skill[];
};

export function ClassificationPage() {
  const { uiLocale, promptLocale } = useUIStore((state) => state);
  const focusCaseId = useCaseStore((state) => state.focusCaseId);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [message, setMessage] = useState<ReasoningMessage>(null);
  const [isClearDialogOpen, setClearDialogOpen] = useState(false);
  const [isShowDescription, setIsShowDescription] = useState(false);

  const { data: skills, isLoading: isSkillsLoading } = useSWR<CaseSkill[]>('classification:getSkills', fetcher);
  const {
    data: types,
    isLoading: isTypesLoading,
    mutate,
  } = useSWR<CaseType[]>(focusCaseId ? `classification:${focusCaseId}` : null, fetcher);

  const selectedSkills = new Set<string>(types ? types.filter((t) => !t.deletedAt).map((t) => t.caseType) : []);

  useEffect(() => {
    if (!skills) return;
    const categoryMap = new Map<string, SkillCategory>();
    for (const skill of skills) {
      if (!skill.categoryId) continue;
      categoryMap.set(skill.categoryId, {
        id: skill.categoryId,
        name: (uiLocale === 'th' ? skill.categoryNameTh : skill.categoryNameEn) || skill.categoryId,
        skills: [],
      });
    }
    for (const category of categoryMap.values()) {
      category.skills = skills
        .filter((s) => s.categoryId === category.id)
        .map((s) => ({
          id: s.skillId,
          name: (uiLocale === 'th' ? s.skillNameTh : s.skillNameEn) || s.skillId,
          description: s.description,
        }));
    }
    setCategories(Array.from(categoryMap.values()));
  }, [skills, uiLocale]);

  const handleCategorize = async () => {
    if (!focusCaseId) return;
    setIsCategorizing(true);
    try {
      await window.classification.categorize({
        caseId: focusCaseId,
        thai: promptLocale === 'th',
      });
      setMessage({
        severity: 'success',
        message: m.classification_success(),
      });
      mutate();
    } catch (err) {
      setMessage({
        severity: 'error',
        message: m.error({ message: (err as Error).message }),
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleClear = async () => {
    if (!focusCaseId) return;
    setMessage(null);
    try {
      await window.classification.deleteAll(focusCaseId);
      setMessage({
        severity: 'success',
        message: m.classification_clear_success(),
      });
      mutate();
    } catch (err) {
      setMessage({
        severity: 'error',
        message: m.error({ message: (err as Error).message }),
      });
    } finally {
      setClearDialogOpen(false);
    }
  };

  const handleSelectSkill = async (skillId: SkillID, selected: boolean) => {
    if (!focusCaseId) return;
    try {
      await window.classification.selectSkill(focusCaseId, skillId, selected);
      mutate();
    } catch (err) {
      setMessage({
        severity: 'error',
        message: m.error({ message: (err as Error).message }),
      });
    }
  };

  if (isSkillsLoading || isTypesLoading) return <Loading />;

  if (!focusCaseId) return <CaseNotFound />;

  return (
    <PageContainer>
      <PageHeader title={m.classification_title()} subtitle={m.classification_subtitle()}>
        <Box display="flex" alignItems="center">
          <IconButton size="small" onClick={() => setIsShowDescription((prev) => !prev)}>
            {isShowDescription ? <SubtitlesIcon fontSize="small" /> : <SubtitlesOffIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setClearDialogOpen(true)}>
          {m.clear()}
        </Button>
        <AIButton isLoading={isCategorizing} onClick={handleCategorize}>
          {m.categorize()}
        </AIButton>
      </PageHeader>
      <Reasoning message={message} />
      {types?.length > 0 && (
        <>
          <PaperWithHeader
            title={m.classification_selected_skills()}
            controls={
              <Chip
                label={`${selectedSkills.size}/${skills.length}`}
                sx={{
                  fontFamily: baseMono,
                  fontWeight: 'bold',
                }}
              />
            }
          >
            <Stack>
              {skills
                .filter((s) => types.some((t) => t.caseType === s.skillId))
                .map((skill) => (
                  <SkillCard
                    key={skill.skillId}
                    skill={{
                      id: skill.skillId,
                      name: (uiLocale === 'th' ? skill.skillNameTh : skill.skillNameEn) || skill.skillId,
                      description: skill.description,
                    }}
                    types={types}
                    isShowDescription={isShowDescription}
                    onSelected={handleSelectSkill}
                  />
                ))}
            </Stack>
          </PaperWithHeader>
          <Divider />
        </>
      )}
      {categories.map((cat) => (
        <PaperWithHeader
          key={cat.id}
          title={cat.name}
          controls={
            <Chip
              label={`${cat.skills.reduce((acc, skill) => acc + (selectedSkills.has(skill.id) ? 1 : 0), 0)}/${cat.skills.length}`}
              sx={{
                fontFamily: baseMono,
                fontWeight: 'bold',
              }}
            />
          }
        >
          <Stack>
            {cat.skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                types={types}
                isShowDescription={isShowDescription}
                onSelected={handleSelectSkill}
              />
            ))}
          </Stack>
        </PaperWithHeader>
      ))}
      <ClearDialog open={isClearDialogOpen} onSubmit={handleClear} onCancel={() => setClearDialogOpen(false)} />
    </PageContainer>
  );
}
