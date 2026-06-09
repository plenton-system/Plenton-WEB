import type * as Yup from 'yup';

import { useMemo, useEffect } from 'react';
import { useFormik, FieldArray, FormikProvider } from 'formik';

import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { authStorage } from 'src/utils/auth-storage';

import { planSchema } from '../validation';
import { normalizePayload } from '../normalize';
import { MealPlanStatus } from '../../../types';
import MealsSection from '../components/meals/meals-section';
import { DAYS, DEFAULT_STATUS_OPTIONS } from '../../../constants/meal-plans';

import type { MealDto, MealPlanDto, StatusOption } from '../../../types';

// ----------------------------------------------------------------------

type MealPlanFormProps = {
    patientId: string;
    initial?: Partial<MealPlanDto>;
    statusOptions?: StatusOption[];
    onSubmit: (payload: MealPlanDto) => Promise<void | boolean> | void;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
};

// ----------------------------------------------------------------------

export function MealPlanForm({
    patientId,
    initial,
    statusOptions = DEFAULT_STATUS_OPTIONS,
    onSubmit,
    onCancel,
    loading,
    error,
}: MealPlanFormProps) {
    const nutritionistId = authStorage.getUser()?.profile?.id ?? '';

    const initialValues = useMemo<MealPlanDto>(() => {
        const emptyPlan: MealPlanDto = {
            name: '',
            status: MealPlanStatus.ACTIVE,
            daysOfWeek: DAYS.map((d) => d.value),
            nutritionistId,
            patientId,
            meals: [],
        };

        return {
        ...emptyPlan,
        ...initial,
        nutritionistId: initial?.nutritionistId ?? nutritionistId,
        patientId: initial?.patientId ?? patientId,
        daysOfWeek: initial?.daysOfWeek ?? emptyPlan.daysOfWeek,
        meals: (initial?.meals as MealDto[]) ?? [],
        status: toMealPlanStatus(initial?.status),
        };
    }, [initial, nutritionistId, patientId]);

    const formik = useFormik<MealPlanDto>({
        initialValues,
        enableReinitialize: true,
        validationSchema: planSchema as unknown as Yup.Schema<MealPlanDto>,
        onSubmit: async (values) => {
            try {
                const normalized = normalizePayload(values);
                await onSubmit(normalized);
            } catch (err) {
                console.error('Error during form submission:', err);
                formik.setStatus(err instanceof Error ? err.message : 'Erro ao salvar o plano');
            }
        },
    });

    useEffect(() => {
        if (Object.keys(formik.errors).length > 0 && formik.submitCount > 0) {
            console.error('Formik validation errors:', formik.errors);
        }
    }, [formik.errors, formik.submitCount]);

    const dayAllSelected = DAYS.every((d) => formik.values.daysOfWeek.includes(d.value));

    const hasErrors = Object.keys(formik.errors).length > 0 && formik.submitCount > 0;

    const renderErrors = () => {
        if (!hasErrors) return null;
        
        // Se houver erro no array de refeições, mostrar aviso geral
        if (formik.errors.meals) {
            return (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Existem erros nas refeições ou itens. Verifique se todos os campos obrigatórios estão preenchidos.
                </Alert>
            );
        }

        return null;
    };

    return (
        <FormikProvider value={formik}>
            <form onSubmit={formik.handleSubmit}>
                {(error || formik.status) && (
                    <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {formik.status ?? error}
                    </Alert>
                )}

                {renderErrors()}

                <Card sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Nome do plano"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && (formik.errors.name as any)}
                            fullWidth
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                select
                                label="Status"
                                name="status"
                                value={formik.values.status}
                                onChange={(event) =>
                                    formik.setFieldValue('status', toMealPlanStatus(event.target.value))
                                }
                                sx={{ width: { xs: '100%', sm: 300 } }}
                            >
                                {statusOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <FormControl component="fieldset" fullWidth sx={{ flex: 1 }}>
                                <FormLabel component="legend" id="days-label" sx={{ mb: 1 }}>
                                    Dias da semana
                                </FormLabel>

                                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                    <Button
                                        type="button"
                                        size="small"
                                        variant="outlined"
                                        onClick={() =>
                                            formik.setFieldValue(
                                                'daysOfWeek',
                                                dayAllSelected ? [] : DAYS.map((d) => d.value)
                                            )
                                        }
                                        aria-controls="days-group"
                                        aria-label={dayAllSelected ? 'Limpar todos os dias' : 'Selecionar todos os dias'}
                                    >
                                        Todos
                                    </Button>

                                    <ToggleButtonGroup
                                        id="days-group"
                                        aria-labelledby="days-label"
                                        aria-multiselectable
                                        value={formik.values.daysOfWeek}
                                        onChange={(_, newValues: number[] | null) =>
                                            formik.setFieldValue('daysOfWeek', (newValues ?? []).sort())
                                        }
                                        size="small"
                                        sx={{
                                            flexWrap: 'wrap',
                                            gap: 1,
                                            '& .MuiToggleButton-root': {
                                                minWidth: 56,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                textTransform: 'none',
                                            },
                                            '& .MuiToggleButton-root.Mui-selected': {
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                            },
                                            '& .MuiToggleButton-root.Mui-selected:hover': {
                                                bgcolor: 'primary.dark',
                                            },
                                        }}
                                    >
                                        {DAYS.map((d) => (
                                            <ToggleButton key={d.value} value={d.value} color="primary" aria-label={d.label}>
                                                {d.label}
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Stack>

                                {formik.touched.daysOfWeek && formik.errors.daysOfWeek && (
                                    <FormHelperText error>{formik.errors.daysOfWeek as any}</FormHelperText>
                                )}
                            </FormControl>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    {/* Lista de Refeições */}
                    <FieldArray
                        name="meals"
                        render={(helpers) => (
                            <MealsSection
                                meals={formik.values.meals}
                                onAdd={(m) => helpers.push(m)}
                                onEdit={(idx, m) => helpers.replace(idx, m)}
                                onRemove={(idx) => helpers.remove(idx)}
                            />
                        )}
                    />
                </Card>

                {/* Barra de ações fixa */}
                <Paper
                    elevation={3}
                    sx={{
                        position: 'sticky',
                        bottom: 0,
                        mt: 2,
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        zIndex: 6,
                    }}
                >
                    <Button variant="outlined" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="contained" type="submit" disabled={loading}>
                        {loading ? <CircularProgress size={22} /> : 'Salvar Plano'}
                    </Button>
                </Paper>
            </form>
        </FormikProvider>
    );
}

const toMealPlanStatus = (status: unknown): MealPlanStatus => {
    if (typeof status === 'number') {
        if (status === MealPlanStatus.ACTIVE) return MealPlanStatus.ACTIVE;
        if (status === MealPlanStatus.INACTIVE) return MealPlanStatus.INACTIVE;
        if (status === MealPlanStatus.SUSPENDED) return MealPlanStatus.SUSPENDED;
        return MealPlanStatus.ACTIVE;
    }

    if (typeof status === 'string') {
        const normalized = status.trim().toUpperCase();

        if (normalized === 'ACTIVE') return MealPlanStatus.ACTIVE;
        if (normalized === 'INACTIVE') return MealPlanStatus.INACTIVE;
        if (normalized === 'SUSPENDED') return MealPlanStatus.SUSPENDED;

        const numericValue = Number(normalized);
        if (!Number.isNaN(numericValue)) return toMealPlanStatus(numericValue);
    }

    return MealPlanStatus.ACTIVE;
};
