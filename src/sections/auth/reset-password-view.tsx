import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { authService } from 'src/services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ResetPasswordView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const linkInvalid = !email || !token;

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string().required(() => t('auth.reset.newRequired')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], () => t('auth.reset.passwordMismatch'))
        .required(() => t('auth.reset.confirmRequired')),
    }),
    onSubmit: async (values, helpers) => {
      setErrorMessage('');
      try {
        await authService.resetPassword({ email, token, newPassword: values.newPassword });
        setSubmitted(true);
        setTimeout(() => router.push('/sign-in'), 2000);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t('auth.reset.requestError')
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
          {t('auth.reset.heroTitle')}
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {t('auth.reset.heroDescription')}
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
          {t('auth.reset.backToLogin')}
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
            {t('auth.reset.title')}
          </Typography>
          {!linkInvalid && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {t('auth.reset.forEmail')} <strong>{email}</strong>.
            </Typography>
          )}

          {linkInvalid ? (
            <Stack spacing={2}>
              <Alert severity="error">{t('auth.reset.invalidLink')}</Alert>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                component={RouterLink}
                to="/forgot-password"
                sx={{ textTransform: 'none' }}
              >
                {t('auth.reset.requestNewLink')}
              </Button>
            </Stack>
          ) : submitted ? (
            <Stack spacing={2}>
              <Alert severity="success">{t('auth.reset.success')}</Alert>
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
                  name="newPassword"
                  label={t('auth.reset.newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                  helperText={formik.touched.newPassword && formik.errors.newPassword}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword((v) => !v)}>
                            <Iconify
                              icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                            />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  name="confirmPassword"
                  label={t('auth.reset.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                  {formik.isSubmitting ? t('auth.reset.saving') : t('auth.reset.submit')}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/sign-in" underline="hover" variant="body2">
                    {t('auth.reset.backToLogin')}
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
