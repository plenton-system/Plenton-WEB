import { useTranslation } from 'react-i18next';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function LandingHowItWorks() {
  const { t } = useTranslation();
  const theme = useTheme();
  const steps = [
    { number: '01', title: t('landing.how.account.title'), description: t('landing.how.account.description') },
    { number: '02', title: t('landing.how.patients.title'), description: t('landing.how.patients.description') },
    { number: '03', title: t('landing.how.care.title'), description: t('landing.how.care.description') },
  ];

  return (
    <Box
      id="como-funciona"
      sx={{
        py: { xs: 8, md: 12 },
        scrollMarginTop: 80,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {t('landing.how.eyebrow')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            {t('landing.how.title')}
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {steps.map((step) => (
            <Grid key={step.number} size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    opacity: 0.5,
                    lineHeight: 1,
                  }}
                >
                  {step.number}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {step.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {step.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
