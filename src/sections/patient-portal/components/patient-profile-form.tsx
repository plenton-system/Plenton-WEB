import type { PatientSelfProfile, UpdatePatientSelfProfile } from 'src/types/domain/patient-portal';

import * as Yup from 'yup';
import { useMemo } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

type Props = {
  profile: PatientSelfProfile;
  saving: boolean;
  saveError: boolean;
  onSave: (payload: UpdatePatientSelfProfile) => Promise<boolean>;
};

export function PatientProfileForm({ profile, saving, saveError, onSave }: Props) {
  const { t } = useTranslation();
  const schema = useMemo(
    () =>
      Yup.object({
        phone: Yup.string().trim().required(t('patientPortal.account.validation.required')),
        profilePhoto: Yup.string().trim(),
        addressDto: Yup.object({
          street: Yup.string().trim().required(t('patientPortal.account.validation.required')),
          number: Yup.string().trim().required(t('patientPortal.account.validation.required')),
          neighborhood: Yup.string()
            .trim()
            .required(t('patientPortal.account.validation.required')),
          city: Yup.string().trim().required(t('patientPortal.account.validation.required')),
          state: Yup.string().trim().required(t('patientPortal.account.validation.required')),
          zipCode: Yup.string().trim().required(t('patientPortal.account.validation.required')),
        }),
      }),
    [t]
  );
  const formik = useFormik<UpdatePatientSelfProfile>({
    initialValues: {
      phone: profile.phone,
      profilePhoto: profile.profilePhoto,
      addressDto: profile.address,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      const ok = await onSave(values);
      if (ok) helpers.resetForm({ values });
    },
  });

  const addressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'] as const;

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2}>
        {saveError && <Alert severity="error">{t('patientPortal.account.saveError')}</Alert>}
        <TextField label={t('patientPortal.account.name')} value={profile.name ?? ''} disabled />
        <TextField label={t('patientPortal.account.email')} value={profile.email ?? ''} disabled />
        <TextField
          name="phone"
          label={t('patientPortal.account.phone')}
          value={formik.values.phone}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && formik.errors.phone}
        />
        <TextField
          name="profilePhoto"
          label={t('patientPortal.account.photo')}
          value={formik.values.profilePhoto}
          onChange={formik.handleChange}
          helperText={t('patientPortal.account.photoHint')}
        />
        <Grid container spacing={2}>
          {addressFields.map((field) => (
            <Grid key={field} size={{ xs: 12, sm: field === 'street' ? 8 : 4 }}>
              <TextField
                fullWidth
                name={`addressDto.${field}`}
                label={t(`patientPortal.account.address.${field}`)}
                value={formik.values.addressDto[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.addressDto?.[field] && formik.errors.addressDto?.[field]
                )}
                helperText={formik.touched.addressDto?.[field] && formik.errors.addressDto?.[field]}
              />
            </Grid>
          ))}
        </Grid>
        <Button
          type="submit"
          variant="contained"
          disabled={saving || formik.isSubmitting || !formik.dirty}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('actions.save')}
        </Button>
      </Stack>
    </form>
  );
}
