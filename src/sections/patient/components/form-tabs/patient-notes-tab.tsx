import type { FormikProps } from 'formik';

import { useTranslation } from 'react-i18next';

import TextField from '@mui/material/TextField';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<PatientFormValues> };

// ----------------------------------------------------------------------

export default function PatientNotesTab({ formik }: Props) {
    const { t } = useTranslation();

    return (
        <TextField
            name="notes"
            label={t('patient.notes.label')}
            value={formik.values.notes ?? ''}
            onChange={formik.handleChange}
            fullWidth
            multiline
            minRows={4}
        />
    );
}
