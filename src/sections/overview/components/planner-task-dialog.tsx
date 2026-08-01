import type { PlannerTask, PlannerTaskPriority, CreatePlannerTaskRequest } from 'src/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { patientService } from 'src/services/patient/patientService';

type PatientOption = { id: string; name: string };
const priorityKeys = {
  Low: 'planner.priority.low',
  Medium: 'planner.priority.medium',
  High: 'planner.priority.high',
} as const;

const uniquePatientsById = (items: PatientOption[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

type Props = {
  open: boolean;
  task?: PlannerTask | null;
  fixedPatientId?: string;
  fixedPatientName?: string;
  loading?: boolean;
  onClose: () => void;
  onSave: (payload: CreatePlannerTaskRequest) => Promise<unknown>;
};

export function PlannerTaskDialog({ open, task, fixedPatientId, fixedPatientName, loading, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PlannerTaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [patient, setPatient] = useState<PatientOption | null>(null);
  const [patientQuery, setPatientQuery] = useState('');
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'Medium');
    setDueDate(task?.dueDate ? task.dueDate.slice(0, 16) : '');
    setPatient(task?.patientId ? { id: task.patientId, name: task.patientName ?? fixedPatientName ?? '' } : fixedPatientId ? { id: fixedPatientId, name: fixedPatientName ?? '' } : null);
    setErrors({});
  }, [fixedPatientId, fixedPatientName, open, task]);

  useEffect(() => {
    if (!open || fixedPatientId) return undefined;
    const timeout = window.setTimeout(async () => {
      try {
        const response = await patientService.getAll({ pageIndex: 0, pageSize: 10, value: patientQuery, orderByField: 'name', order: 'asc' });
        setPatients(uniquePatientsById(response.items ?? []));
      } catch { setPatients([]); }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [fixedPatientId, open, patientQuery]);

  const handleSave = async () => {
    const nextErrors = { title: title.trim() ? undefined : t('planner.validation.titleRequired'), dueDate: dueDate && Number.isNaN(Date.parse(dueDate)) ? t('planner.validation.dueDateInvalid') : undefined };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.dueDate) return;
    await onSave({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate ? new Date(dueDate).toISOString() : null, patientId: fixedPatientId ?? patient?.id ?? null });
    setSuccessOpen(true);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{task ? t('planner.dialog.editTitle') : t('planner.dialog.newTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '16px !important' }}>
          <TextField required label={t('planner.fields.title')} value={title} onChange={(event) => setTitle(event.target.value)} error={Boolean(errors.title)} helperText={errors.title} />
          <TextField multiline minRows={3} label={t('planner.fields.description')} value={description} onChange={(event) => setDescription(event.target.value)} />
          <TextField select label={t('planner.fields.priority')} value={priority} onChange={(event) => setPriority(event.target.value as PlannerTaskPriority)}>
            {(['Low', 'Medium', 'High'] as const).map((value) => <MenuItem key={value} value={value}>{t(priorityKeys[value])}</MenuItem>)}
          </TextField>
          <TextField type="datetime-local" label={t('planner.fields.dueDate')} value={dueDate} onChange={(event) => setDueDate(event.target.value)} error={Boolean(errors.dueDate)} helperText={errors.dueDate} slotProps={{ inputLabel: { shrink: true } }} />
          {fixedPatientId ? (
            <TextField label={t('planner.fields.patient')} value={fixedPatientName ?? patient?.name ?? fixedPatientId} disabled />
          ) : (
            <Autocomplete
              options={patients}
              value={patient}
              getOptionKey={(option) => option.id}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, value) => setPatient(value)}
              onInputChange={(_, value) => setPatientQuery(value)}
              renderInput={(params) => (
                <TextField {...params} label={t('planner.fields.patient')} />
              )}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('actions.cancel')}</Button>
          <Button variant="contained" disabled={loading} onClick={handleSave}>{t('actions.save')}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}><Alert severity="success" variant="filled">{t('planner.messages.saveSuccess')}</Alert></Snackbar>
    </>
  );
}
