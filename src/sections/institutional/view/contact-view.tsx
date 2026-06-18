import type { FormEvent } from 'react';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { varAlpha } from 'minimal-shared/utils';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

import { PublicPageLayout } from '../components/public-page-layout';

// ----------------------------------------------------------------------

function buildMailtoHref(
  values: { name: string; email: string; subject: string; message: string },
  copy: { defaultSubject: string; name: string; email: string }
) {
  const subject = values.subject.trim() || copy.defaultSubject;
  const body = [
    copy.name,
    copy.email,
    '',
    values.message.trim(),
  ].join('\n');

  return `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (field: keyof typeof values) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = buildMailtoHref(values, {
      defaultSubject: t('institutional.contact.defaultSubject', { name: values.name.trim() }),
      name: t('institutional.contact.mailName', { name: values.name.trim() }),
      email: t('institutional.contact.mailEmail', { email: values.email.trim() }),
    });
  };

  return (
    <PublicPageLayout
      eyebrow={t('institutional.contact.eyebrow')}
      title={t('institutional.contact.title')}
      description={t('institutional.contact.description', { appName: CONFIG.appName })}
    >
      <Grid container spacing={{ xs: 4, md: 6 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                    color: 'primary.main',
                  }}
                >
                  <Box component={Icon} icon="solar:letter-bold-duotone" sx={{ width: 26, height: 26 }} />
                </Box>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('institutional.contact.email')}
                  </Typography>
                  <Link
                    href={`mailto:${CONFIG.contactEmail}`}
                    underline="hover"
                    sx={{ color: 'primary.main', fontWeight: 600, wordBreak: 'break-all' }}
                  >
                    {CONFIG.contactEmail}
                  </Link>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t('institutional.contact.responseTime')}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
              {t('institutional.contact.instructions')}{' '}
              <Link href={`mailto:${CONFIG.contactEmail}`} underline="hover">
                {CONFIG.contactEmail}
              </Link>
              .
            </Typography>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                label={t('institutional.contact.name')}
                value={values.name}
                onChange={handleChange('name')}
                autoComplete="name"
              />
              <TextField
                required
                fullWidth
                type="email"
                label={t('institutional.contact.email')}
                value={values.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
              <TextField
                fullWidth
                label={t('institutional.contact.subject')}
                value={values.subject}
                onChange={handleChange('subject')}
              />
              <TextField
                required
                fullWidth
                multiline
                minRows={5}
                label={t('institutional.contact.message')}
                value={values.message}
                onChange={handleChange('message')}
              />
              <Button
                type="submit"
                size="large"
                variant="contained"
                endIcon={<Icon icon="solar:arrow-right-linear" width={20} />}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', boxShadow: 'none', px: 4 }}
              >
                {t('institutional.contact.send')}
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </PublicPageLayout>
  );
}
