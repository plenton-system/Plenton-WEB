import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

const SOCIAL_ICONS = [
  { icon: 'mdi:instagram', label: 'Instagram', href: '#' },
  { icon: 'mdi:linkedin', label: 'LinkedIn', href: '#' },
  { icon: 'mdi:youtube', label: 'YouTube', href: '#' },
];

export function LandingFooter() {
  const { t } = useTranslation();
  const theme = useTheme();
  const footerLinks = [
    {
      title: t('landing.footer.product'),
      items: [
        { label: t('landing.nav.features'), href: '#funcionalidades' },
        { label: t('landing.nav.howItWorks'), href: '#como-funciona' },
        { label: t('landing.nav.plans'), href: '#planos' },
        { label: t('landing.nav.faq'), href: '#faq' },
      ],
    },
    {
      title: t('landing.footer.account'),
      items: [
        { label: t('landing.nav.signIn'), href: '/sign-in' },
        { label: t('landing.nav.tryFree'), href: '/sign-in?action=register' },
      ],
    },
    {
      title: t('landing.footer.support'),
      items: [
        { label: t('landing.footer.contact'), href: '/contato' },
        { label: t('landing.footer.privacy'), href: '/privacidade' },
        { label: t('landing.footer.terms'), href: '/termos' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 6, md: 8 },
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Logo isSingle />
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
                {t('landing.footer.description')}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                {SOCIAL_ICONS.map((s) => (
                  <IconButton
                    key={s.label}
                    component="a"
                    href={s.href}
                    aria-label={s.label}
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Box component={Icon} icon={s.icon} sx={{ width: 20, height: 20 }} />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {footerLinks.map((group) => (
            <Grid key={group.title} size={{ xs: 6, sm: 4, md: 2.6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {group.title}
              </Typography>
              <Stack spacing={1}>
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    underline="none"
                    sx={{
                      color: 'text.secondary',
                      fontSize: 14,
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('landing.footer.rights', { year: new Date().getFullYear() })}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {t('landing.footer.care')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
