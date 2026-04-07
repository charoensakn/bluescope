import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import type { HitTargets, Node, Relationship } from '@neo4j-nvl/base';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import type {
  Asset,
  CaseLink,
  Location as CaseLocation,
  Damage,
  Event,
  Evidence,
  Organization,
  Person,
} from '@repo/modules';
import { useEffect, useRef, useState } from 'react';
import { m } from '../../paraglide/messages';

type NodeType = 'person' | 'organization' | 'location' | 'asset' | 'event' | 'damage' | 'evidence' | 'unknown';

type HoveredInfo = {
  label: string;
  type: string;
  x: number;
  y: number;
};

export type NetworkGraphProps = {
  persons?: Person[];
  organizations?: Organization[];
  locations?: CaseLocation[];
  assets?: Asset[];
  events?: Event[];
  damages?: Damage[];
  evidences?: Evidence[];
  links?: CaseLink[];
};

export function NetworkGraph({
  persons,
  organizations,
  locations,
  assets,
  events,
  damages,
  evidences,
  links,
}: NetworkGraphProps) {
  const theme = useTheme();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [hoveredInfo, setHoveredInfo] = useState<HoveredInfo | null>(null);
  const nodeTypeMapRef = useRef<Record<string, NodeType>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeStyles = {
    person: { color: theme.palette.primary.main },
    organization: { color: theme.palette.secondary.light },
    location: { color: theme.palette.secondary.dark },
    asset: { color: theme.palette.error.light },
    event: { color: theme.palette.success.light },
    damage: { color: theme.palette.warning.light },
    evidence: { color: theme.palette.error.dark },
    unknown: { color: theme.palette.action.disabled },
  } as const;

  const legendItems: { label: string; type: NodeType }[] = [
    { label: m.persons(), type: 'person' },
    { label: m.organizations(), type: 'organization' },
    { label: m.locations(), type: 'location' },
    { label: m.assets(), type: 'asset' },
    { label: m.events(), type: 'event' },
    { label: m.damages(), type: 'damage' },
    { label: m.evidence(), type: 'evidence' },
  ] as const;

  useEffect(() => {
    const nodeIds = new Set<string>();
    const newNodes: Node[] = [];
    const newRelationships: Relationship[] = [];
    const typeMap: Record<string, NodeType> = {};

    function addNodes<T extends { id?: string; name?: string }>(items: T[] | undefined, type: NodeType) {
      if (!Array.isArray(items)) return;
      const style = nodeStyles[type];
      for (const item of items) {
        if (!item.id) continue;
        newNodes.push({
          id: item.id,
          caption: item.name || item.id,
          color: style.color,
        });
        nodeIds.add(item.id);
        typeMap[item.id] = type;
      }
    }

    addNodes(persons, 'person');
    addNodes(organizations, 'organization');
    addNodes(locations, 'location');
    addNodes(assets, 'asset');
    addNodes(events, 'event');
    addNodes(damages, 'damage');
    addNodes(evidences, 'evidence');

    if (Array.isArray(links)) {
      for (const l of links) {
        if (!l.sourceId || !l.targetId) continue;
        if (!nodeIds.has(l.sourceId)) {
          const style = nodeStyles.unknown;
          newNodes.push({
            id: l.sourceId,
            caption: l.sourceId,
            color: style.color,
          });
          nodeIds.add(l.sourceId);
          typeMap[l.sourceId] = 'unknown';
        }
        if (!nodeIds.has(l.targetId)) {
          const style = nodeStyles.unknown;
          newNodes.push({
            id: l.targetId,
            caption: l.targetId,
            color: style.color,
          });
          nodeIds.add(l.targetId);
          typeMap[l.targetId] = 'unknown';
        }
        newRelationships.push({
          id: `${l.sourceId}-${l.targetId}`,
          from: l.sourceId,
          to: l.targetId,
          caption: l.relation || '',
        });
      }
    }

    nodeTypeMapRef.current = typeMap;
    setNodes(newNodes);
    setRelationships(newRelationships);
  }, [persons, organizations, locations, assets, events, damages, evidences, links, nodeStyles]);

  const handleNodeClick = (node: Node) => {
    const selectedIds = new Set<string>();
    selectedIds.add(node.id);
    for (const rel of relationships) {
      if (rel.from === node.id) {
        selectedIds.add(rel.to);
      } else if (rel.to === node.id) {
        selectedIds.add(rel.from);
      }
    }
    setNodes((prev) => prev.map((n) => ({ ...n, selected: selectedIds.has(n.id) })));
  };

  const handleHover = (element: Node | Relationship, _hitElements: HitTargets, event: MouseEvent) => {
    if (!element) {
      return;
    }
    if (typeof element === 'object' && 'from' in element) {
      setHoveredInfo(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nodeType = nodeTypeMapRef.current[element.id] ?? 'unknown';
    const nodeTypeLabel = legendItems.find((item) => item.type === nodeType)?.label || m.unknown();
    setHoveredInfo({
      label: element.caption || element.id,
      type: nodeTypeLabel,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleCanvasClick = () => {
    setNodes((prev) => prev.map((n) => ({ ...n, selected: false })));
    setHoveredInfo(null);
  };

  return (
    <Paper
      ref={containerRef}
      elevation={1}
      sx={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 4 }}
      onMouseLeave={() => setHoveredInfo(null)}
    >
      <InteractiveNvlWrapper
        nvlOptions={{
          renderer: 'canvas',
          styling: { selectedBorderColor: theme.palette.primary.main },
        }}
        nodes={nodes}
        rels={relationships}
        width="100%"
        height="100%"
        mouseEventCallbacks={{
          onZoom: true,
          onPan: true,
          onDrag: true,
          onNodeClick: handleNodeClick,
          onHover: handleHover,
          onCanvasClick: handleCanvasClick,
        }}
      />

      {/* Legend */}
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          borderRadius: 4,
          p: 2,
          pointerEvents: 'none',
        }}
      >
        {legendItems.map((item) => (
          <Stack key={item.type} direction="row" spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: nodeStyles[item.type].color,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2">{item.label}</Typography>
          </Stack>
        ))}
      </Paper>

      {/* Hover tooltip */}
      {hoveredInfo && (
        <Box
          sx={{
            position: 'absolute',
            left: hoveredInfo.x + 20,
            top: hoveredInfo.y - 20,
            bgcolor: 'rgba(0,0,0,0.75)',
            color: '#fff',
            borderRadius: 1,
            p: 1,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 'small' }}>
            {hoveredInfo.type}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {hoveredInfo.label}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
