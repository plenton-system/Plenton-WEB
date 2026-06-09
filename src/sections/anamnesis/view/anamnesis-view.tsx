import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnamnesisFormView } from './anamnesis-form-view';
import { AnamsnesisListView } from './anamnesis-list-view';

// ----------------------------------------------------------------------

type Toast = | { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string };

// ----------------------------------------------------------------------

export function AnamnesisView() {
    const [toast, setToast] = useState<Toast>({ kind: 'idle' });
    const [anamnesisId, setAnamnesisId] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'list' | 'form'>('list');

    const handleEditAndCreate = (id: string | null) => {
        setAnamnesisId(id);
        setCurrentView('form');
    };

    return (
        <>
            <DashboardContent maxWidth="xl">
                {currentView === 'list' ? (
                    <AnamsnesisListView
                        onCreate={() => handleEditAndCreate(null)}
                        onEdit={(id: string) => handleEditAndCreate(id)}
                        onNotify={(evt) => setToast(evt.kind === 'error'
                            ? { kind: 'error', message: evt.message }
                            : { kind: 'success', message: evt.message })}
                    />
                ) : (
                    <AnamnesisFormView
                        anamnesisId={anamnesisId}
                        onReturn={() => setCurrentView('list')}
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
