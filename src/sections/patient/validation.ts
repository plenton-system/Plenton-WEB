import * as Yup from 'yup';

import i18n from 'src/i18n';
import * as PatientEnum from 'src/enums/patient';

import type { DietPlanDto, PatientFormValues } from '../../types';

// ----------------------------------------------------------------------

export const regexCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
export const regexPhone = /^(\(?\d{2}\)?\s?)?(9?\d{4})-?\d{4}$/;
export const regexCEP = /^\d{5}-?\d{3}$/;

// ----------------------------------------------------------------------

export const dietSchema: Yup.Schema<DietPlanDto> = Yup.object({
    title: Yup.string().required(() => i18n.t('validation.titleRequired')),
    objective: Yup.string().nullable(),
    calories: Yup.number()
        .nullable()
        .min(0, () => i18n.t('patient.validation.caloriesInvalid')),
    startDate: Yup.string().nullable(),
    endDate: Yup.string().nullable(),
    status: Yup.string()
        .oneOf(Object.values(PatientEnum.DietStatus))
        .required(() => i18n.t('validation.statusRequired')),
}) as any;

// ----------------------------------------------------------------------

export const validationSchema: Yup.Schema<PatientFormValues> = Yup.object({
    name: Yup.string().required(() => i18n.t('validation.nameRequired')),
    phone: Yup.string()
        .matches(regexPhone, () => i18n.t('validation.phoneInvalid'))
        .required(() => i18n.t('validation.phoneRequired')),
    email: Yup.string()
        .email(() => i18n.t('validation.emailInvalid'))
        .required(() => i18n.t('validation.emailRequired')),
    status: Yup.string()
        .oneOf(Object.values(PatientEnum.Status), () => i18n.t('validation.statusInvalid')),
    document: Yup.string()
        .matches(regexCPF, () => i18n.t('patient.validation.documentInvalid'))
        .required(() => i18n.t('validation.documentRequired')),
    birthDate: Yup.date()
        .max(new Date(), () => i18n.t('patient.validation.futureDate'))
        .required(() => i18n.t('validation.dateRequired')),
    gender: Yup.string()
        .oneOf(Object.values(PatientEnum.Gender), () => i18n.t('patient.validation.genderInvalid'))
        .required(() => i18n.t('patient.validation.genderRequired')),
    addressDto: Yup.object({
        street: Yup.string(),
        neighborhood: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        zipCode: Yup.string().matches(regexCEP, {
            message: () => i18n.t('validation.zipCodeInvalid'),
            excludeEmptyString: true,
        }),
    }).nullable(),
    profilePhoto: Yup.mixed().nullable(),
    dietPlans: Yup.array().of(dietSchema).default([]),
    notes: Yup.string().nullable(),
}) as any;
