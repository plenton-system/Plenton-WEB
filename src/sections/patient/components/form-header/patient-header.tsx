import type { FormikProps } from 'formik';

import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { ensureDataUrl } from 'src/utils/format-file';

import * as PatientEnum from 'src/enums/patient';

import type { PatientFormValues } from '../../../../types';

// ----------------------------------------------------------------------

type Props = {
    formik: FormikProps<PatientFormValues>;
};

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    [PatientEnum.Status.Active]: 'success',
    [PatientEnum.Status.Pending]: 'warning',
    [PatientEnum.Status.PendingPayment]: 'warning',
    [PatientEnum.Status.Inactive]: 'error',
};

function calcAge(birthDate?: string | null): number | null {
    if (!birthDate) return null;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    return age >= 0 ? age : null;
}

function InlineList({ items }: { items: string[] }) {
    if (items.length === 0) return null;
    return (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {items.join('  ·  ')}
        </Typography>
    );
}

// ----------------------------------------------------------------------

export default function PatientHeader({ formik }: Props) {
    const { t } = useTranslation();

    const GENDER_LABEL: Record<string, string> = {
        [PatientEnum.Gender.Male]: t('patient.gender.male'),
        [PatientEnum.Gender.Female]: t('patient.gender.female'),
        [PatientEnum.Gender.Other]: t('patient.gender.other'),
    };

    const STATUS_LABEL: Record<string, string> = {
        [PatientEnum.Status.Active]: t('patient.status.active'),
        [PatientEnum.Status.Pending]: t('patient.status.pending'),
        [PatientEnum.Status.PendingPayment]: t('patient.status.pendingPayment'),
        [PatientEnum.Status.Inactive]: t('patient.status.inactive'),
    };

    const photoPreview = useMemo(() => {
        const v = formik.values.profilePhoto;
        if (!v) return null;
        if (typeof v === 'string') return ensureDataUrl(v);
        if (v instanceof File) return URL.createObjectURL(v);
        return null;
    }, [formik.values.profilePhoto]);

    useEffect(() => {
        if (photoPreview?.startsWith('blob:')) return () => URL.revokeObjectURL(photoPreview);
        return undefined;
    }, [photoPreview]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) formik.setFieldValue('profilePhoto', file);
    };

    const name = formik.values.name?.trim();
    const age = calcAge(formik.values.birthDate);
    const genderValue = formik.values.gender;
    const genderLabel =
        typeof genderValue === 'string' && genderValue in GENDER_LABEL ? GENDER_LABEL[genderValue] : null;
    const statusValue = (formik.values.status as string) ?? PatientEnum.Status.Active;
    const statusLabel = STATUS_LABEL[statusValue] ?? t('patient.header.statusLabel');
    const statusColor = STATUS_COLOR[statusValue] ?? 'default';

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'center', md: 'flex-start' }}
            sx={{ mb: 3 }}
        >
            <Stack alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Avatar src={photoPreview || undefined} sx={{ width: 96, height: 96 }} />
                <Button component="label" size="small" variant="text">
                    {photoPreview ? t('patient.header.changePhoto') : t('patient.header.addPhoto')}
                    <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                </Button>
            </Stack>

            <Stack spacing={1.2} sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                    <Typography variant="h5" sx={{ minWidth: 0 }} noWrap>
                        {name || t('patient.header.newPatient')}
                    </Typography>
                    <Chip size="small" color={statusColor} label={statusLabel} />
                </Stack>

                <InlineList
                    items={[
                        age !== null ? t('patient.header.years', { count: age }) : null,
                        genderLabel,
                        formik.values.document || null,
                    ].filter((v): v is string => Boolean(v))}
                />

                <InlineList
                    items={[formik.values.email || null, formik.values.phone || null].filter(
                        (v): v is string => Boolean(v)
                    )}
                />
            </Stack>

            <Box sx={{ flexShrink: 0, alignSelf: { md: 'flex-start' }, width: { xs: '100%', md: 180 } }}>
                <TextField
                    select
                    fullWidth
                    label={t('patient.header.statusLabel')}
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    size="small"
                >
                    <MenuItem value={PatientEnum.Status.Active}>{t('patient.status.active')}</MenuItem>
                    <MenuItem value={PatientEnum.Status.Inactive}>{t('patient.status.inactive')}</MenuItem>
                </TextField>
            </Box>
        </Stack>
    );
}
