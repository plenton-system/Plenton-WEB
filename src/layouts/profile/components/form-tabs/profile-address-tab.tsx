import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { useTranslation } from 'react-i18next';

import { Stack, TextField } from '@mui/material';

import { useCepLookup } from 'src/shared/services/hook/useCepLookup';

import type { ProfileFormValues } from '../../../../types';

type Props = { formik: FormikProps<ProfileFormValues> };

export default function ProfileAddressTab({ formik }: Props) {
  const { t } = useTranslation();
  const fieldError = (path: string) => getIn(formik.touched, path) && getIn(formik.errors, path);
  const { lookupCep } = useCepLookup(formik.setFieldValue);

  const handleZipCodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    formik.handleBlur(e); 
    await lookupCep(e.target.value);
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* CEP */}
        <TextField
          name="addressDto.zipCode"
          label={t('profile.fields.zipCode')}
          value={formik.values.addressDto?.zipCode ?? ''}
          onChange={formik.handleChange}
          onBlur={handleZipCodeBlur}
          error={Boolean(fieldError('addressDto.zipCode'))}
          helperText={(fieldError('addressDto.zipCode') as string) || ''}
          sx={{ width: { xs: '100%', md: '30%' } }}
          inputProps={{ maxLength: 9 }} // opcional, ex.: '99999-999'
        />

        {/* Rua/Avenida */}
        <TextField
          name="addressDto.street"
          label={t('profile.fields.street')}
          value={formik.values.addressDto?.street ?? ''}
          onChange={formik.handleChange}
          error={Boolean(fieldError('addressDto.street'))}
          helperText={(fieldError('addressDto.street') as string) || ''}
          fullWidth
        />

        <TextField
          name="addressDto.number"
          label={t('profile.fields.number')}
          value={formik.values.addressDto?.number ?? ''}
          onChange={formik.handleChange}
          error={Boolean(fieldError('addressDto.number'))}
          helperText={(fieldError('addressDto.number') as string) || ''}
          sx={{ width: { xs: '100%', md: '22%' } }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Cidade */}
        <TextField
          name="addressDto.city"
          label={t('profile.fields.city')}
          value={formik.values.addressDto?.city ?? ''}
          onChange={formik.handleChange}
          error={Boolean(fieldError('addressDto.city'))}
          helperText={(fieldError('addressDto.city') as string) || ''}
          sx={{ flex: 1 }}
        />

        {/* Bairro */}
        <TextField
          name="addressDto.neighborhood"
          label={t('profile.fields.neighborhood')}
          value={formik.values.addressDto?.neighborhood ?? ''}
          onChange={formik.handleChange}
          error={Boolean(fieldError('addressDto.neighborhood'))}
          helperText={(fieldError('addressDto.neighborhood') as string) || ''}
          sx={{ flex: 1 }}
          inputProps={{ maxLength: 64 }}
        />

        {/* Estado */}
        <TextField
          name="addressDto.state"
          label={t('profile.fields.state')}
          value={formik.values.addressDto?.state ?? ''}
          onChange={formik.handleChange}
          error={Boolean(fieldError('addressDto.state'))}
          helperText={(fieldError('addressDto.state') as string) || ''}
          sx={{ flex: 1 }}
          inputProps={{ maxLength: 2 }} // ex.: 'SP'
        />
      </Stack>
    </Stack>
  );
}
