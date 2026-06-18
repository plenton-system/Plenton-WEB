import type { FormikProps } from 'formik';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import * as PatientEnum from 'src/enums/patient'; // ajuste

import { maskCPF } from '../../utils/masks';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<PatientFormValues> };

// ----------------------------------------------------------------------

export default function PatientDataTab({ formik }: Props) {
    const { t } = useTranslation();

    return (
        <Stack spacing={2}>
            <TextField
                name="name"
                label={t('patient.data.name')}
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && (formik.errors.name as any)}
                fullWidth
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    name="document"
                    label={t('patient.data.document')}
                    value={formik.values.document}
                    onChange={(e) => formik.setFieldValue('document', maskCPF(e.target.value))}
                    error={formik.touched.document && Boolean(formik.errors.document)}
                    helperText={formik.touched.document && (formik.errors.document as any)}
                    sx={{ flex: 1 }}
                    slotProps={{ input: { inputProps: { maxLength: 14 } } }}
                />
                <TextField
                    name="phone"
                    label={t('patient.data.phone')}
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && (formik.errors.phone as any)}
                    sx={{ flex: 1 }}
                />
                <TextField
                    name="email"
                    label={t('patient.data.email')}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && (formik.errors.email as any)}
                    sx={{ flex: 1 }}
                />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                    name="birthDate"
                    label={t('patient.data.birthDate')}
                    type="date"
                    value={formik.values.birthDate}
                    onChange={formik.handleChange}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                    helperText={formik.touched.birthDate && (formik.errors.birthDate as any)}
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    select
                    name="gender"
                    label={t('patient.data.gender')}
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={formik.touched.gender && (formik.errors.gender as any)}
                    slotProps={{ select: { displayEmpty: true } }}
                    sx={{ flex: 1 }}
                >
                    <MenuItem value="">{t('patient.gender.select')}</MenuItem>
                    <MenuItem value={PatientEnum.Gender.Male}>{t('patient.gender.male')}</MenuItem>
                    <MenuItem value={PatientEnum.Gender.Female}>{t('patient.gender.female')}</MenuItem>
                </TextField>
            </Stack>
        </Stack>
    );
}
