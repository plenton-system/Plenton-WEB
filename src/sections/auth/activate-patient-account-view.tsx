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

const hasValidPasswordRules = (value?: string) =>
  !!value
  && value.length >= 8
  && /[a-z]/.test(value)
  && /[A-Z]/.test(value)
  && /\d/.test(value)
  && /[^A-Za-z0-9]/.test(value);

export function ActivatePatientAccountView() {
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
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(() => t('auth.activate.passwordRequired'))
        .test(
          'password-rules',
          () => t('auth.activate.passwordRules'),
          hasValidPasswordRules
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], () => t('auth.activate.passwordMismatch'))
        .required(() => t('auth.activate.confirmRequired')),
    }),
    onSubmit: async (values, helpers) => {
      setErrorMessage('');

      try {
        await authService.activatePatientAccount({
          email,
          token,
          password: values.password,
        });
        setSubmitted(true);
        setTimeout(() => router.push('/sign-in'), 2000);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t('auth.activate.requestError')
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
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          bgcolor: theme.vars.palette.primary.main,
          color: theme.vars.palette.primary.contrastText,
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
          {t('auth.activate.heroTitle')}
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {t('auth.activate.heroDescription')}
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
          {t('auth.activate.backToLogin')}
        </Button>
      </Grid>

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
            {t('auth.activate.title')}
          </Typography>

          {!linkInvalid && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {t('auth.activate.forEmail')} <strong>{email}</strong>.
            </Typography>
          )}

          {linkInvalid ? (
            <Stack spacing={2}>
              <Alert severity="error">{t('auth.activate.invalidLink')}</Alert>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                component={RouterLink}
                to="/sign-in"
                sx={{ textTransform: 'none' }}
              >
                {t('auth.activate.backToLogin')}
              </Button>
            </Stack>
          ) : submitted ? (
            <Alert severity="success">{t('auth.activate.success')}</Alert>
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
                  name="password"
                  label={t('auth.activate.password')}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            edge="end"
                            aria-label={t('auth.activate.togglePasswordVisibility')}
                            onClick={() => setShowPassword((value) => !value)}
                          >
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
                  label={t('auth.activate.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.confirmPassword
                    && Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword
                    && formik.errors.confirmPassword
                  }
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
                  {formik.isSubmitting ? t('auth.activate.saving') : t('auth.activate.submit')}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/sign-in" underline="hover" variant="body2">
                    {t('auth.activate.backToLogin')}
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
