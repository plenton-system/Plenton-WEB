import { Icon } from '@iconify/react';
import { varAlpha } from 'minimal-shared/utils';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function LandingFeatures() {
  const { t } = useTranslation();
  const theme = useTheme();
  const features = [
    { icon: 'solar:users-group-rounded-bold-duotone', title: t('landing.features.patients.title'), description: t('landing.features.patients.description') },
    { icon: 'solar:clipboard-list-bold-duotone', title: t('landing.features.anamnesis.title'), description: t('landing.features.anamnesis.description') },
    { icon: 'solar:plate-bold-duotone', title: t('landing.features.mealPlans.title'), description: t('landing.features.mealPlans.description') },
    { icon: 'solar:calendar-bold-duotone', title: t('landing.features.calendar.title'), description: t('landing.features.calendar.description') },
    { icon: 'solar:database-bold-duotone', title: t('landing.features.taco.title'), description: t('landing.features.taco.description') },
    { icon: 'solar:chart-square-bold-duotone', title: t('landing.features.workspace.title'), description: t('landing.features.workspace.description') },
  ];

  return (
    <Box id="funcionalidades" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {t('landing.features.eyebrow')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            {t('landing.features.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
            {t('landing.features.description')}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  height: 1,
                  p: 3.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color']),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: `0 12px 32px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <Box component={Icon} icon={feature.icon} sx={{ width: 32, height: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
