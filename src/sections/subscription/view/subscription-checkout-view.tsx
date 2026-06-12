import type { SubscriptionBillingType } from 'src/types';

import { Icon } from '@iconify/react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/common/use-auth';
import { useStartSubscription } from 'src/hooks/subscription/use-start-subscription';
import { useSubscriptionCatalog } from 'src/hooks/subscription/use-subscription-catalog';

import { formatMoney, billingTypeLabel, billingCycleLabel } from '../utils';

const PAYMENT_OPTIONS: { value: SubscriptionBillingType; title: string; description: string }[] = [
  {
    value: 'Pix',
    title: 'PIX',
    description: 'Inicie a assinatura e pague usando QR Code, copia e cola ou link retornado pelo backend.',
  },
  {
    value: 'BankSlip',
    title: 'Boleto',
    description: 'Gere a cobrança e acompanhe a confirmação após a compensação.',
  },
  {
    value: 'CreditCard',
    title: 'Cartão de crédito',
    description: 'Você será redirecionado para o checkout hospedado do Asaas.',
  },
];

export function SubscriptionCheckoutView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const planPriceId = searchParams.get('planPriceId') ?? '';
  const [billingType, setBillingType] = useState<SubscriptionBillingType>('Pix');
  const { plans, loading, error, reload } = useSubscriptionCatalog();
  const startSubscription = useStartSubscription();

  const selected = useMemo(() => {
    for (const plan of plans) {
      const price = plan.prices.find((item) => item.planPriceId === planPriceId);
      if (price) return { plan, price };
    }
    return null;
  }, [planPriceId, plans]);
  const isTrial = Boolean(selected && selected.plan.trialDays > 0 && selected.price.value === 0);

  const handleStart = async () => {
    if (!selected || !user?.profile?.id) return;

    const response = await startSubscription.start({
      nutritionistId: user.profile.id,
      planPriceId: selected.price.planPriceId,
      billingType,
    });

    if (!response) return;

    if (isTrial || response.status === 'trial') {
      navigate('/dashboard');
      return;
    }

    const checkoutUrl = response.checkoutUrl ?? response.payment?.checkoutUrl;
    if (billingType === 'CreditCard') {
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      startSubscription.setError('O backend não retornou a URL do checkout hospedado.');
      return;
    }

    navigate('/subscription/pending', {
      state: {
        billingType,
        planName: selected.plan.name,
        price: selected.price,
        payment: response.payment,
      },
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {isTrial ? 'Iniciar trial' : 'Finalizar assinatura'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isTrial
              ? 'Ative seu período grátis para começar a usar a plataforma.'
              : 'Escolha a forma de pagamento para iniciar sua assinatura.'}
          </Typography>
        </Box>

        {loading && (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography>Carregando plano selecionado...</Typography>
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert severity="error" action={<Button onClick={reload}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}

        {!loading && !error && !selected && (
          <Alert
            severity="warning"
            action={<Button onClick={() => navigate('/#planos')}>Escolher plano</Button>}
          >
            O preço selecionado não está mais disponível. Escolha um plano ativo para continuar.
          </Alert>
        )}

        {selected && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Chip label="Plano selecionado" sx={{ alignSelf: 'flex-start' }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selected.plan.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {selected.plan.description}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {isTrial ? 'Grátis' : formatMoney(selected.price.value, selected.price.currency)}
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      {isTrial ? `${selected.plan.trialDays} dias` : `/ ${billingCycleLabel(selected.price.billingCycle)}`}
                    </Typography>
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {isTrial ? 'Ativação do trial' : 'Forma de pagamento'}
                  </Typography>

                  {isTrial ? (
                    <Alert severity="info">
                      Seu acesso será liberado por {selected.plan.trialDays} dias. Nenhuma cobrança será efetuada
                      para este plano.
                    </Alert>
                  ) : (
                    <RadioGroup
                      value={billingType}
                      onChange={(event) => setBillingType(event.target.value as SubscriptionBillingType)}
                    >
                      <Stack spacing={1.5}>
                        {PAYMENT_OPTIONS.map((option) => (
                          <Paper key={option.value} variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 1.5 }}>
                            <FormControlLabel
                              value={option.value}
                              control={<Radio />}
                              label={
                                <Box>
                                  <Typography variant="subtitle2">{option.title}</Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {option.description}
                                  </Typography>
                                </Box>
                              }
                              sx={{ alignItems: 'flex-start', m: 0 }}
                            />
                          </Paper>
                        ))}
                      </Stack>
                    </RadioGroup>
                  )}

                  {startSubscription.error && <Alert severity="error">{startSubscription.error}</Alert>}

                  <Button
                    size="large"
                    variant="contained"
                    onClick={handleStart}
                    disabled={startSubscription.loading || !user?.profile?.id}
                    startIcon={
                      startSubscription.loading ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : (
                        <Box component={Icon} icon="solar:card-send-bold" />
                      )
                    }
                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                  >
                    {isTrial
                      ? 'Começar trial'
                      : billingType === 'CreditCard'
                        ? 'Ir para checkout Asaas'
                        : `Iniciar pagamento por ${billingTypeLabel(billingType)}`}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
