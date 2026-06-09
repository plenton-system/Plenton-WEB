import * as Yup from 'yup';

import * as PatientEnum from 'src/enums/patient';

import type { DietPlanDto, PatientFormValues } from '../../types';

// ----------------------------------------------------------------------

export const regexCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
export const regexPhone = /^(\(?\d{2}\)?\s?)?(9?\d{4})-?\d{4}$/;
export const regexCEP = /^\d{5}-?\d{3}$/;

// ----------------------------------------------------------------------

export const dietSchema: Yup.Schema<DietPlanDto> = Yup.object({
    title: Yup.string().required('Título é obrigatório'),
    objective: Yup.string().nullable(),
    calories: Yup.number().nullable().min(0, 'Calorias inválidas'),
    startDate: Yup.string().nullable(),
    endDate: Yup.string().nullable(),
    status: Yup.string().oneOf(Object.values(PatientEnum.DietStatus)).required('Status obrigatório'),
}) as any;

// ----------------------------------------------------------------------

export const validationSchema: Yup.Schema<PatientFormValues> = Yup.object({
    name: Yup.string().required('Nome é obrigatório'),
    phone: Yup.string().matches(regexPhone, 'Telefone inválido').required('Telefone é obrigatório'),
    email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
    status: Yup.string()
        .oneOf(Object.values(PatientEnum.Status), 'Selecione o Status'),
    document: Yup.string().matches(regexCPF, 'CPF inválido').required('Documento é obrigatório'),
    birthDate: Yup.date().max(new Date(), 'Data não pode ser no futuro').required('Data é obrigatório'),
    gender: Yup.string()
        .oneOf(Object.values(PatientEnum.Gender), 'Selecione o gênero')
        .required('Gênero é obrigatório'),
    addressDto: Yup.object({
        street: Yup.string(),
        neighborhood: Yup.string(),
        city: Yup.string(),
        state: Yup.string(),
        zipCode: Yup.string().matches(regexCEP, { message: 'CEP inválido', excludeEmptyString: true }),
    }).nullable(),
    profilePhoto: Yup.mixed().nullable(),
    dietPlans: Yup.array().of(dietSchema).default([]),
    notes: Yup.string().nullable(),
}) as any;
