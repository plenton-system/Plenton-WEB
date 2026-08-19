import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material';
import Button from '@mui/material/Button';
// Integrações sociais ainda não implementadas — reativar o import quando prontas.
// import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/common/use-auth';

import { resolvePostSignInDestination } from 'src/utils/app-roles';

import { authService } from 'src/services';
import { fetchAddressByCep } from 'src/shared/services/cep';

import { Iconify } from 'src/components/iconify';

import { maskCPF } from 'src/sections/patient/utils/masks';

// ----------------------------------------------------------------------

type RegisterAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
};

const emptyRegisterAddress: RegisterAddress = {
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
};

function missingRegisterAddressFields(address: RegisterAddress) {
  const required: { field: keyof RegisterAddress; label: string }[] = [
    { field: 'zipCode', label: 'CEP' },
    { field: 'street', label: 'rua/avenida' },
    { field: 'number', label: 'número do endereço' },
    { field: 'neighborhood', label: 'bairro' },
    { field: 'city', label: 'cidade' },
    { field: 'state', label: 'estado' },
  ];

  return required.filter(({ field }) => !address[field].trim()).map(({ label }) => label);
}

export function SignInView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const location = useLocation();
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
  const [registerDocument, setRegisterDocument] = useState('');
  const [registerCrn, setRegisterCrn] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerAddress, setRegisterAddress] = useState<RegisterAddress>(emptyRegisterAddress);
  const [registering, setRegistering] = useState(false);

  const setRegisterAddressField = (field: keyof RegisterAddress, value: string) => {
    setRegisterAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterZipCodeBlur = async () => {
    const address = await fetchAddressByCep(registerAddress.zipCode);
    if (!address) return;

    setRegisterAddress((prev) => ({
      ...prev,
      street: address.street ?? prev.street,
      neighborhood: address.neighborhood ?? prev.neighborhood,
      city: address.city ?? prev.city,
      state: address.state ?? prev.state,
    }));
  };

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        setErrorMessage(t('auth.requiredLogin'));
        return;
      }

      const signedInUser = await signIn({ email, password });

      const pendingPlanPriceId =
        searchParams.get('planPriceId') ?? sessionStorage.getItem('pendingPlanPriceId');

      const stateReturnTo = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      const requestedPath = returnTo ?? stateReturnTo;
      if (pendingPlanPriceId) {
        sessionStorage.removeItem('pendingPlanPriceId');
      }
      router.replace(
        resolvePostSignInDestination(signedInUser.role, requestedPath, pendingPlanPriceId)
      );
    } catch (error) {
      // Extrai apenas a mensagem limpa
      const message = error instanceof Error ? error.message : t('auth.unknownError');
      setErrorMessage(message);
    }
  };

  const handleRegister = async () => {
    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !registerDocument.trim() ||
      !registerPhone.trim()
    ) {
      setErrorMessage(t('auth.requiredRegister'));
      return;
    }

    const missingAddressFields = missingRegisterAddressFields(registerAddress);
    if (missingAddressFields.length > 0) {
      setErrorMessage(t('auth.requiredAddress', { fields: missingAddressFields.join(', ') }));
      return;
    }

    setRegistering(true);
    try {
      const crn = registerCrn.trim() || null;
      await authService.register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        document: registerDocument.trim(),
        crn,
        phone: registerPhone.trim(),
        addressDto: {
          street: registerAddress.street.trim(),
          number: registerAddress.number.trim(),
          neighborhood: registerAddress.neighborhood.trim(),
          city: registerAddress.city.trim(),
          state: registerAddress.state.trim(),
          zipCode: registerAddress.zipCode.trim(),
        },
      });

      // Pré-preenche o login com os dados recém-cadastrados
      setEmail(registerEmail.trim());
      setPassword('');
      setSuccessMessage(t('auth.registerSuccess'));
      goToSignIn();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.createError');
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
      }}
    >
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
          {isSignIn ? t('auth.welcomeBack') : t('auth.helloFriend')}
        </Typography>

        <Typography
          variant="body1"
          mb={3}
          textAlign="center"
          sx={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {isSignIn ? t('auth.signInIntro') : t('auth.registerIntro')}
        </Typography>

        <Button
          variant="outlined"
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
          {isSignIn ? t('auth.register') : t('auth.signIn')}
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
              px: { xs: 3, md: 6 },
              py: { xs: 3, md: 2 },
              overflowY: 'auto',
              bgcolor: theme.vars.palette.background.paper,
              position: { xs: 'relative', md: 'absolute' },
              color: theme.vars.palette.text.primary,
            }}
          >
            <Typography variant="h5" gutterBottom>
              {t('auth.signInTitle')}
            </Typography>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
                gap: 1.25,
              }}
            >
              <TextField
                fullWidth
                name="email"
                label={t('auth.fields.email')}
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
                label={t('auth.fields.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify
                            icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
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
                {t('auth.forgotPassword')}
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
                <span>{authenticating ? t('auth.signingIn') : t('auth.signIn')}</span>
              </Button>
            </Box>
            {/* Login social (Google, GitHub, X) ainda não implementado — reativar quando pronto.
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
            */}
          </Paper>
        </Slide>

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
              {t('auth.createAccount')}
            </Typography>
            <Box
              component="form"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(12, minmax(0, 1fr))' },
                width: '100%',
                maxWidth: { xs: '100%', md: 520 },
                columnGap: 1.5,
                rowGap: 2,
                '& .MuiOutlinedInput-root': {
                  minHeight: 48,
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                },
              }}
            >
              <TextField
                fullWidth
                size="small"
                name="name"
                label={t('auth.fields.name')}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                sx={{ gridColumn: '1 / -1' }}
              />

              <TextField
                fullWidth
                size="small"
                name="email"
                type="email"
                label={t('auth.fields.email')}
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="document"
                label={t('auth.fields.document')}
                value={registerDocument}
                onChange={(e) => setRegisterDocument(maskCPF(e.target.value))}
                slotProps={{ htmlInput: { maxLength: 14 } }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="registerPassword"
                label={t('auth.fields.password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="off"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder={t('auth.fields.passwordHint')}
                slotProps={{
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
                          <Iconify
                            icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                          />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="crn"
                label={t('auth.fields.crn')}
                placeholder={t('auth.fields.crnPlaceholder')}
                value={registerCrn}
                onChange={(e) => setRegisterCrn(e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="phone"
                label={t('auth.fields.phone')}
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="zipCode"
                label={t('auth.fields.zipCode')}
                value={registerAddress.zipCode}
                onChange={(e) => setRegisterAddressField('zipCode', e.target.value)}
                onBlur={handleRegisterZipCodeBlur}
                slotProps={{ htmlInput: { maxLength: 9 } }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="street"
                label={t('auth.fields.street')}
                value={registerAddress.street}
                onChange={(e) => setRegisterAddressField('street', e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 8' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="number"
                label={t('auth.fields.number')}
                value={registerAddress.number}
                onChange={(e) => setRegisterAddressField('number', e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 4' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="neighborhood"
                label={t('auth.fields.neighborhood')}
                value={registerAddress.neighborhood}
                onChange={(e) => setRegisterAddressField('neighborhood', e.target.value)}
                slotProps={{ htmlInput: { maxLength: 64 } }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 6' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="city"
                label={t('auth.fields.city')}
                value={registerAddress.city}
                onChange={(e) => setRegisterAddressField('city', e.target.value)}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 3' } }}
              />
              <TextField
                fullWidth
                size="small"
                name="state"
                label={t('auth.fields.state')}
                value={registerAddress.state}
                onChange={(e) => setRegisterAddressField('state', e.target.value)}
                slotProps={{ htmlInput: { maxLength: 2 } }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'span 3' } }}
              />
              <Button
                fullWidth
                size="large"
                type="submit"
                color="primary"
                variant="contained"
                disabled={registering}
                startIcon={registering && <CircularProgress size={20} color="inherit" />}
                sx={{ gridColumn: '1 / -1', mt: 0.5, mb: 1 }}
              >
                <span>{registering ? t('auth.registering') : t('auth.register')}</span>
              </Button>
            </Box>

            {/* Cadastro social (Google, GitHub, X) ainda não implementado — reativar quando pronto.
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
            */}
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
    </Grid>
  );
}
