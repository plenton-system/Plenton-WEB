import { useTranslation } from 'react-i18next';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

// ----------------------------------------------------------------------

export function LandingFaq() {
  const { t } = useTranslation();
  const theme = useTheme();
  const faqs = [
    { q: t('landing.faq.install.q'), a: t('landing.faq.install.a') },
    { q: t('landing.faq.trial.q'), a: t('landing.faq.trial.a') },
    { q: t('landing.faq.security.q'), a: t('landing.faq.security.a') },
    { q: t('landing.faq.patientAccess.q'), a: t('landing.faq.patientAccess.a') },
    { q: t('landing.faq.cancel.q'), a: t('landing.faq.cancel.a') },
    { q: t('landing.faq.taco.q'), a: t('landing.faq.taco.a') },
  ];

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 8, md: 12 },
        scrollMarginTop: 80,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            FAQ
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            {t('landing.faq.title')}
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {faqs.map((item) => (
            <Accordion
              key={item.q}
              disableGutters
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { borderColor: 'primary.main' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{ px: 2.5, py: 1 }}
              >
                <Typography sx={{ fontWeight: 600 }}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
