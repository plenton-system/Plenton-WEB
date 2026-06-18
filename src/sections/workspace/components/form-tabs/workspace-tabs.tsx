import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export const WORKSPACE_TABS = [
  { id: 'mealPlan', labelKey: 'workspace.tabs.mealPlan' },
  { id: 'anthropometry', labelKey: 'workspace.tabs.anthropometry' },
  { id: 'anamnesis', labelKey: 'workspace.tabs.anamnesis' },
  { id: 'evolution', labelKey: 'workspace.tabs.evolution' },
  { id: 'documents', labelKey: 'workspace.tabs.documents' },
] as const;

export type WorkspaceTabId = (typeof WORKSPACE_TABS)[number]['id'];

// ----------------------------------------------------------------------

type Props = {
  value: WorkspaceTabId;
  onChange: (v: WorkspaceTabId) => void;
};

// ----------------------------------------------------------------------

export function WorkspaceTabs({ value, onChange }: Props) {
  const { t } = useTranslation();
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
        <Tab key={tab.id} label={t(tab.labelKey)} />
      ))}
    </Tabs>
  );
}
