import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/common/use-auth';
import { useCurrentSubscription } from 'src/hooks/subscription/use-current-subscription';

type Props = {
  state: 'success' | 'cancel' | 'expired';
};

const copy = {
  success: {
    icon: 'solar:hourglass-bold',
    title: 'Aguardando confirmação',
    description:
      'Recebemos o retorno do checkout, mas a assinatura só será liberada quando o backend confirmar o pagamento.',
    severity: 'info' as const,
  },
  cancel: {
    icon: 'solar:close-circle-bold',
    title: 'Checkout cancelado',
    description: 'O pagamento não foi concluído. Você pode voltar aos planos e iniciar uma nova tentativa.',
    severity: 'warning' as const,
  },
  expired: {
    icon: 'solar:calendar-minimalistic-bold',
    title: 'Checkout expirado',
    description: 'O prazo desse checkout terminou. Escolha um plano para gerar uma nova tentativa.',
    severity: 'error' as const,
  },
};

export function SubscriptionStatusRouteView({ state }: Props) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const shouldPoll = state === 'success' && isAuthenticated;
  const current = useCurrentSubscription({ auto: shouldPoll, poll: shouldPoll, pollIntervalMs: 7000 });
  const content = copy[state];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Box component={Icon} icon={content.icon} sx={{ width: 44, height: 44, color: `${content.severity}.main` }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {content.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>{content.description}</Typography>
          </Stack>

          <Alert severity={content.severity}>
            {state === 'success'
              ? 'Aguardando confirmação do webhook de pagamento.'
              : content.description}
          </Alert>

          {state === 'success' && !isAuthenticated && (
            <Alert severity="info" action={<Button onClick={() => navigate('/sign-in')}>Entrar</Button>}>
              Entre novamente para acompanhar o status da assinatura.
            </Alert>
          )}

          {state === 'success' && current.loading && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">Consultando status da assinatura...</Typography>
            </Stack>
          )}

          {state === 'success' && current.data?.status === 'active' && (
            <Alert severity="success" action={<Button onClick={() => navigate('/dashboard')}>Ir para o app</Button>}>
              Assinatura ativa.
            </Alert>
          )}

          {state === 'success' && current.error && (
            <Alert severity="warning" action={<Button onClick={current.reload}>Tentar novamente</Button>}>
              {current.error}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="contained" onClick={() => navigate('/#planos')}>
              Escolher plano
            </Button>
            <Button variant="outlined" onClick={() => navigate('/settings/subscription')}>
              Minha assinatura
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
