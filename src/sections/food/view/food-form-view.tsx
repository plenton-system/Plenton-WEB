import type { FastFieldProps } from 'formik';
import type { FocusEvent, ChangeEvent } from 'react';
import type { FoodGroup, FoodFormValues } from 'src/types';

import { useState, useEffect, useCallback } from 'react';
import { getIn, useFormik, FastField, FieldArray, FormikProvider } from 'formik';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

import { useFoodDetail } from 'src/hooks/food/use-food-details';

import { foodService } from 'src/services/food/foodService';

import { validationSchema } from '../validation';

// ----------------------------------------------------------------------

type Props = {
  foodId?: string | null;
  onReturn: () => void;
};

type MacronutrientKey = keyof FoodFormValues['macronutrients'];
type MicronutrientKey = keyof FoodFormValues['micronutrients'];

const macronutrientFields: Array<{ key: MacronutrientKey; label: string }> = [
  { key: 'carbohydrates', label: 'Carboidratos detalhado (g)' },
  { key: 'proteins', label: 'Proteínas detalhado (g)' },
  { key: 'fats', label: 'Gorduras detalhado (g)' },
];

const micronutrientFields: Array<{ key: MicronutrientKey; label: string }> = [
  { key: 'sugar', label: 'Açúcar (g)' },
  { key: 'vitaminA', label: 'Vitamina A (mcg)' },
  { key: 'vitaminC', label: 'Vitamina C (mg)' },
  { key: 'vitaminD', label: 'Vitamina D (mcg)' },
  { key: 'vitaminE', label: 'Vitamina E (mg)' },
  { key: 'vitaminK', label: 'Vitamina K (mcg)' },
  { key: 'vitaminB1', label: 'Vitamina B1 (mg)' },
  { key: 'vitaminB2', label: 'Vitamina B2 (mg)' },
  { key: 'vitaminB3', label: 'Vitamina B3 (mg)' },
  { key: 'vitaminB5', label: 'Vitamina B5 (mg)' },
  { key: 'vitaminB6', label: 'Vitamina B6 (mg)' },
  { key: 'vitaminB7', label: 'Vitamina B7 (mcg)' },
  { key: 'vitaminB9', label: 'Vitamina B9 (mcg)' },
  { key: 'vitaminB12', label: 'Vitamina B12 (mcg)' },
  { key: 'calcium', label: 'Cálcio (mg)' },
  { key: 'phosphorus', label: 'Fósforo (mg)' },
  { key: 'magnesium', label: 'Magnésio (mg)' },
  { key: 'sodium', label: 'Sódio (mg)' },
  { key: 'potassium', label: 'Potássio (mg)' },
  { key: 'iron', label: 'Ferro (mg)' },
  { key: 'zinc', label: 'Zinco (mg)' },
  { key: 'copper', label: 'Cobre (mg)' },
  { key: 'manganese', label: 'Manganês (mg)' },
  { key: 'selenium', label: 'Selênio (mcg)' },
  { key: 'cholesterol', label: 'Colesterol (mg)' },
];

const emptyHomemadeMeasure = {
  description: '',
  quantityInGrams: 0,
};
const CREATE_NEW_GROUP_VALUE = '__create_new_group__';
const LOCAL_GROUP_ID_PREFIX = '__local_group__';

const buildLocalGroupId = (name: string) => {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '_');
  return `${LOCAL_GROUP_ID_PREFIX}_${normalizedName}`;
};

const isLocalGroupId = (groupId: string) => groupId.startsWith(LOCAL_GROUP_ID_PREFIX);

const emptFood: FoodFormValues = {
  id: '',
  description: '',
  group: '',
  energyKcal: 0,
  carbs: 0,
  protein: 0,
  fat: 0,
  portionSize: 0,
  foodGroupId: '',
  tableType: 0,
  externalCode: '',
  macronutrients: {
    carbohydrates: 0,
    proteins: 0,
    fats: 0,
  },
  micronutrients: {
    sugar: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminB1: 0,
    vitaminB2: 0,
    vitaminB3: 0,
    vitaminB5: 0,
    vitaminB6: 0,
    vitaminB7: 0,
    vitaminB9: 0,
    vitaminB12: 0,
    calcium: 0,
    phosphorus: 0,
    magnesium: 0,
    sodium: 0,
    potassium: 0,
    iron: 0,
    zinc: 0,
    copper: 0,
    manganese: 0,
    selenium: 0,
    cholesterol: 0,
  },
  homemadeMeasures: [],
  source: 'custom',
};

type FastFormikTextFieldProps = Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'helperText'
> & {
  name: string;
  isNumber?: boolean;
};

function FastFormikTextField({ name, isNumber = false, ...props }: FastFormikTextFieldProps) {
  const { onFocus, ...restProps } = props;

  return (
    <FastField name={name}>
      {({ field, meta, form }: FastFieldProps<unknown>) => {
        const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          if (!isNumber) {
            field.onChange(event);
            return;
          }

          const rawValue = event.target.value;
          const parsedValue = rawValue === '' ? 0 : Number(rawValue);
          form.setFieldValue(name, Number.isNaN(parsedValue) ? 0 : parsedValue);
        };

        const handleFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          if (isNumber && Number(field.value ?? 0) === 0) {
            event.target.select();
          }

          onFocus?.(event as FocusEvent<HTMLInputElement>);
        };

        const currentValue = (field.value ?? (isNumber ? 0 : '')) as string | number;

        return (
          <TextField
            {...restProps}
            {...field}
            name={name}
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={field.onBlur}
            error={Boolean(meta.touched && meta.error)}
            helperText={meta.touched && typeof meta.error === 'string' ? meta.error : ''}
          />
        );
      }}
    </FastField>
  );
}

export function FoodFormView({ foodId, onReturn }: Props) {
  const isEdit = !!foodId;

  const { data, loading, error, createOrUpdate } = useFoodDetail({
    id: foodId ?? null,
    autoLoad: !!foodId,
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<FoodFormValues>(emptFood);
  const [groupOptions, setGroupOptions] = useState<FoodGroup[]>([]);

  const ensureGroupOption = useCallback((groupName: string, groupId: string = '') => {
    if (!groupName) return;

    setGroupOptions((prev) => {
      const alreadyExists = prev.some(
        (option) => option.name.toLowerCase() === groupName.toLowerCase()
      );

      if (alreadyExists) {
        return prev;
      }

      return [{ id: groupId || buildLocalGroupId(groupName), name: groupName }, ...prev];
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadFoodGroups = async () => {
      try {
        const groups = await foodService.getFoodGroups();
        if (!active) return;

        setGroupOptions(
          groups
            .filter((group) => group?.name)
            .map((group) => ({
              id: group.id || buildLocalGroupId(group.name),
              name: group.name,
            }))
        );
      } catch {
        // Mantém o formulário funcional mesmo sem carregar grupos.
      }
    };

    void loadFoodGroups();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (data) {
      const sourceFromTableType = data.tableType === 1 ? 'taco' : 'custom';
      const normalizedGroupId =
        data.foodGroupId || (data.group ? buildLocalGroupId(data.group) : '');
      const measures =
        data.homemadeMeasures?.length && data.homemadeMeasures.length > 0
          ? data.homemadeMeasures.map((measure) => ({
              description: measure?.description ?? '',
              quantityInGrams: measure?.quantityInGrams ?? 0,
            }))
          : [];

      setInitialValues({
        ...emptFood,
        ...data,
        group: data.group || '',
        energyKcal: data.energyKcal || 0,
        carbs: data.carbs ?? data.macronutrients?.carbohydrates ?? 0,
        protein: data.protein ?? data.macronutrients?.proteins ?? 0,
        fat: data.fat ?? data.macronutrients?.fats ?? 0,
        foodGroupId: normalizedGroupId,
        source: data.source ?? sourceFromTableType,
        tableType: data.tableType ?? (data.source === 'taco' ? 1 : 0),
        macronutrients: {
          carbohydrates: data.macronutrients?.carbohydrates ?? data.carbs ?? 0,
          proteins: data.macronutrients?.proteins ?? data.protein ?? 0,
          fats: data.macronutrients?.fats ?? data.fat ?? 0,
        },
        micronutrients: {
          ...emptFood.micronutrients,
          ...data.micronutrients,
        },
        homemadeMeasures: measures,
      });

      ensureGroupOption(data.group ?? '', normalizedGroupId);
    }
  }, [data, ensureGroupOption]);

  const formik = useFormik<FoodFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setLocalError(null);

      const source = values.tableType === 1 ? 'taco' : 'custom';
      const payload: FoodFormValues = {
        ...values,
        foodGroupId: isLocalGroupId(values.foodGroupId) ? '' : values.foodGroupId,
        source,
      };

      try {
        const result = await createOrUpdate(payload);
        if (result) onReturn();
      } catch (submitError) {
        setLocalError((submitError as Error)?.message ?? 'Erro ao salvar alimento');
      }
    },
  });

  const getFieldError = (field: string) =>
    Boolean(getIn(formik.touched, field) && getIn(formik.errors, field));

  const getFieldHelperText = (field: string) => {
    const touched = getIn(formik.touched, field);
    const currentError = getIn(formik.errors, field);
    return touched && typeof currentError === 'string' ? currentError : '';
  };

  const handleGroupChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const selectedId = event.target.value;

    if (selectedId === CREATE_NEW_GROUP_VALUE) {
      const createdName = window.prompt('Digite o nome do novo grupo alimentar:')?.trim();

      if (!createdName) return;

      const createdLocalId = buildLocalGroupId(createdName);
      ensureGroupOption(createdName, createdLocalId);
      formik.setFieldValue('foodGroupId', createdLocalId);
      formik.setFieldValue('group', createdName);
      return;
    }

    const selectedOption = groupOptions.find((option) => option.id === selectedId);
    formik.setFieldValue('foodGroupId', selectedId);
    formik.setFieldValue('group', selectedOption?.name ?? '');
  };

  return (
    <>
      {(error || localError) && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {localError ?? error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {isEdit ? 'Editar alimento' : 'Novo alimento'}
        </Typography>
      </Box>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FastFormikTextField label="Descrição" name="description" fullWidth size="small" />

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <TextField
                  select
                  label="Grupo alimentar"
                  name="foodGroupId"
                  value={formik.values.foodGroupId ?? ''}
                  onChange={handleGroupChange}
                  onBlur={formik.handleBlur}
                  error={getFieldError('foodGroupId')}
                  helperText={getFieldHelperText('foodGroupId')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {groupOptions.map((option) => (
                    <MenuItem key={`${option.id}-${option.name}`} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                  <MenuItem value={CREATE_NEW_GROUP_VALUE}>+ Adicionar novo grupo...</MenuItem>
                </TextField>
                <FastFormikTextField
                  label="Porção (g)"
                  name="portionSize"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
              </Box>

              <Typography variant="subtitle2">Macronutrientes principais</Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
                }}
              >
                <FastFormikTextField
                  label="Energia (kcal)"
                  name="energyKcal"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label="Proteína (g)"
                  name="protein"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label="Carboidrato (g)"
                  name="carbs"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label="Gordura (g)"
                  name="fat"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
              </Box>

              <Typography variant="subtitle2">Macronutrientes detalhados</Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {macronutrientFields.map((field) => (
                  <FastFormikTextField
                    key={field.key}
                    label={field.label}
                    name={`macronutrients.${field.key}`}
                    type="number"
                    isNumber
                    fullWidth
                    size="small"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2">Micronutrientes</Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                }}
              >
                {micronutrientFields.map((field) => (
                  <FastFormikTextField
                    key={field.key}
                    label={field.label}
                    name={`micronutrients.${field.key}`}
                    type="number"
                    isNumber
                    fullWidth
                    size="small"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2">Medidas caseiras</Typography>

              <FieldArray
                name="homemadeMeasures"
                render={(arrayHelpers) => (
                  <Stack spacing={2}>
                    {formik.values.homemadeMeasures.map((_, index) => (
                      <Box
                        key={`homemade-measure-${index}`}
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        }}
                      >
                        <FastFormikTextField
                          label="Descrição da medida caseira"
                          name={`homemadeMeasures[${index}].description`}
                          fullWidth
                          size="small"
                        />
                        <FastFormikTextField
                          label="Quantidade em gramas"
                          name={`homemadeMeasures[${index}].quantityInGrams`}
                          type="number"
                          isNumber
                          fullWidth
                          size="small"
                        />
                        <Box
                          sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}
                        >
                          <Button
                            type="button"
                            variant="text"
                            color="error"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            Remover
                          </Button>
                        </Box>
                      </Box>
                    ))}

                    <Box>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => arrayHelpers.push({ ...emptyHomemadeMeasure })}
                      >
                        Adicionar medida caseira
                      </Button>
                    </Box>
                  </Stack>
                )}
              />
            </Stack>
          </Card>

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
            <Button variant="outlined" onClick={onReturn} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </Paper>
        </form>
      </FormikProvider>
    </>
  );
}
