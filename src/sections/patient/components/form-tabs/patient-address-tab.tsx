import type { FormikProps } from 'formik';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { useCepLookup } from 'src/shared/services/hook/useCepLookup';

import { getNestedFieldError } from '../../utils/formik';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<PatientFormValues> };

// ----------------------------------------------------------------------

export default function PatientAddressTab({ formik }: Props) {
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
          label="CEP"
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
          label="Rua"
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
          label="Bairro"
          value={formik.values.addressDto?.neighborhood}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'neighborhood')}
          helperText={getNestedFieldError(formik, 'addressDto', 'neighborhood')}
          sx={{ flex: 1 }}
        />
        <TextField
          name="addressDto.city"
          label="Cidade"
          value={formik.values.addressDto?.city}
          onChange={formik.handleChange}
          error={!!getNestedFieldError(formik, 'addressDto', 'city')}
          helperText={getNestedFieldError(formik, 'addressDto', 'city')}
          sx={{ flex: 1 }}
        />
        <TextField
          name="addressDto.state"
          label="Estado"
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
