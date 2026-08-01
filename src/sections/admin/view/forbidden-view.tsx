import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

export function ForbiddenView() {
  const { t } = useTranslation();
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Box sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h1" color="error.main">
          403
        </Typography>
        <Typography variant="h4" sx={{ mt: 2 }}>
          {t('admin.forbidden.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          {t('admin.forbidden.description')}
        </Typography>
        <Button component={RouterLink} href="/dashboard" variant="contained">
          {t('admin.forbidden.back')}
        </Button>
      </Box>
    </Box>
  );
}
