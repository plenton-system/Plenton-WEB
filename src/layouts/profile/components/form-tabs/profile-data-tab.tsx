import type { FormikProps } from 'formik';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react/dist/iconify.js';

import Button from '@mui/material/Button';
import { Stack, Avatar } from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { maskCpfCnpjLive, maskPhoneNumber } from 'src/sections/patient/utils/masks';

import type { ProfileFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<ProfileFormValues> };
type EditableField = 'email' | 'document';

// ----------------------------------------------------------------------

export default function ProfileDataTab({ formik }: Props) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState<Record<EditableField, boolean>>({
    email: false,
    document: false,
  });

  function startEdit(field: EditableField) {
    return setIsEditing((prev) => ({ ...prev, [field]: true }));
  }
  function saveEdit(field: EditableField) {
    return setIsEditing((prev) => ({ ...prev, [field]: false }));
  }

  return (
    <Stack spacing={2}>
      {/*Foto*/}
      <Stack direction="row" spacing={2} alignItems="center" mb={3} sx={{ flex: 1 }}>
        <Avatar src={formik.values.photo} alt={formik.values.name} sx={{ width: 80, height: 80, mr: 2 }} />
        <Button component="label" variant="outlined">
          {t('profile.photo')}
          <input type="file" accept="image/*" hidden />
        </Button>
      </Stack>
      {/*Nome completo*/}
      <TextField
        name="name"
        label={t('profile.fields.name')}
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && (formik.errors.name as any)}
        fullWidth
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/*E-mail*/}
        <TextField
          name="email"
          label={t('profile.fields.email')}
          disabled={!isEditing.email}
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && (formik.errors.email as any)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {!isEditing.email ? (
                    <Icon
                      icon="mdi:pencil"
                      width={20}
                      cursor="pointer"
                      onClick={() => startEdit('email')}
                    />
                  ) : (
                    <Icon
                      icon="mdi:check"
                      color="#7d974c"
                      width={20}
                      cursor="pointer"
                      onClick={() => saveEdit('email')}
                    />
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/*documento*/}
        <TextField
          name="document"
          label={t('profile.fields.document')}
          disabled={!isEditing.document}
          value={formik.values.document}
          onChange={(e) => formik.setFieldValue('document', maskCpfCnpjLive(e.target.value))}
          error={formik.touched.document && Boolean(formik.errors.document)}
          helperText={formik.touched.document && (formik.errors.document as any)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              inputProps: { maxLength: 14 },
              endAdornment: (
                <InputAdornment position="end">
                  {!isEditing.document ? (
                    <Icon
                      icon="mdi:pencil"
                      width={20}
                      cursor="pointer"
                      onClick={() => startEdit('document')}
                    />
                  ) : (
                    <Icon
                      icon="mdi:check"
                      width={20}
                      cursor="pointer"
                      onClick={() => saveEdit('document')}
                    />
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
        {/*Celular*/}
        <TextField
          name="phone"
          label={t('profile.fields.phone')}
          value={formik.values.phone}
          onChange={(e) => formik.setFieldValue('phone', maskPhoneNumber(e.target.value))}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
          helperText={formik.touched.phone && (formik.errors.phone as any)}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Stack>
  );
}
