import type { PatientFormValues, PatientDetailProps } from 'src/types';

import { useFormik } from 'formik';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { usePatientDetail } from 'src/hooks/patient/use-patient-detail';

import { fDateInput } from 'src/utils/format-time';
import { authStorage } from 'src/utils/auth-storage';
import { fileToBase64 } from 'src/utils/format-file';

import * as PatientEnum from 'src/enums/patient';

import { Iconify } from 'src/components/iconify';

import { validationSchema } from '../validation';
import PatientTabs from '../components/form-tabs/patient-tabs';
import PatientHeader from '../components/form-header/patient-header';
import PatientDataTab from '../components/form-tabs/patient-data-tab';
import PatientNotesTab from '../components/form-tabs/patient-notes-tab';
import PatientAddressTab from '../components/form-tabs/patient-address-tab';

// ----------------------------------------------------------------------

type PatientFormViewProps = {
  patientId?: string | null;
  onReturn: () => void;
};

// ----------------------------------------------------------------------

export function PatientFormView({ patientId, onReturn }: PatientFormViewProps) {
  const isEdit = !!patientId;

  const { data, loading, error, createOrUpdate } = usePatientDetail({
    id: patientId ?? null,
    autoLoad: !!patientId,
  });

  const emptyPatient: PatientFormValues = {
    id: '',
    name: '',
    phone: '',
    email: '',
    status: PatientEnum.Status.Active,
    document: '',
    birthDate: '',
    gender: '' as any,
    addressDto: { street: '', neighborhood: '', city: '', state: '', zipCode: '' },
    profilePhoto: undefined,
    dietPlans: [],
    notes: '',
  };

  const [tab, setTab] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<PatientFormValues>(emptyPatient);

  useEffect(() => {
    if (data) {
      setInitialValues({
        ...(data as PatientDetailProps as PatientFormValues),
        profilePhoto: data.profilePhoto || undefined,
        birthDate: data.birthDate ? fDateInput(data.birthDate) : '',
        dietPlans: (data as any)?.dietPlans ?? [],
        notes: (data as any)?.notes ?? '',
      });
    }
  }, [data]);

  const formik = useFormik<PatientFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      setLocalError(null);

      let photoBase64: string | undefined;
      if (
        values.profilePhoto &&
        typeof values.profilePhoto === 'object' &&
        values.profilePhoto instanceof File
      ) {
        photoBase64 = await fileToBase64(values.profilePhoto);
      } else if (typeof values.profilePhoto === 'string') {
        photoBase64 = values.profilePhoto;
      }

      const payload = {
        ...values,
        profilePhoto: photoBase64,
        gender: values.gender !== undefined && values.gender !== '' ? values.gender : null,
        birthDate: values.birthDate || null,
        nutritionistId: authStorage.getUser()?.id || '',
      };

      const ok = await createOrUpdate(payload);
      if (ok) onReturn?.();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {localError ?? error}
        </Alert>
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <IconButton onClick={onReturn} aria-label="Voltar" disabled={loading}>
          <Iconify icon="eva:arrow-ios-forward-fill" sx={{ transform: 'rotate(180deg)' }} />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {isEdit ? 'Editar Paciente' : 'Novo Paciente'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          Salvar
        </Button>
      </Stack>

      <Card sx={{ p: 3 }}>
        <PatientHeader formik={formik} />

        <PatientTabs value={tab} onChange={setTab} />

        <Divider sx={{ mb: 3 }} />

        {tab === 0 && (
          <Stack spacing={4}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="solar:clipboard-list-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', fontWeight: 'fontWeightSemiBold', letterSpacing: 0.6 }}
                >
                  Identificação
                </Typography>
                <Divider sx={{ flexGrow: 1, ml: 1, borderStyle: 'dashed' }} />
              </Stack>
              <PatientDataTab formik={formik} />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Iconify icon="solar:home-angle-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                <Typography
                  variant="overline"
                  sx={{ color: 'text.secondary', fontWeight: 'fontWeightSemiBold', letterSpacing: 0.6 }}
                >
                  Endereço
                </Typography>
                <Divider sx={{ flexGrow: 1, ml: 1, borderStyle: 'dashed' }} />
              </Stack>
              <PatientAddressTab formik={formik} />
            </Box>
          </Stack>
        )}
        {tab === 1 && <PatientNotesTab formik={formik} />}
      </Card>
    </form>
  );
}
