import * as Yup from 'yup';

// ----------------------------------------------------------------------

export const regexColor = /^#[0-9A-Fa-f]{6}$/;

// ----------------------------------------------------------------------

export const validationSchema = Yup.object({
    patientId: Yup.string().required('Selecione o paciente'),
    start: Yup.string().required('Escolha a data/hora'),
    color: Yup.string().matches(regexColor, 'Selecione uma cor válida'),
    status: Yup.string().oneOf(['Scheduled', 'Completed', 'Canceled']).required('Selecione o status'),
});