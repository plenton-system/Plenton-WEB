import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

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
        <Typography variant="subtitle1">Antropometria</Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Data da avaliação"
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
            label="Peso (kg)"
            type="number"
            value={values.weight}
            onChange={(event) => onChange('weight', event.target.value)}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="Altura (m)"
            type="number"
            value={values.height}
            onChange={(event) => onChange('height', event.target.value)}
            disabled={disabled}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            label="IMC"
            type="number"
            value={values.bmi}
            disabled
            slotProps={{ input: { readOnly: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            label="Observações"
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
          <Typography variant="subtitle2">Circunferências</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {renderNumberField('abdominalCircumference', 'Circ. abdominal (cm)')}
            {renderNumberField('hipCircumference', 'Circ. quadril (cm)')}
            {renderNumberField('waistCircumference', 'Circ. cintura (cm)')}
            {renderNumberField('neckCircumference', 'Circ. pescoço (cm)')}
            {renderNumberField('shoulderCircumference', 'Circ. ombros (cm)')}
            {renderNumberField('chestCircumference', 'Circ. tórax (cm)')}
            {renderNumberField('rightRelaxedArmCircumference', 'Braço relaxado direito (cm)')}
            {renderNumberField('leftRelaxedArmCircumference', 'Braço relaxado esquerdo (cm)')}
            {renderNumberField('rightFlexedArmCircumference', 'Braço flexionado direito (cm)')}
            {renderNumberField('leftFlexedArmCircumference', 'Braço flexionado esquerdo (cm)')}
            {renderNumberField('rightForearmCircumference', 'Antebraço direito (cm)')}
            {renderNumberField('leftForearmCircumference', 'Antebraço esquerdo (cm)')}
            {renderNumberField('rightWristCircumference', 'Punho direito (cm)')}
            {renderNumberField('leftWristCircumference', 'Punho esquerdo (cm)')}
            {renderNumberField('rightProximalThighCircumference', 'Coxa proximal direita (cm)')}
            {renderNumberField('leftProximalThighCircumference', 'Coxa proximal esquerda (cm)')}
            {renderNumberField('rightThighCircumference', 'Coxa direita (cm)')}
            {renderNumberField('leftThighCircumference', 'Coxa esquerda (cm)')}
            {renderNumberField('rightCalfCircumference', 'Panturrilha direita (cm)')}
            {renderNumberField('leftCalfCircumference', 'Panturrilha esquerda (cm)')}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Composição corporal</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {renderNumberField('bodyFatPercentage', 'Gordura corporal (%)')}
            {renderNumberField('musclePercentage', 'Músculo (%)')}
            {renderNumberField('leanMass', 'Massa magra (kg)')}
            {renderNumberField('fatMass', 'Massa gorda (kg)')}
            {renderNumberField('whr', 'WHR')}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
