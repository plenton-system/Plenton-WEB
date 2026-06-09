import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
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

const schema = Yup.object({
  email: Yup.string().email('E-mail inválido').required('Informe seu e-mail'),
});

export function ForgotPasswordView() {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setErrorMessage('');
      try {
        await authService.forgotPassword({ email: values.email.trim() });
        setSubmitted(true);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Não foi possível processar a solicitação.'
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
          Esqueceu sua senha?
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          Sem problemas. Informe seu e-mail e te ajudaremos a recuperar o acesso.
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
          Voltar ao login
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
            Recuperar senha
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Enviaremos um link para você criar uma nova senha.
          </Typography>

          {submitted ? (
            <Stack spacing={2}>
              <Alert severity="success">
                Se o e-mail estiver cadastrado, você receberá em instantes um link para redefinir
                a senha. Cheque sua caixa de entrada e o spam.
              </Alert>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                component={RouterLink}
                to="/sign-in"
                sx={{ textTransform: 'none' }}
              >
                Voltar para o login
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
                  label="E-mail"
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
                  {formik.isSubmitting ? 'Enviando...' : 'Enviar link'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link component={RouterLink} to="/sign-in" underline="hover" variant="body2">
                    Lembrou a senha? Entrar
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
