import { Icon } from '@iconify/react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Pacientes',
    description: 'Prontuário completo, antropometria, fotos e histórico clínico em um só lugar.',
  },
  {
    icon: 'solar:clipboard-list-bold-duotone',
    title: 'Anamneses',
    description: 'Crie templates personalizados e envie um link público para o paciente responder.',
  },
  {
    icon: 'solar:plate-bold-duotone',
    title: 'Planos alimentares',
    description: 'Refeições, itens, substitutos, medidas caseiras e cálculo automático de macros.',
  },
  {
    icon: 'solar:calendar-bold-duotone',
    title: 'Agenda',
    description: 'Marque consultas, controle status, evite conflitos e visualize tudo no calendário.',
  },
  {
    icon: 'solar:database-bold-duotone',
    title: 'Catálogo TACO',
    description: 'Base oficial brasileira de alimentos já importada e pronta para usar.',
  },
  {
    icon: 'solar:chart-square-bold-duotone',
    title: 'Workspace',
    description: 'Visão consolidada por paciente: próxima consulta, plano, antropometria e envios.',
  },
];

export function LandingFeatures() {
  const theme = useTheme();

  return (
    <Box id="funcionalidades" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            Funcionalidades
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            Tudo que você precisa para atender bem.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
            Os módulos foram pensados para a rotina real do nutricionista — sem firulas e sem
            burocracia.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
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
