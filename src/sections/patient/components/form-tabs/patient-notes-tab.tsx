import type { FormikProps } from 'formik';

import TextField from '@mui/material/TextField';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = { formik: FormikProps<PatientFormValues> };

// ----------------------------------------------------------------------

export default function PatientNotesTab({ formik }: Props) {
    return (
        <TextField
            name="notes"
            label="Observações"
            value={formik.values.notes ?? ''}
            onChange={formik.handleChange}
            fullWidth
            multiline
            minRows={4}
        />
    );
}
