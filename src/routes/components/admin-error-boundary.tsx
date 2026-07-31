import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export function AdminErrorBoundary() {
  const { t } = useTranslation();
  return (
    <Stack
      component="main"
      role="alert"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ minHeight: '100vh', p: 3, textAlign: 'center' }}
    >
      <Typography component="h1" variant="h4">
        {t('admin.routeError.title')}
      </Typography>
      <Alert severity="error">{t('admin.routeError.description')}</Alert>
      <Button variant="contained" onClick={() => window.location.reload()}>
        {t('admin.actions.retry')}
      </Button>
    </Stack>
  );
}
