import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DashboardContent } from 'src/layouts/dashboard';

import { WorkspaceFormView } from './workspace-form-view';
import { WorkspaceListView } from './workspace-list-view';
import { WORKSPACE_TABS, type WorkspaceTabId } from '../components/form-tabs/workspace-tabs';

// ----------------------------------------------------------------------

const isWorkspaceTabId = (value: string | null): value is WorkspaceTabId =>
  WORKSPACE_TABS.some((tab) => tab.id === value);

// ----------------------------------------------------------------------

export function WorkspaceView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') ?? undefined;
  const initialPatientName = searchParams.get('patientName') ?? undefined;
  const tabParam = searchParams.get('tab');
  const initialWorkspaceTab = isWorkspaceTabId(tabParam) ? tabParam : 'mealPlan';
  const [currentView, setCurrentView] = useState<'list' | 'form'>(
    initialPatientId ? 'form' : 'list'
  );
  const [patientId, setPatientId] = useState<string | undefined>(initialPatientId);
  const [patientName, setPatientName] = useState<string | undefined>(initialPatientName);
  const [initialTab, setInitialTab] = useState<WorkspaceTabId>(initialWorkspaceTab);

  const handleOpen = (id?: string, tab: WorkspaceTabId = 'mealPlan', nextPatientName?: string) => {
    setPatientId(id);
    setPatientName(nextPatientName);
    setInitialTab(tab);
    setCurrentView('form');

    if (id) {
      const params = new URLSearchParams({ patientId: id });
      if (nextPatientName) params.set('patientName', nextPatientName);
      if (tab !== 'mealPlan') params.set('tab', tab);
      setSearchParams(params);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setPatientId(undefined);
    setPatientName(undefined);
    setInitialTab('mealPlan');
    setSearchParams({});
  };

  return (
    <DashboardContent maxWidth="xl">
      {currentView === 'list' ? (
        <WorkspaceListView onOpen={handleOpen} />
      ) : (
        <WorkspaceFormView
          patientId={patientId}
          patientName={patientName}
          initialTab={initialTab}
          onBack={handleBackToList}
        />
      )}
    </DashboardContent>
  );
}
