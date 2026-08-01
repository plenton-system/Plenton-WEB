import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { DashboardContent } from 'src/layouts/dashboard';

import { PatientListView } from './patient-list-view';
import { PatientFormView } from './patient-form-view';

// ----------------------------------------------------------------------

type Toast = | { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

// ----------------------------------------------------------------------

export function PatientView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId');
  const [toast, setToast] = useState<Toast>({ kind: 'idle' });
  const [patientId, setPatientId] = useState<string | null>(initialPatientId);
  const [currentView, setCurrentView] = useState<'list' | 'form'>(
    initialPatientId ? 'form' : 'list'
  );

  const handleEditAndCreate = (id: string | null) => {
    setPatientId(id);
    setCurrentView('form');
    setSearchParams(id ? { patientId: id } : {});
  };

  const handleReturnToList = () => {
    setPatientId(null);
    setCurrentView('list');
    setSearchParams({});
  };

  return (
    <>
      <DashboardContent maxWidth="xl">
        {currentView === 'list' ? (
          <PatientListView
            onCreate={() => handleEditAndCreate(null)}
            onEdit={(id: string) => handleEditAndCreate(id)}
            onNotify={(evt) => setToast(evt.kind === 'error'
              ? { kind: 'error', message: evt.message }
              : { kind: 'success', message: evt.message })}
          />
        ) : (
          <PatientFormView
            patientId={patientId}
            onReturn={handleReturnToList}
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
