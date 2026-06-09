import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function LandingCta() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            p: { xs: 4, md: 8 },
            borderRadius: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'primary.contrastText',
            boxShadow: `0 24px 56px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.24)}`,
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
              Pronto para profissionalizar o seu consultório?
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 640 }}>
              Comece hoje mesmo, sem custo. Você só precisa do seu e-mail.
            </Typography>
            <Button
              size="large"
              variant="contained"
              color="inherit"
              endIcon={<Icon icon="solar:arrow-right-linear" width={20} />}
              onClick={() => navigate('/sign-in?action=register')}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
                bgcolor: 'background.paper',
                color: 'primary.main',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'background.paper', opacity: 0.92 },
                // No dark o botão é escuro, então o texto/ícone ficam brancos (verde sumiria).
                ...theme.applyStyles('dark', { color: '#FFFFFF' }),
              }}
            >
              Experimente grátis
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
