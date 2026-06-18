import type { FormikProps } from 'formik';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useCepLookup } from 'src/shared/services/hook/useCepLookup';

import { getNestedFieldError } from '../../utils/formik';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<PatientFormValues> };

// ----------------------------------------------------------------------

export default function PatientAddressTab({ formik }: Props) {
  const { t } = useTranslation();
  const { lookupCep } = useCepLookup(formik.setFieldValue);

  const handleZipCodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    formik.handleBlur(e);
    await lookupCep(e.target.value);
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          name="addressDto.zipCode"
          label={t('patient.address.zipCode')}
          value={formik.values.addressDto?.zipCode}
          onChange={formik.handleChange}
          onBlur={handleZipCodeBlur}
          error={!!getNestedFieldError(formik, 'addressDto', 'zipCode')}
          helperText={getNestedFieldError(formik, 'addressDto', 'zipCode')}
          sx={{ width: { xs: '100%', md: '30%' } }}
          slotProps={{ input: { inputProps: { maxLength: 9 } } }}
        />
        <TextField
          name="addressDto.street"
          label={t('patient.address.street')}
          value={formik.values.addressDto?.street}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'street')}
          helperText={getNestedFieldError(formik, 'addressDto', 'street')}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          name="addressDto.neighborhood"
          label={t('patient.address.neighborhood')}
          value={formik.values.addressDto?.neighborhood}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'neighborhood')}
          helperText={getNestedFieldError(formik, 'addressDto', 'neighborhood')}
          sx={{ flex: 1 }}
        />
        <TextField
          name="addressDto.city"
          label={t('patient.address.city')}
          value={formik.values.addressDto?.city}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'city')}
          helperText={getNestedFieldError(formik, 'addressDto', 'city')}
          sx={{ flex: 1 }}
        />
        <TextField
          name="addressDto.state"
          label={t('patient.address.state')}
          value={formik.values.addressDto?.state}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'state')}
          helperText={getNestedFieldError(formik, 'addressDto', 'state')}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Stack>
  );
}
