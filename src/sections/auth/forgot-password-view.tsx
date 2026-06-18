import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { authService } from 'src/services';

// ----------------------------------------------------------------------

export function ForgotPasswordView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(() => t('auth.forgot.invalidEmail'))
        .required(() => t('auth.forgot.emailRequired')),
    }),
    onSubmit: async (values, helpers) => {
      setErrorMessage('');
      try {
        await authService.forgotPassword({ email: values.email.trim() });
        setSubmitted(true);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t('auth.forgot.requestError')
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <Grid
      container
      columns={{ xs: 12 }}
      sx={{
        minHeight: '80vh',
        width: '70vw',
        margin: '0 auto',
        transition: theme.transitions.create('width'),
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: theme.customShadows.z16,
        bgcolor: theme.vars.palette.background.paper,
      }}
    >
      {/* Lado esquerdo — mensagem */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          bgcolor: theme.vars.palette.primary.main,
          color: theme.vars.palette.primary.contrastText,
          // No dark, esmeralda profundo (em vez do verde neon) p/ combinar com o fundo neutro.
          ...theme.applyStyles('dark', {
            backgroundColor: '#0A2A22',
            backgroundImage: 'linear-gradient(135deg, #064E3B 0%, #0A2A22 100%)',
            color: '#FFFFFF',
          }),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: { xs: 4, md: 10 },
        }}
      >
        <Typography variant="h4" gutterBottom textAlign="center">
          {t('auth.forgot.heroTitle')}
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {t('auth.forgot.heroDescription')}
        </Typography>

        <Button
          variant="outlined"
          component={RouterLink}
          to="/sign-in"
          sx={{
            color: '#FFFFFF',
            borderColor: 'rgba(255,255,255,0.56)',
            '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          {t('auth.forgot.backToLogin')}
        </Button>
      </Grid>

      {/* Lado direito — formulário */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          color: theme.vars.palette.text.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: { xs: 4, md: 10 },
          bgcolor: theme.vars.palette.background.paper,
          minHeight: '100%',
        }}
      >
        <Paper
          elevation={0}
          square
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: theme.vars.palette.background.paper,
          }}
        >
          <Typography variant="h5" gutterBottom>
            {t('auth.forgot.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {t('auth.forgot.description')}
          </Typography>

          {submitted ? (
            <Stack spacing={2}>
              <Alert severity="success">{t('auth.forgot.success')}</Alert>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                component={RouterLink}
                to="/sign-in"
                sx={{ textTransform: 'none' }}
              >
                {t('auth.forgot.backToLogin')}
              </Button>
            </Stack>
          ) : (
            <form onSubmit={formik.handleSubmit} noValidate>
              <Stack spacing={2}>
                {errorMessage && (
                  <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
                    {errorMessage}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label={t('auth.fields.email')}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting}
                  startIcon={
                    formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
                  }
                  sx={{ textTransform: 'none' }}
                >
                  {formik.isSubmitting ? t('auth.forgot.sending') : t('auth.forgot.submit')}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/sign-in" underline="hover" variant="body2">
                    {t('auth.forgot.remembered')}
                  </Link>
                </Box>
              </Stack>
            </form>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
