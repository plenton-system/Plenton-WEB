import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useTranslation } from 'react-i18next';

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

type Props = {
  values: AnthropometryFormValues;
  onChange: <K extends keyof AnthropometryFormValues>(field: K, value: AnthropometryFormValues[K]) => void;
  disabled?: boolean;
};

export function AnthropometryFormSection({ values, onChange, disabled = false }: Props) {
  const { t } = useTranslation();
  const renderNumberField = (
    field: keyof AnthropometryFormValues,
    label: string,
    size: { xs: number; md: number } = { xs: 12, md: 4 }
  ) => (
    <Grid size={size}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={values[field]}
        onChange={(event) => onChange(field, event.target.value)}
        disabled={disabled}
      />
    </Grid>
  );

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{t('workspace.anthropometry.title')}</Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={t('workspace.anthropometry.form.evaluationDate')}
            type="datetime-local"
            value={values.evaluationDateUtc}
            onChange={(event) => onChange('evaluationDateUtc', event.target.value)}
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={t('workspace.anthropometry.form.weight')}
            type="number"
            value={values.weight}
            onChange={(event) => onChange('weight', event.target.value)}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={t('workspace.anthropometry.form.height')}
            type="number"
            value={values.height}
            onChange={(event) => onChange('height', event.target.value)}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label={t('workspace.anthropometry.form.bmi')}
            type="number"
            value={values.bmi}
            disabled
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            label={t('workspace.anthropometry.form.notes')}
            value={values.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            disabled={disabled}
            multiline
            minRows={3}
          />
        </Grid>
      </Grid>

      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">{t('workspace.anthropometry.form.circumferences')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {renderNumberField('abdominalCircumference', t('workspace.anthropometry.form.abdominal'))}
            {renderNumberField('hipCircumference', t('workspace.anthropometry.form.hip'))}
            {renderNumberField('waistCircumference', t('workspace.anthropometry.form.waist'))}
            {renderNumberField('neckCircumference', t('workspace.anthropometry.form.neck'))}
            {renderNumberField('shoulderCircumference', t('workspace.anthropometry.form.shoulder'))}
            {renderNumberField('chestCircumference', t('workspace.anthropometry.form.chest'))}
            {renderNumberField('rightRelaxedArmCircumference', t('workspace.anthropometry.form.rightRelaxedArm'))}
            {renderNumberField('leftRelaxedArmCircumference', t('workspace.anthropometry.form.leftRelaxedArm'))}
            {renderNumberField('rightFlexedArmCircumference', t('workspace.anthropometry.form.rightFlexedArm'))}
            {renderNumberField('leftFlexedArmCircumference', t('workspace.anthropometry.form.leftFlexedArm'))}
            {renderNumberField('rightForearmCircumference', t('workspace.anthropometry.form.rightForearm'))}
            {renderNumberField('leftForearmCircumference', t('workspace.anthropometry.form.leftForearm'))}
            {renderNumberField('rightWristCircumference', t('workspace.anthropometry.form.rightWrist'))}
            {renderNumberField('leftWristCircumference', t('workspace.anthropometry.form.leftWrist'))}
            {renderNumberField('rightProximalThighCircumference', t('workspace.anthropometry.form.rightProximalThigh'))}
            {renderNumberField('leftProximalThighCircumference', t('workspace.anthropometry.form.leftProximalThigh'))}
            {renderNumberField('rightThighCircumference', t('workspace.anthropometry.form.rightThigh'))}
            {renderNumberField('leftThighCircumference', t('workspace.anthropometry.form.leftThigh'))}
            {renderNumberField('rightCalfCircumference', t('workspace.anthropometry.form.rightCalf'))}
            {renderNumberField('leftCalfCircumference', t('workspace.anthropometry.form.leftCalf'))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">{t('workspace.anthropometry.form.bodyComposition')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {renderNumberField('bodyFatPercentage', t('workspace.anthropometry.form.bodyFat'))}
            {renderNumberField('musclePercentage', t('workspace.anthropometry.form.muscle'))}
            {renderNumberField('leanMass', t('workspace.anthropometry.form.leanMass'))}
            {renderNumberField('fatMass', t('workspace.anthropometry.form.fatMass'))}
            {renderNumberField('whr', t('workspace.anthropometry.form.whr'))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
