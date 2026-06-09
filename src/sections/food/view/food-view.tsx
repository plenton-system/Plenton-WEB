import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { DashboardContent } from 'src/layouts/dashboard';

import { FoodFormView } from './food-form-view';
import { FoodListView, type FoodTab } from './food-list-view';

// ----------------------------------------------------------------------

type Toast =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

// ----------------------------------------------------------------------

export function FoodView() {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [toast, setToast] = useState<Toast>({ kind: 'idle' });
  const [foodId, setFoodId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<FoodTab>('custom');

  const handleEditAndCreate = (id: string | null, tab?: FoodTab) => {
    if (tab) setSelectedTab(tab);
    setFoodId(id);
    setCurrentView('form');
  };

  return (
    <>
      <DashboardContent maxWidth="xl">
        {currentView === 'list' ? (
          <FoodListView
            tab={selectedTab}
            onTabChange={setSelectedTab}
            onCreate={(tab) => handleEditAndCreate(null, tab)}
            onEdit={(id, tab) => handleEditAndCreate(id, tab)}
            onNotify={(evt) =>
              setToast(
                evt.kind === 'error'
                  ? { kind: 'error', message: evt.message }
                  : { kind: 'success', message: evt.message }
              )
            }
          />
        ) : (
          <FoodFormView foodId={foodId} onReturn={() => setCurrentView('list')} />
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
