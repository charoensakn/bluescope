import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import { CheckField, PaperWithHeader } from '../../components';
import { useUIStore } from '../../hooks';
import { m } from '../../paraglide/messages';

export function ReasoningSetting() {
  const { isShowReasoning, showReasoning, hideReasoning } = useUIStore((state) => state);
  const locale = useUIStore((state) => state.uiLocale);

  return (
    <PaperWithHeader icon={<PsychologyAltIcon color="primary" />} title={m.setting_reasoning(undefined, { locale })}>
      <CheckField
        label={m.setting_show_reasoning(undefined, { locale })}
        selected={isShowReasoning}
        onClick={() => showReasoning()}
      />
      <CheckField
        label={m.setting_hide_reasoning(undefined, { locale })}
        selected={!isShowReasoning}
        onClick={() => hideReasoning()}
      />
    </PaperWithHeader>
  );
}
