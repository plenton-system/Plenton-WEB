import type { ReactNode } from 'react';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { LandingHeader } from 'src/sections/landing/components/landing-header';
import { LandingFooter } from 'src/sections/landing/components/landing-footer';

// ----------------------------------------------------------------------

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function PublicPageLayout({ eyebrow, title, description, children }: Props) {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingHeader />

      <Box
        component="section"
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 4, md: 6 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `radial-gradient(1200px 480px at 50% -200px, ${varAlpha(
            theme.vars.palette.primary.mainChannel,
            0.16
          )}, transparent 60%)`,
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2}>
            {eyebrow && (
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {eyebrow}
              </Typography>
            )}
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 680 }}>
                {description}
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      <Box component="main" sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">{children}</Container>
      </Box>

      <LandingFooter />
    </Box>
  );
}
