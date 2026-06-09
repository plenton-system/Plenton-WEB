import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

const STEPS = [
  {
    number: '01',
    title: 'Crie sua conta',
    description:
      'Cadastro em menos de 1 minuto. Comece o período gratuito sem informar cartão.',
  },
  {
    number: '02',
    title: 'Cadastre seus pacientes',
    description:
      'Importe dados, registre antropometria e personalize as fichas conforme sua prática.',
  },
  {
    number: '03',
    title: 'Atenda com mais agilidade',
    description:
      'Monte planos, envie anamneses e acompanhe a evolução em um único fluxo de trabalho.',
  },
];

export function LandingHowItWorks() {
  const theme = useTheme();

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
            Como funciona
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            Em 3 passos, do cadastro à primeira consulta.
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {STEPS.map((step) => (
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
