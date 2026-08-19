import type {
  EnergyCalculationGender,
  EnergyCalculationResult,
  SaveAnthropometryRequest,
  WorkspaceAnthropometryDetail,
  WorkspaceAnthropometryProtocol,
} from 'src/types';

import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { usePatientDetail } from 'src/hooks/patient/use-patient-detail';
import { useWorkspaceAnthropometryDetail } from 'src/hooks/workspace/use-workspace-anthropometry-detail';
import { useEnergyExpenditureCalculation } from 'src/hooks/workspace/use-energy-expenditure-calculation';

import { fDateTimeInput, fDateTimeUtcIso, fNowDateTimeInput } from 'src/utils/format-time';

import { Loading } from 'src/components/loading';

import { AnthropometryFormSection } from './anthropometry-form-section';
import { EnergyExpenditureSection } from './energy-expenditure-section';

type Props = {
  open: boolean;
  patientId?: string;
  evaluationId?: string | null;
  onClose: () => void;
  onSaved?: (detail: WorkspaceAnthropometryDetail) => void | Promise<void>;
};

type AnthropometryFormValues = {
  evaluationDateUtc: string;
  weight: string;
  height: string;
  bmi: string;
  bodyFatPercentage: string;
  musclePercentage: string;
  abdominalCircumference: string;
  hipCircumference: string;
  rightRelaxedArmCircumference: string;
  leftRelaxedArmCircumference: string;
  rightFlexedArmCircumference: string;
  leftFlexedArmCircumference: string;
  rightForearmCircumference: string;
  leftForearmCircumference: string;
  rightWristCircumference: string;
  leftWristCircumference: string;
  neckCircumference: string;
  shoulderCircumference: string;
  chestCircumference: string;
  waistCircumference: string;
  rightCalfCircumference: string;
  leftCalfCircumference: string;
  rightThighCircumference: string;
  leftThighCircumference: string;
  rightProximalThighCircumference: string;
  leftProximalThighCircumference: string;
  whr: string;
  leanMass: string;
  fatMass: string;
  notes: string;
};

type EnergyFormValues = {
  protocol: WorkspaceAnthropometryProtocol;
  activityFactor: string;
};

const DEFAULT_ANTHROPOMETRY_FORM: AnthropometryFormValues = {
  evaluationDateUtc: fNowDateTimeInput(),
  weight: '',
  height: '',
  bmi: '',
  bodyFatPercentage: '',
  musclePercentage: '',
  abdominalCircumference: '',
  hipCircumference: '',
  rightRelaxedArmCircumference: '',
  leftRelaxedArmCircumference: '',
  rightFlexedArmCircumference: '',
  leftFlexedArmCircumference: '',
  rightForearmCircumference: '',
  leftForearmCircumference: '',
  rightWristCircumference: '',
  leftWristCircumference: '',
  neckCircumference: '',
  shoulderCircumference: '',
  chestCircumference: '',
  waistCircumference: '',
  rightCalfCircumference: '',
  leftCalfCircumference: '',
  rightThighCircumference: '',
  leftThighCircumference: '',
  rightProximalThighCircumference: '',
  leftProximalThighCircumference: '',
  whr: '',
  leanMass: '',
  fatMass: '',
  notes: '',
};

const DEFAULT_ENERGY_FORM: EnergyFormValues = {
  protocol: 'MifflinStJeor',
  activityFactor: '1.55',
};

const toInputString = (value?: number | null, decimals?: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return decimals != null ? value.toFixed(decimals) : String(value);
};

const toNullableNumber = (value: string) => {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateBmi = (weight: string, height: string) => {
  const parsedWeight = toNullableNumber(weight);
  const parsedHeight = toNullableNumber(height);

  if (parsedWeight == null || parsedHeight == null || parsedHeight <= 0) {
    return '';
  }

  return (parsedWeight / (parsedHeight * parsedHeight)).toFixed(2);
};

const normalizeGender = (value: unknown): EnergyCalculationGender | null => {
  if (value === 0 || value === '0') return 'Male';
  if (value === 1 || value === '1') return 'Female';
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'male' || normalized === 'masculino') return 'Male';
    if (normalized === 'female' || normalized === 'feminino') return 'Female';
  }
  return null;
};

const getPatientAge = (birthDate?: string | null) => {
  if (!birthDate) return null;
  const value = dayjs(birthDate);
  if (!value.isValid()) return null;
  return dayjs().diff(value, 'year');
};

const buildAnthropometryForm = (
  detail?: WorkspaceAnthropometryDetail | null
): AnthropometryFormValues => ({
  evaluationDateUtc: detail?.evaluationDateUtc
    ? fDateTimeInput(detail.evaluationDateUtc)
    : fNowDateTimeInput(),
  weight: toInputString(detail?.weight),
  height: toInputString(detail?.height),
  bmi: toInputString(detail?.bmi),
  bodyFatPercentage: toInputString(detail?.bodyFatPercentage),
  musclePercentage: toInputString(detail?.musclePercentage),
  abdominalCircumference: toInputString(detail?.abdominalCircumference),
  hipCircumference: toInputString(detail?.hipCircumference),
  rightRelaxedArmCircumference: toInputString(detail?.rightRelaxedArmCircumference),
  leftRelaxedArmCircumference: toInputString(detail?.leftRelaxedArmCircumference),
  rightFlexedArmCircumference: toInputString(detail?.rightFlexedArmCircumference),
  leftFlexedArmCircumference: toInputString(detail?.leftFlexedArmCircumference),
  rightForearmCircumference: toInputString(detail?.rightForearmCircumference),
  leftForearmCircumference: toInputString(detail?.leftForearmCircumference),
  rightWristCircumference: toInputString(detail?.rightWristCircumference),
  leftWristCircumference: toInputString(detail?.leftWristCircumference),
  neckCircumference: toInputString(detail?.neckCircumference),
  shoulderCircumference: toInputString(detail?.shoulderCircumference),
  chestCircumference: toInputString(detail?.chestCircumference),
  waistCircumference: toInputString(detail?.waistCircumference),
  rightCalfCircumference: toInputString(detail?.rightCalfCircumference),
  leftCalfCircumference: toInputString(detail?.leftCalfCircumference),
  rightThighCircumference: toInputString(detail?.rightThighCircumference),
  leftThighCircumference: toInputString(detail?.leftThighCircumference),
  rightProximalThighCircumference: toInputString(detail?.rightProximalThighCircumference),
  leftProximalThighCircumference: toInputString(detail?.leftProximalThighCircumference),
  whr: toInputString(detail?.whr),
  leanMass: toInputString(detail?.leanMass),
  fatMass: toInputString(detail?.fatMass),
  notes: detail?.notes ?? '',
});

const buildEnergyForm = (detail?: WorkspaceAnthropometryDetail | null): EnergyFormValues => ({
  protocol: detail?.nutritionGoal?.protocol ?? DEFAULT_ENERGY_FORM.protocol,
  activityFactor: detail?.nutritionGoal?.activityFactor
    ? detail.nutritionGoal.activityFactor.toFixed(2)
    : DEFAULT_ENERGY_FORM.activityFactor,
});

const toEnergyResultFromDetail = (
  detail?: WorkspaceAnthropometryDetail | null,
  patientAgeYears?: number | null,
  patientGender?: EnergyCalculationGender | null
): EnergyCalculationResult | null => {
  if (
    !detail?.nutritionGoal ||
    !detail.weight ||
    !detail.height ||
    !patientAgeYears ||
    !patientGender
  ) {
    return null;
  }

  return {
    protocol: detail.nutritionGoal.protocol,
    weight: detail.weight,
    height: detail.height,
    ageYears: patientAgeYears,
    gender: patientGender,
    activityFactor: detail.nutritionGoal.activityFactor,
    tmbKcal: detail.nutritionGoal.tmbKcal,
    tdeeKcal: detail.nutritionGoal.tdeeKcal,
  };
};

export function WorkspaceAnthropometryDetailDrawer({
  open,
  patientId,
  evaluationId,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const patientDetail = usePatientDetail({
    id: patientId ?? null,
    autoLoad: open && Boolean(patientId),
  });
  const detail = useWorkspaceAnthropometryDetail(patientId, evaluationId, open);
  const energyCalculation = useEnergyExpenditureCalculation(patientId);
  const detailData = detail.data;
  const detailError = detail.error;
  const detailSaveError = detail.saveError;
  const detailLoading = detail.loading;
  const detailSaving = detail.saving;
  const resetDetail = detail.reset;
  const saveDetail = detail.save;
  const energyResult = energyCalculation.result;
  const energyLoading = energyCalculation.loading;
  const energyError = energyCalculation.error;
  const resetEnergyCalculation = energyCalculation.reset;
  const setEnergyResult = energyCalculation.setResult;
  const calculateEnergy = energyCalculation.calculate;

  const [anthropometryForm, setAnthropometryForm] = useState<AnthropometryFormValues>(
    DEFAULT_ANTHROPOMETRY_FORM
  );
  const [energyForm, setEnergyForm] = useState<EnergyFormValues>(DEFAULT_ENERGY_FORM);
  const [energyCalculatedAtUtc, setEnergyCalculatedAtUtc] = useState<string | null>(null);
  const [energyPersisted, setEnergyPersisted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const patientAgeYears = useMemo(
    () => getPatientAge(patientDetail.data?.birthDate),
    [patientDetail.data?.birthDate]
  );
  const patientGender = useMemo(
    () => normalizeGender(patientDetail.data?.gender),
    [patientDetail.data?.gender]
  );

  const canCalculate = Boolean(
    patientId &&
      patientAgeYears != null &&
      patientGender &&
      toNullableNumber(anthropometryForm.weight) != null &&
      toNullableNumber(anthropometryForm.height) != null &&
      toNullableNumber(energyForm.activityFactor) != null
  );

  useEffect(() => {
    if (!open) {
      setAnthropometryForm(DEFAULT_ANTHROPOMETRY_FORM);
      setEnergyForm(DEFAULT_ENERGY_FORM);
      setEnergyCalculatedAtUtc(null);
      setEnergyPersisted(false);
      setSaveSuccess(null);
      setSyncError(null);
      resetEnergyCalculation();
      resetDetail();
      return;
    }

    if (!evaluationId) {
      setAnthropometryForm(DEFAULT_ANTHROPOMETRY_FORM);
      setEnergyForm(DEFAULT_ENERGY_FORM);
      setEnergyCalculatedAtUtc(null);
      setEnergyPersisted(false);
      resetEnergyCalculation();
    }
  }, [evaluationId, open, resetDetail, resetEnergyCalculation]);

  useEffect(() => {
    if (!detailData) return;

    setAnthropometryForm(buildAnthropometryForm(detailData));
    setEnergyForm(buildEnergyForm(detailData));

    const persistedResult = toEnergyResultFromDetail(detailData, patientAgeYears, patientGender);
    setEnergyResult(persistedResult);
    setEnergyCalculatedAtUtc(detailData.nutritionGoal?.calculatedAtUtc ?? null);
    setEnergyPersisted(Boolean(detailData.nutritionGoal));
  }, [detailData, patientAgeYears, patientGender, setEnergyResult]);

  const handleAnthropometryChange = <K extends keyof AnthropometryFormValues>(
    field: K,
    value: AnthropometryFormValues[K]
  ) => {
    setAnthropometryForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'weight' || field === 'height') {
        next.bmi = calculateBmi(next.weight, next.height);
      }

      return next;
    });
  };

  const handleEnergyChange = <K extends keyof EnergyFormValues>(
    field: K,
    value: EnergyFormValues[K]
  ) => {
    setEnergyForm((prev) => ({ ...prev, [field]: value }));
    setEnergyPersisted(false);
  };

  const handleCalculate = async () => {
    if (!canCalculate || patientAgeYears == null || !patientGender) return;

    await calculateEnergy({
      weight: toNullableNumber(anthropometryForm.weight) ?? 0,
      height: toNullableNumber(anthropometryForm.height) ?? 0,
      ageYears: patientAgeYears,
      gender: patientGender,
      protocol: energyForm.protocol,
      activityFactor: toNullableNumber(energyForm.activityFactor) ?? 0,
    });

    setEnergyCalculatedAtUtc(null);
    setEnergyPersisted(false);
  };

  const buildPayload = (): SaveAnthropometryRequest => ({
    evaluationDateUtc: fDateTimeUtcIso(anthropometryForm.evaluationDateUtc),
    weight: toNullableNumber(anthropometryForm.weight),
    height: toNullableNumber(anthropometryForm.height),
    bmi: toNullableNumber(anthropometryForm.bmi),
    bodyFatPercentage: toNullableNumber(anthropometryForm.bodyFatPercentage),
    musclePercentage: toNullableNumber(anthropometryForm.musclePercentage),
    abdominalCircumference: toNullableNumber(anthropometryForm.abdominalCircumference),
    hipCircumference: toNullableNumber(anthropometryForm.hipCircumference),
    rightRelaxedArmCircumference: toNullableNumber(anthropometryForm.rightRelaxedArmCircumference),
    leftRelaxedArmCircumference: toNullableNumber(anthropometryForm.leftRelaxedArmCircumference),
    rightFlexedArmCircumference: toNullableNumber(anthropometryForm.rightFlexedArmCircumference),
    leftFlexedArmCircumference: toNullableNumber(anthropometryForm.leftFlexedArmCircumference),
    rightForearmCircumference: toNullableNumber(anthropometryForm.rightForearmCircumference),
    leftForearmCircumference: toNullableNumber(anthropometryForm.leftForearmCircumference),
    rightWristCircumference: toNullableNumber(anthropometryForm.rightWristCircumference),
    leftWristCircumference: toNullableNumber(anthropometryForm.leftWristCircumference),
    neckCircumference: toNullableNumber(anthropometryForm.neckCircumference),
    shoulderCircumference: toNullableNumber(anthropometryForm.shoulderCircumference),
    chestCircumference: toNullableNumber(anthropometryForm.chestCircumference),
    waistCircumference: toNullableNumber(anthropometryForm.waistCircumference),
    rightCalfCircumference: toNullableNumber(anthropometryForm.rightCalfCircumference),
    leftCalfCircumference: toNullableNumber(anthropometryForm.leftCalfCircumference),
    rightThighCircumference: toNullableNumber(anthropometryForm.rightThighCircumference),
    leftThighCircumference: toNullableNumber(anthropometryForm.leftThighCircumference),
    rightProximalThighCircumference: toNullableNumber(
      anthropometryForm.rightProximalThighCircumference
    ),
    leftProximalThighCircumference: toNullableNumber(
      anthropometryForm.leftProximalThighCircumference
    ),
    whr: toNullableNumber(anthropometryForm.whr),
    leanMass: toNullableNumber(anthropometryForm.leanMass),
    fatMass: toNullableNumber(anthropometryForm.fatMass),
    notes: anthropometryForm.notes.trim() || null,
    nutritionGoal: energyResult
      ? {
          protocol: energyForm.protocol,
          activityFactor: toNullableNumber(energyForm.activityFactor) ?? 0,
        }
      : null,
  });

  const handleSave = async () => {
    setSaveSuccess(null);
    setSyncError(null);

    try {
      const savedDetail = await saveDetail(buildPayload());
      const persistedResult = toEnergyResultFromDetail(savedDetail, patientAgeYears, patientGender);
      setEnergyResult(persistedResult);
      setEnergyCalculatedAtUtc(savedDetail.nutritionGoal?.calculatedAtUtc ?? null);
      setEnergyPersisted(Boolean(savedDetail.nutritionGoal));
      setSaveSuccess(t('workspace.anthropometry.saveSuccess'));

      try {
        await onSaved?.(savedDetail);
      } catch {
        setSyncError(t('workspace.anthropometry.syncError'));
      }
    } catch {
      // The detail hook exposes the localized persistence error without resetting form values.
    }
  };

  const isLoading = detailLoading || patientDetail.loading;
  const isBusy = isLoading || detailSaving || energyLoading;
  const errorMessage = detailError || patientDetail.error;

  return (
    <Dialog open={open} onClose={isBusy ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        {evaluationId ? t('workspace.anthropometry.edit') : t('workspace.anthropometry.new')}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {isLoading ? (
          <Loading inline message={t('workspace.anthropometry.loading')} />
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {detailSaveError ? <Alert severity="error">{detailSaveError}</Alert> : null}
            {saveSuccess ? (
              <Alert severity="success" role="status">
                {saveSuccess}
              </Alert>
            ) : null}
            {syncError ? (
              <Alert severity="warning" role="alert">
                {syncError}
              </Alert>
            ) : null}

            <AnthropometryFormSection
              values={anthropometryForm}
              onChange={handleAnthropometryChange}
              disabled={isBusy}
            />

            <Divider />

            <EnergyExpenditureSection
              values={energyForm}
              onChange={handleEnergyChange}
              result={energyResult}
              resultCalculatedAtUtc={energyCalculatedAtUtc}
              resultPersisted={energyPersisted}
              patientAgeYears={patientAgeYears}
              patientGender={patientGender}
              loading={energyLoading}
              disabled={isBusy}
              error={energyError}
              canCalculate={canCalculate}
              onCalculate={handleCalculate}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onClose} disabled={isBusy}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isBusy || !patientId || !anthropometryForm.evaluationDateUtc}
        >
          {detailSaving ? t('mealplan.measureDialog.saving') : t('actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
