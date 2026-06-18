import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">{t('food.form.newTitle')}</Typography>
        <TextField label={t('food.form.description')} fullWidth size="small" />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label={t('food.form.groupSimple')} fullWidth size="small" />
          <TextField label={t('food.form.kcal')} type="number" fullWidth size="small" />
          <TextField label={t('food.form.protein')} type="number" fullWidth size="small" />
          <TextField label={t('food.form.carbs')} type="number" fullWidth size="small" />
          <TextField label={t('food.form.fat')} type="number" fullWidth size="small" />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button variant="contained" onClick={onSave}>
            {t('actions.save')}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
