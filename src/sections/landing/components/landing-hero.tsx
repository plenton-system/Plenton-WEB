import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function LandingHero() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 14 },
        background: `radial-gradient(1200px 600px at 50% -200px, ${varAlpha(
          theme.vars.palette.primary.mainChannel,
          0.18
        )}, transparent 60%)`,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Chip
            label="Plataforma para nutricionistas"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />

          <Typography variant="h2" sx={{ fontWeight: 800, maxWidth: 880, lineHeight: 1.15 }}>
            Gestão completa do seu consultório nutricional em um único lugar.
          </Typography>

          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 720, fontWeight: 400 }}>
            Cadastre pacientes, monte planos alimentares, envie anamneses, organize sua agenda e
            acompanhe a evolução — tudo integrado e pronto para usar.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Button
              size="large"
              variant="contained"
              endIcon={<Icon icon="solar:arrow-right-linear" width={20} />}
              onClick={() => navigate('/sign-in?action=register')}
              sx={{ textTransform: 'none', boxShadow: 'none', px: 4, py: 1.5 }}
            >
              Experimente grátis
            </Button>
            <Button
              size="large"
              variant="outlined"
              onClick={() => navigate('/sign-in')}
              sx={{ textTransform: 'none', px: 4, py: 1.5 }}
            >
              Já tenho conta
            </Button>
          </Stack>

          <Stack direction="row" spacing={3} sx={{ pt: 2, color: 'text.secondary' }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box component={Icon} icon="solar:check-circle-bold" sx={{ color: 'primary.main', width: 20, height: 20 }} />
              <Typography variant="body2">Sem cartão de crédito</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box component={Icon} icon="solar:check-circle-bold" sx={{ color: 'primary.main', width: 20, height: 20 }} />
              <Typography variant="body2">Cancele quando quiser</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
