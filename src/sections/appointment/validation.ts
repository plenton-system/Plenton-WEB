import * as Yup from 'yup';

import i18n from 'src/i18n';

// ----------------------------------------------------------------------

export const regexColor = /^#[0-9A-Fa-f]{6}$/;

// ----------------------------------------------------------------------

export const validationSchema = Yup.object({
    patientId: Yup.string().required(() => i18n.t('appointment.validation.patientRequired')),
    start: Yup.string().required(() => i18n.t('appointment.validation.dateRequired')),
    color: Yup.string().matches(regexColor, () => i18n.t('appointment.validation.colorInvalid')),
    status: Yup.string()
        .oneOf(['Scheduled', 'Completed', 'Canceled'])
        .required(() => i18n.t('appointment.validation.statusRequired')),
});
