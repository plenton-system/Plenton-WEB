import type { AppointmentDetailProps } from 'src/types';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';

import { useAppointment } from 'src/hooks/appointment/use-appointment';

import { fBuildDateTimeInput } from 'src/utils/format-time';

import { WorkspaceHeader } from '../components/form-header/workspace-header';
import AppointmentFormVieww from '../../appointment/view/appointment-form-view';
import { WorkspaceMealPlanTab } from '../components/form-tabs/workspace-meal-plan-tab';
import { WorkspaceAnamnesisTab } from '../components/form-tabs/workspace-anamnesis-tab';
import { WorkspaceEvolutionTab } from '../components/form-tabs/workspace-evolution-tab';
import { WorkspaceTabs, type WorkspaceTabId } from '../components/form-tabs/workspace-tabs';
import { WorkspaceAnthropometryTab } from '../components/form-tabs/workspace-anthropometry-tab';
import { WorkspaceClinicalDocumentTab } from '../components/form-tabs/workspace-clinical-document-tab';

// ----------------------------------------------------------------------

type WorkspaceFormViewProps = {
  patientId?: string;
  patientName?: string;
  initialTab?: WorkspaceTabId;
  onBack?: () => void;
  onReturn?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceFormView({
  patientId,
  patientName,
  initialTab,
  onBack,
  onReturn,
}: WorkspaceFormViewProps) {
  const [tab, setTab] = useState<WorkspaceTabId>(initialTab ?? 'mealPlan');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [appointmentInitialData, setAppointmentInitialData] = useState<AppointmentDetailProps | null>(null);
  const [scheduleSnackbarOpen, setScheduleSnackbarOpen] = useState(false);

  const { addEvent, loadingCalendar, loadingForm, error, success, resetFormStatesHook } = useAppointment();

  useEffect(() => {
    setTab(initialTab ?? 'mealPlan');
  }, [initialTab]);

  useEffect(() => {
    if (success) {
      setScheduleModalOpen(false);
      setAppointmentInitialData(null);
      setScheduleSnackbarOpen(true);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      setScheduleSnackbarOpen(true);
    }
  }, [error]);

  const handleOpenNewAppointment = () => {
    setAppointmentInitialData({
      patientId: patientId ?? '',
      patientName,
      start: fBuildDateTimeInput(),
    });
    setScheduleModalOpen(true);
  };

  const handleCloseNewAppointment = () => {
    setScheduleModalOpen(false);
    setAppointmentInitialData(null);
    resetFormStatesHook(false);
  };

  const handleSubmitNewAppointment = async (formData: AppointmentDetailProps) => {
    await addEvent(formData);
  };

  const handleCloseScheduleSnackbar = () => {
    setScheduleSnackbarOpen(false);
    resetFormStatesHook(false);
  };

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
      <Stack spacing={3}>
        <WorkspaceHeader
          onBack={onBack}
          onNewAppointment={handleOpenNewAppointment}
        />

        <Divider />

        <WorkspaceTabs value={tab} onChange={setTab} />

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: '1fr',
            alignItems: 'start',
          }}
        >
          <Stack spacing={3}>
            {tab === 'mealPlan' && <WorkspaceMealPlanTab patientId={patientId} onDone={onReturn} />}

            {tab === 'anthropometry' && (
              <WorkspaceAnthropometryTab
                patientId={patientId}
                patientName={patientName}
                onDone={onReturn}
              />
            )}

            {tab === 'anamnesis' && <WorkspaceAnamnesisTab patientId={patientId} />}

            {tab === 'evolution' && <WorkspaceEvolutionTab patientId={patientId} />}

            {tab === 'exams' && <WorkspaceClinicalDocumentTab kind="exams" patientId={patientId} />}

            {tab === 'prescriptions' && (
              <WorkspaceClinicalDocumentTab kind="prescriptions" patientId={patientId} />
            )}

          </Stack>
        </Box>
      </Stack>

      <Dialog open={scheduleModalOpen} onClose={handleCloseNewAppointment} maxWidth="sm" fullWidth>
        <AppointmentFormVieww
          appointment={appointmentInitialData}
          onSubmit={handleSubmitNewAppointment}
          onCancel={handleCloseNewAppointment}
          loading={loadingCalendar || loadingForm}
        />
      </Dialog>

      <Snackbar
        open={scheduleSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseScheduleSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {error || success ? (
          <Alert
            severity={error ? 'error' : 'success'}
            variant="filled"
            onClose={handleCloseScheduleSnackbar}
            sx={{ width: '100%' }}
          >
            {error ?? success}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Card>
  );
}
