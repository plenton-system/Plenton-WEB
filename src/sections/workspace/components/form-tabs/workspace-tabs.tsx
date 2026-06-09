import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// ----------------------------------------------------------------------

export const WORKSPACE_TABS = [
  { id: 'mealPlan', label: 'Plano alimentar' },
  { id: 'anthropometry', label: 'Antropometria' },
  { id: 'anamnesis', label: 'Anamnese' },
  { id: 'evolution', label: 'Evolução' },
  { id: 'documents', label: 'Documentos' },
] as const;

export type WorkspaceTabId = (typeof WORKSPACE_TABS)[number]['id'];

// ----------------------------------------------------------------------

type Props = {
  value: WorkspaceTabId;
  onChange: (v: WorkspaceTabId) => void;
};

// ----------------------------------------------------------------------

export function WorkspaceTabs({ value, onChange }: Props) {
  const currentIndex = WORKSPACE_TABS.findIndex((tab) => tab.id === value);

  return (
    <Tabs
      value={currentIndex}
      onChange={(_, idx) => onChange(WORKSPACE_TABS[idx]?.id ?? WORKSPACE_TABS[0].id)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ px: 1 }}
    >
      {WORKSPACE_TABS.map((tab) => (
        <Tab key={tab.id} label={tab.label} />
      ))}
    </Tabs>
  );
}
