import type { FastFieldProps } from 'formik';
import type { FocusEvent, ChangeEvent } from 'react';
import type { FoodGroup, FoodFormValues } from 'src/types';

import { useTranslation } from 'react-i18next';
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

const macronutrientFields = [
  { key: 'carbohydrates', labelKey: 'food.nutrients.carbohydrates' },
  { key: 'proteins', labelKey: 'food.nutrients.proteins' },
  { key: 'fats', labelKey: 'food.nutrients.fats' },
] as const satisfies ReadonlyArray<{ key: MacronutrientKey; labelKey: string }>;

const micronutrientFields = [
  { key: 'sugar', labelKey: 'food.nutrients.sugar' },
  { key: 'vitaminA', labelKey: 'food.nutrients.vitaminA' },
  { key: 'vitaminC', labelKey: 'food.nutrients.vitaminC' },
  { key: 'vitaminD', labelKey: 'food.nutrients.vitaminD' },
  { key: 'vitaminE', labelKey: 'food.nutrients.vitaminE' },
  { key: 'vitaminK', labelKey: 'food.nutrients.vitaminK' },
  { key: 'vitaminB1', labelKey: 'food.nutrients.vitaminB1' },
  { key: 'vitaminB2', labelKey: 'food.nutrients.vitaminB2' },
  { key: 'vitaminB3', labelKey: 'food.nutrients.vitaminB3' },
  { key: 'vitaminB5', labelKey: 'food.nutrients.vitaminB5' },
  { key: 'vitaminB6', labelKey: 'food.nutrients.vitaminB6' },
  { key: 'vitaminB7', labelKey: 'food.nutrients.vitaminB7' },
  { key: 'vitaminB9', labelKey: 'food.nutrients.vitaminB9' },
  { key: 'vitaminB12', labelKey: 'food.nutrients.vitaminB12' },
  { key: 'calcium', labelKey: 'food.nutrients.calcium' },
  { key: 'phosphorus', labelKey: 'food.nutrients.phosphorus' },
  { key: 'magnesium', labelKey: 'food.nutrients.magnesium' },
  { key: 'sodium', labelKey: 'food.nutrients.sodium' },
  { key: 'potassium', labelKey: 'food.nutrients.potassium' },
  { key: 'iron', labelKey: 'food.nutrients.iron' },
  { key: 'zinc', labelKey: 'food.nutrients.zinc' },
  { key: 'copper', labelKey: 'food.nutrients.copper' },
  { key: 'manganese', labelKey: 'food.nutrients.manganese' },
  { key: 'selenium', labelKey: 'food.nutrients.selenium' },
  { key: 'cholesterol', labelKey: 'food.nutrients.cholesterol' },
] as const satisfies ReadonlyArray<{ key: MicronutrientKey; labelKey: string }>;

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
  const { t } = useTranslation();
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
        setLocalError((submitError as Error)?.message ?? t('food.form.saveError'));
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
      const createdName = window.prompt(t('food.form.newGroupPrompt'))?.trim();

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
          {isEdit ? t('food.form.editTitle') : t('food.form.newTitle')}
        </Typography>
      </Box>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FastFormikTextField label={t('food.form.description')} name="description" fullWidth size="small" />

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <TextField
                  select
                  label={t('food.form.group')}
                  name="foodGroupId"
                  value={formik.values.foodGroupId ?? ''}
                  onChange={handleGroupChange}
                  onBlur={formik.handleBlur}
                  error={getFieldError('foodGroupId')}
                  helperText={getFieldHelperText('foodGroupId')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">{t('food.form.select')}</MenuItem>
                  {groupOptions.map((option) => (
                    <MenuItem key={`${option.id}-${option.name}`} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                  <MenuItem value={CREATE_NEW_GROUP_VALUE}>{t('food.form.addGroup')}</MenuItem>
                </TextField>
                <FastFormikTextField
                  label={t('food.form.portion')}
                  name="portionSize"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
              </Box>

              <Typography variant="subtitle2">{t('food.form.sections.mainMacros')}</Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
                }}
              >
                <FastFormikTextField
                  label={t('food.form.energy')}
                  name="energyKcal"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label={t('food.form.protein')}
                  name="protein"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label={t('food.form.carbs')}
                  name="carbs"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
                <FastFormikTextField
                  label={t('food.form.fat')}
                  name="fat"
                  type="number"
                  isNumber
                  fullWidth
                  size="small"
                />
              </Box>

              <Typography variant="subtitle2">{t('food.form.sections.detailedMacros')}</Typography>

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
                    label={t(field.labelKey)}
                    name={`macronutrients.${field.key}`}
                    type="number"
                    isNumber
                    fullWidth
                    size="small"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2">{t('food.form.sections.micros')}</Typography>

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
                    label={t(field.labelKey)}
                    name={`micronutrients.${field.key}`}
                    type="number"
                    isNumber
                    fullWidth
                    size="small"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2">{t('food.form.sections.homemade')}</Typography>

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
                          label={t('food.form.homemadeDesc')}
                          name={`homemadeMeasures[${index}].description`}
                          fullWidth
                          size="small"
                        />
                        <FastFormikTextField
                          label={t('food.form.homemadeGrams')}
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
                            {t('food.form.removeMeasure')}
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
                        {t('food.form.addMeasure')}
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
              {t('actions.cancel')}
            </Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : t('actions.save')}
            </Button>
          </Paper>
        </form>
      </FormikProvider>
    </>
  );
}
