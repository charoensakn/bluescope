import { Grid, LinearProgress, Stack, Typography } from '@mui/material';
import type { Case, Skill, Stats } from '@repo/modules';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Loading, PageContainer, PageHeader, PaperWithHeader } from '../../components';
import fetcher from '../../fetcher';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';
import { getPriorityProgressColor } from '../../utils';
import { AgentUsage, type AgentUsageLog } from './AgentUsage';
import { RecentCase } from './RecentCase';
import { StatCard } from './StatCard';

type PriorityData = {
  label: string;
  value: number;
  color: 'info' | 'primary' | 'warning' | 'error' | 'secondary' | 'success' | 'inherit';
};

type ClassificationData = {
  name: string;
  count: number;
};

export function DashboardPage() {
  const [agentUsages, setAgentUsages] = useState<AgentUsageLog[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityData[]>([]);
  const [classificationData, setClassificationData] = useState<ClassificationData[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [highPriority, setHighPriority] = useState(0);
  const [resolved, setResolved] = useState(0);
  const locale = useUIStore((state) => state.uiLocale);

  const { data: skills, isLoading: isSkillsLoading } = useSWR<Skill[]>('classification:getSkills', fetcher);
  const { data: stats, isLoading: isStatsLoading } = useSWR<Stats>('dashboard', fetcher);
  const { data: cases, isLoading: isCasesLoading } = useSWR<Case[]>('case:getAll', fetcher);

  useEffect(() => {
    if (!stats) return;

    const { usages } = stats;

    const titleUsages = usages.filter((u) => u.agent.startsWith('title-v'));
    const summaryUsages = usages.filter((u) => u.agent.startsWith('summary-v'));
    const descriptionRefinementUsages = usages.filter((u) => u.agent.startsWith('description-refinement-v'));
    const entityRefinementUsages = usages.filter((u) => u.agent.startsWith('entity-refinement-v'));
    const structureExtractionUsages = usages.filter((u) => u.agent.startsWith('structure-extraction-v'));
    const linkAnalysisUsages = usages.filter((u) => u.agent.startsWith('link-analysis-v'));
    const classificationUsages = usages.filter((u) => u.agent.startsWith('classification-v'));
    const advisoryUsages = usages.filter((u) => u.agent.startsWith('advisory-v'));
    const synthesisUsages = usages.filter((u) => u.agent.startsWith('synthesis-v'));

    setAgentUsages([
      {
        agentName: m.agent_title(),
        input: titleUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: titleUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: titleUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: titleUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_summary(),
        input: summaryUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: summaryUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: summaryUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: summaryUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_description_refinement(),
        input: descriptionRefinementUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: descriptionRefinementUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: descriptionRefinementUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: descriptionRefinementUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_entity_refinement(),
        input: entityRefinementUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: entityRefinementUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: entityRefinementUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: entityRefinementUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_structure_extraction(),
        input: structureExtractionUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: structureExtractionUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: structureExtractionUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: structureExtractionUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_link_analysis(),
        input: linkAnalysisUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: linkAnalysisUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: linkAnalysisUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: linkAnalysisUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_classification(),
        input: classificationUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: classificationUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: classificationUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: classificationUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_advisory(),
        input: advisoryUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: advisoryUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: advisoryUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: advisoryUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.agent_synthesis(),
        input: synthesisUsages.reduce((sum, u) => sum + u.sumInput, 0),
        output: synthesisUsages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: synthesisUsages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: synthesisUsages.reduce((sum, u) => sum + u.count, 0),
      },
      {
        agentName: m.total(),
        input: usages.reduce((sum, u) => sum + u.sumInput, 0),
        output: usages.reduce((sum, u) => sum + u.sumOutput, 0),
        total: usages.reduce((sum, u) => sum + u.sumTotal, 0),
        calls: usages.reduce((sum, u) => sum + u.count, 0),
      },
    ]);
  }, [stats]);

  useEffect(() => {
    if (!cases) return;

    setTotal(cases.length);
    setActive(cases.filter((c) => !c.deletedAt).length);
    setHighPriority(cases.filter((c) => c.priority >= 4 && !c.deletedAt).length);
    setResolved(cases.filter((c) => c.deletedAt).length);

    setPriorityData([
      {
        label: m.priority_5(),
        value: cases.filter((c) => !c.deletedAt && c.priority === 5).length,
        color: getPriorityProgressColor(5),
      },
      {
        label: m.priority_4(),
        value: cases.filter((c) => !c.deletedAt && c.priority === 4).length,
        color: getPriorityProgressColor(4),
      },
      {
        label: m.priority_3(),
        value: cases.filter((c) => !c.deletedAt && c.priority === 3).length,
        color: getPriorityProgressColor(3),
      },
      {
        label: m.priority_2(),
        value: cases.filter((c) => !c.deletedAt && c.priority === 2).length,
        color: getPriorityProgressColor(2),
      },
      {
        label: m.priority_1(),
        value: cases.filter((c) => !c.deletedAt && c.priority === 1).length,
        color: getPriorityProgressColor(1),
      },
    ]);
  }, [cases]);

  useEffect(() => {
    if (!skills || !stats) return;

    const data: ClassificationData[] = [];
    for (const s of skills) {
      data.push({
        name: locale === 'th' ? s.skillNameTh : s.skillNameEn,
        count: stats.types.reduce((sum, t) => sum + (t.caseType === s.skillId ? t.count : 0), 0),
      });
    }
    data.sort((a, b) => b.count - a.count);

    const top5 = data.slice(0, 5);
    const othersCount = data.slice(5).reduce((sum, d) => sum + d.count, 0);
    top5.push({
      name: m.others(),
      count: othersCount,
    });
    setClassificationData(top5);
  }, [skills, stats, locale]);

  if (isStatsLoading || isSkillsLoading || isCasesLoading) return <Loading />;

  return (
    <PageContainer>
      <PageHeader title={m.dashboard_title()} subtitle={m.dashboard_subtitle()} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={m.dashboard_total_cases()} value={total} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={m.dashboard_active_cases()} value={active} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={m.dashboard_high_priority()} value={highPriority} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label={m.dashboard_resolved()} value={resolved} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 7 }}>
          <RecentCase cases={cases} />
        </Grid>

        {/* Right column */}
        <Grid size={{ xs: 12, xl: 5 }}>
          <Stack spacing={2}>
            {/* Priority breakdown */}
            <PaperWithHeader title={m.dashboard_priority_breakdown()}>
              <Stack spacing={1.5}>
                {priorityData.map((p) => (
                  <Stack key={p.label} spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="textSecondary">
                        {p.label}
                      </Typography>
                      <Typography variant="caption" color="textPrimary">
                        {p.value}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={cases?.length > 0 ? (p.value / cases.length) * 100 : 0}
                      color={p.color}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': { backgroundColor: p.color },
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </PaperWithHeader>

            {/* Top classifications */}
            <PaperWithHeader title={m.dashboard_top_classifications()}>
              {classificationData.map((c) => (
                <Stack key={c.name} spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.name}
                    </Typography>
                    <Typography variant="caption" color="textPrimary">
                      {c.count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={cases?.length > 0 ? (c.count / cases.length) * 100 : 0}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      mt: 0.5,
                      backgroundColor: 'action.hover',
                    }}
                  />
                </Stack>
              ))}
            </PaperWithHeader>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AgentUsage usages={agentUsages} />
        </Grid>
      </Grid>
    </PageContainer>
  );
}
