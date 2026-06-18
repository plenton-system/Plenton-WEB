import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { DashboardContent } from 'src/layouts/dashboard';

import { WorkspaceFormView } from './workspace-form-view';
import { WorkspaceListView } from './workspace-list-view';

import type { WorkspaceTabId } from '../components/form-tabs/workspace-tabs';

// ----------------------------------------------------------------------

type Toast = { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

// ----------------------------------------------------------------------

export function WorkspaceView() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [patientId, setPatientId] = useState<string | undefined>(undefined);
  const [patientName, setPatientName] = useState<string | undefined>(undefined);
  const [initialTab, setInitialTab] = useState<WorkspaceTabId>('mealPlan');
  const [toast, setToast] = useState<Toast>({ kind: 'idle' });

  const handleOpen = (id?: string, tab: WorkspaceTabId = 'mealPlan', nextPatientName?: string) => {
    setPatientId(id);
    setPatientName(nextPatientName);
    setInitialTab(tab);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setPatientId(undefined);
    setPatientName(undefined);
    setInitialTab('mealPlan');
    setToast({ kind: 'idle' });
  };

  return (
    <>
      <DashboardContent maxWidth="xl">
        {currentView === 'list' ? (
          <WorkspaceListView onOpen={handleOpen} />
        ) : (
          <WorkspaceFormView
            patientId={patientId}
            patientName={patientName}
            initialTab={initialTab}
            onBack={handleBackToList}
            onReturn={() => {
              setCurrentView('list');
              setPatientId(undefined);
              setPatientName(undefined);
              setInitialTab('mealPlan');
              setToast({ kind: 'success', message: t('workspace.saved') });
            }}
          />
        )}
      </DashboardContent>

      <Snackbar
        open={toast.kind !== 'idle'}
        autoHideDuration={4000}
        onClose={() => setToast({ kind: 'idle' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast.kind !== 'idle' ? (
          <Alert
            severity={toast.kind}
            variant="filled"
            onClose={() => setToast({ kind: 'idle' })}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
