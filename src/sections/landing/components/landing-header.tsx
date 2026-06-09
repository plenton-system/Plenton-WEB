import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { usePathname } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/common/use-auth';

import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const scrollTo = (href: string) => {
    setMobileOpen(false);

    // Fora da landing não há as seções: navega para a home levando a âncora.
    if (pathname !== '/') {
      navigate(`/${href}`);
      return;
    }

    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'saturate(180%) blur(8px)',
        }}
      >
        <Toolbar sx={{ maxWidth: 'lg', width: 1, mx: 'auto', py: 1 }}>
          <Box sx={{ flexGrow: { xs: 1, md: 0 }, mr: { md: 4 } }}>
            <Logo href="/" />
          </Box>

          {!isMobile && (
            <Stack direction="row" spacing={3} sx={{ flexGrow: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          )}

          {!isMobile && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/sign-in')}
                sx={{ textTransform: 'none' }}
              >
                Entrar
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/sign-in?action=register')}
                sx={{ textTransform: 'none', boxShadow: 'none' }}
              >
                Experimente grátis
              </Button>
            </Stack>
          )}

          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <MenuRoundedIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: 280, p: 2 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Logo />
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              fullWidth
              onClick={() => scrollTo(link.href)}
              sx={{ justifyContent: 'flex-start', color: 'text.primary', textTransform: 'none' }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/sign-in')}
            sx={{ textTransform: 'none' }}
          >
            Entrar
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/sign-in?action=register')}
            sx={{ textTransform: 'none' }}
          >
            Experimente grátis
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
