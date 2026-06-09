import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/common/use-auth';

import { authService } from 'src/services';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, authenticating } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL é a fonte da verdade para qual aba está ativa.
  // ?action=register → aba de cadastro; ausência do param → aba de login.
  const isSignIn = searchParams.get('action') !== 'register';
  const returnTo = searchParams.get('returnTo');

  const goToSignIn = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    setSearchParams(next, { replace: false });
  }, [searchParams, setSearchParams]);

  const toggleMode = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    if (isSignIn) next.set('action', 'register');
    else next.delete('action');
    setSearchParams(next, { replace: false });
  }, [isSignIn, searchParams, setSearchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-up state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCrn, setRegisterCrn] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        setErrorMessage('Por favor, preencha o e-mail e a senha.');
        return;
      }

      await signIn({ email, password });

      const pendingPlanPriceId =
        searchParams.get('planPriceId') ?? sessionStorage.getItem('pendingPlanPriceId');

      if (returnTo) {
        sessionStorage.removeItem('pendingPlanPriceId');
        router.push(returnTo);
        return;
      }

      if (pendingPlanPriceId) {
        sessionStorage.removeItem('pendingPlanPriceId');
        router.push(`/subscription/checkout?planPriceId=${encodeURIComponent(pendingPlanPriceId)}`);
        return;
      }

      router.push('/dashboard');

    } catch (error) {
      // Extrai apenas a mensagem limpa
      const message = error instanceof Error ?
        error.message : 'Erro desconhecido';
      setErrorMessage(message);
    }
  };

  const handleRegister = async () => {
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword || !registerCrn.trim()) {
      setErrorMessage('Preencha nome, e-mail, senha e CRN.');
      return;
    }

    setRegistering(true);
    try {
      await authService.register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        crn: registerCrn.trim(),
        phone: registerPhone.trim() || undefined,
      });

      // Pré-preenche o login com os dados recém-cadastrados
      setEmail(registerEmail.trim());
      setPassword('');
      setSuccessMessage('Cadastro efetuado! Faça login para continuar.');
      goToSignIn();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta.';
      setErrorMessage(message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Grid
      container
      columns={{ xs: 12 }}
      sx={{
        minHeight: { xs: 'auto', md: '80vh' },
        width: { xs: '100%', md: '70vw' },
        margin: '0 auto', // Centralização
        transition: theme.transitions.create('width'), // Animação suave
        borderRadius: '16px', // Adiciona borda arredondada em todo o container
        overflow: 'hidden', // Mantém o conteúdo dentro das bordas arredondadas
        boxShadow: theme.customShadows.z16, // Adiciona sombra para melhor visualização (opcional)
        bgcolor: theme.vars.palette.background.paper,
      }}>

      {/* Lado Esquerdo - Mensagem */}
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
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: { xs: 4, md: 10 }, // Padding responsivo
        }}
      >
        <Typography variant="h4" gutterBottom textAlign="center">
          {isSignIn ? 'Bem-vindo de volta!' : 'Olá, amigo!'}
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {isSignIn
            ? 'Para manter a conexão conosco, faça login com suas informações pessoais'
            : 'Insira seus dados pessoais e comece sua jornada conosco'}
        </Typography>

        <Button
          variant='outlined'
          onClick={toggleMode}
          sx={{
            color: '#FFFFFF',
            borderColor: 'rgba(255,255,255,0.56)',
            '&:hover': {
              borderColor: '#FFFFFF',
              bgcolor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          {isSignIn ? 'Registrar' : 'Entrar'}
        </Button>
      </Grid>

      {/* Lado Direito - Formulário */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          position: 'relative', // <- necessário para os "position: absolute"
          color: theme.vars.palette.text.primary,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: { xs: 0, md: 10 },
          overflow: 'hidden',
          minHeight: { md: '100%' },
          display: 'flex',
          width: '100%',
          bgcolor: theme.vars.palette.background.paper,
        }}
      >
        <Slide direction="left" timeout={400} in={isSignIn} mountOnEnter unmountOnExit>
          <Paper
            elevation={0}
            square
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'safe center',
              flexDirection: 'column',
              px: { xs: 3, md: 10 },
              py: { xs: 4, md: 0 },
              overflowY: 'auto',
              bgcolor: theme.vars.palette.background.paper,
              position: { xs: 'relative', md: 'absolute' },
              color: theme.vars.palette.text.primary,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Iniciar Sessão
            </Typography>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                flexDirection: 'column',
                width: '100%',
                maxWidth: { xs: '100%', md: '80%' },
              }}
            >
              <TextField
                fullWidth
                name="email"
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, mt: 3 }}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />

              <Link
                variant="body2"
                onClick={() => router.push('/forgot-password')}
                sx={{
                  mb: 1.5,
                  cursor: 'pointer',
                  color: theme.vars.palette.text.secondary,
                }}
              >
                Esqueceu a senha?
              </Link>

              <Button
                fullWidth
                size="large"
                type="submit"
                color="primary"
                variant="contained"
                disabled={authenticating}
                startIcon={authenticating && <CircularProgress size={20} color="inherit" />}
              >
                {authenticating ? 'Entrando...' : 'Entrar'}
              </Button>


            </Box>
            <Divider sx={{ my: 1.5, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
              >
                OU
              </Typography>
            </Divider>
            <Box
              sx={{
                gap: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:google" />
              </IconButton>
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:github" />
              </IconButton>
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:twitter" />
              </IconButton>
            </Box>
          </Paper>
        </Slide >

        <Slide direction="right" timeout={400} in={!isSignIn} mountOnEnter unmountOnExit>
          <Paper
            elevation={0}
            square
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'safe center',
              flexDirection: 'column',
              px: { xs: 3, md: 10 },
              py: { xs: 4, md: 0 },
              overflowY: 'auto',
              bgcolor: theme.vars.palette.background.paper,
              position: { xs: 'relative', md: 'absolute' },
              color: theme.vars.palette.text.primary,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Criar Conta
            </Typography>
            <Box
              component="form"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                flexDirection: 'column',
                width: '100%',
                maxWidth: { xs: '100%', md: '80%' },
              }}
            >
              <TextField
                fullWidth
                name="name"
                label="Nome completo"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                sx={{ mb: 2, mt: 3 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                name="email"
                type="email"
                label="E-mail"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                name="registerPassword"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                helperText="Mínimo 8 caracteres"
                sx={{ mb: 2 }}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: {
                    autoComplete: 'off',
                    'data-1p-ignore': 'true',
                    'data-bwignore': 'true',
                    'data-lpignore': 'true',
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                fullWidth
                name="crn"
                label="CRN"
                placeholder="Ex.: CRN-3 12345"
                value={registerCrn}
                onChange={(e) => setRegisterCrn(e.target.value)}
                sx={{ mb: 2 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                name="phone"
                label="Telefone (opcional)"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                sx={{ mb: 3 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Button
                fullWidth
                size="large"
                type="submit"
                color="primary"
                variant="contained"
                disabled={registering}
                startIcon={registering && <CircularProgress size={20} color="inherit" />}
                sx={{ mb: 1 }}
              >
                {registering ? 'Criando conta...' : 'Registrar'}
              </Button>
            </Box>

            <Divider
              sx={{
                width: '100%',
                maxWidth: '80%',
                '&::before, &::after': { borderTopStyle: 'dashed' },
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
              >
                OU
              </Typography>
            </Divider>

            <Box
              sx={{
                gap: 1,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:google" />
              </IconButton>
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:github" />
              </IconButton>
              <IconButton color="inherit">
                <Iconify width={22} icon="socials:twitter" />
              </IconButton>
            </Box>
          </Paper>
        </Slide>

      </Grid>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={8000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMessage('')}
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Grid >
  );
}
