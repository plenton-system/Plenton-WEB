import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type Props = {
  onCancel: () => void;
  onSave?: () => void;
};

// ----------------------------------------------------------------------

export function FoodFormView({ onCancel, onSave }: Props) {
  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Novo alimento</Typography>
        <TextField label="Descrição" fullWidth size="small" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Grupo" fullWidth size="small" />
          <TextField label="kcal" type="number" fullWidth size="small" />
          <TextField label="Proteína (g)" type="number" fullWidth size="small" />
          <TextField label="Carboidrato (g)" type="number" fullWidth size="small" />
          <TextField label="Gordura (g)" type="number" fullWidth size="small" />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSave}>
            Salvar
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
