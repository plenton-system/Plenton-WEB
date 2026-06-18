import type { SubscriptionPlan } from 'src/types';

import { Icon } from '@iconify/react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/hooks/common/use-auth';
import { useSubscriptionCatalog } from 'src/hooks/subscription/use-subscription-catalog';

import { formatMoney, billingCycleLabel } from 'src/sections/subscription/utils';

// ----------------------------------------------------------------------

type Plan = {
  name: string;
  description: string;
  price: string;
  period?: string;
  featured?: boolean;
  ctaLabel: string;
  features: string[];
};

export function LandingPricing() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { plans: catalogPlans, loading, error, reload, hasCatalog } = useSubscriptionCatalog();
  const [selectedPrices, setSelectedPrices] = useState<Record<string, string>>({});
  const fallbackPlans: Plan[] = [
    {
      name: 'Trial',
      description: t('landing.pricing.trial.description'),
      price: t('subscription.checkout.free'),
      period: t('landing.pricing.trial.period'),
      ctaLabel: t('landing.pricing.trial.cta'),
      features: [
        t('landing.pricing.features.upToFivePatients'),
        t('landing.pricing.features.mealPlans'),
        t('landing.pricing.features.anamnesis'),
        t('landing.pricing.features.calendar'),
        t('landing.pricing.features.taco'),
      ],
    },
    {
      name: t('landing.pricing.professional.name'),
      description: t('landing.pricing.professional.description'),
      price: formatMoney(79),
      period: `/ ${billingCycleLabel('monthly')}`,
      featured: true,
      ctaLabel: t('landing.pricing.professional.cta'),
      features: [
        t('landing.pricing.features.unlimitedPatients'),
        t('landing.pricing.features.unlimitedPlans'),
        t('landing.pricing.features.publicAnamnesis'),
        t('landing.pricing.features.dashboard'),
        t('landing.pricing.features.workspace'),
        t('landing.pricing.features.emailSupport'),
      ],
    },
    {
      name: t('landing.pricing.premium.name'),
      description: t('landing.pricing.premium.description'),
      price: formatMoney(149),
      period: `/ ${billingCycleLabel('monthly')}`,
      ctaLabel: t('landing.pricing.premium.cta'),
      features: [
        t('landing.pricing.features.everythingProfessional'),
        t('landing.pricing.features.assistantAccess'),
        t('landing.pricing.features.reminders'),
        t('landing.pricing.features.advancedReports'),
        t('landing.pricing.features.prioritySupport'),
      ],
    },
  ];

  const activePlans = useMemo(
    () =>
      [...catalogPlans]
        .filter((plan) => plan.status === 'active' && plan.prices.length > 0)
        .sort(
          (current, next) =>
            current.displayOrder - next.displayOrder ||
            current.name.localeCompare(next.name) ||
            current.code.localeCompare(next.code)
        ),
    [catalogPlans]
  );

  const handleFallbackClick = () => {
    navigate('/sign-in?action=register');
  };

  const handleRealPlanClick = (planPriceId: string) => {
    if (isAuthenticated) {
      navigate(`/subscription/checkout?planPriceId=${encodeURIComponent(planPriceId)}`);
      return;
    }

    sessionStorage.setItem('pendingPlanPriceId', planPriceId);
    navigate(
      `/sign-in?action=register&planPriceId=${encodeURIComponent(planPriceId)}&returnTo=${encodeURIComponent(
        `/subscription/checkout?planPriceId=${planPriceId}`
      )}`
    );
  };

  const renderCatalogPlan = (plan: SubscriptionPlan) => {
    const selectedPlanPriceId = selectedPrices[plan.planId] ?? plan.prices[0]?.planPriceId ?? '';
    const selectedPrice =
      plan.prices.find((price) => price.planPriceId === selectedPlanPriceId) ?? plan.prices[0];
    const featured = plan.isFeatured;
    const features = plan.features.length > 0
      ? plan.features
      : [
          t('landing.pricing.features.mealPlans'),
          t('landing.pricing.features.anamnesis'),
          t('landing.pricing.features.calendar'),
          t('landing.pricing.features.workspace'),
        ];

    return (
      <Grid key={plan.planId} size={{ xs: 12, md: 4 }}>
        <Box
          sx={{
            height: 1,
            p: 4,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: `1px solid ${featured ? theme.palette.primary.main : theme.palette.divider}`,
            bgcolor: featured ? varAlpha(theme.vars.palette.primary.mainChannel, 0.04) : 'background.paper',
            boxShadow: featured ? `0 16px 40px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}` : 'none',
          }}
        >
          {featured && (
            <Chip
              label={t('landing.pricing.featured')}
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                fontWeight: 700,
              }}
            />
          )}

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {plan.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
            {plan.description || t('landing.pricing.planFallback')}
          </Typography>

          {plan.prices.length > 1 && (
            <Select
              size="small"
              value={selectedPlanPriceId}
              onChange={(event) =>
                setSelectedPrices((current) => ({ ...current, [plan.planId]: event.target.value }))
              }
              sx={{ mb: 2 }}
            >
              {plan.prices.map((price) => (
                <MenuItem key={price.planPriceId} value={price.planPriceId}>
                  {billingCycleLabel(price.billingCycle)} - {formatMoney(price.value, price.currency)}
                </MenuItem>
              ))}
            </Select>
          )}

          <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {formatMoney(selectedPrice.value, selectedPrice.currency)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              / {billingCycleLabel(selectedPrice.billingCycle)}
            </Typography>
          </Stack>

          <Stack spacing={1.25} sx={{ mb: 4, flexGrow: 1 }}>
            {features.map((feat) => (
              <Stack key={feat} direction="row" spacing={1} alignItems="center">
                <Box
                  component={Icon}
                  icon="solar:check-circle-bold"
                  sx={{ color: 'primary.main', flexShrink: 0, width: 20, height: 20 }}
                />
                <Typography variant="body2">{feat}</Typography>
              </Stack>
            ))}
          </Stack>

          <Button
            fullWidth
            size="large"
            variant={featured ? 'contained' : 'outlined'}
            onClick={() => handleRealPlanClick(selectedPrice.planPriceId)}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {t('landing.pricing.subscribe')}
          </Button>
        </Box>
      </Grid>
    );
  };

  return (
    <Box id="planos" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 8 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {t('landing.pricing.eyebrow')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 720 }}>
            {t('landing.pricing.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
            {t('landing.pricing.description')}
          </Typography>
        </Stack>

        {loading && (
          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('landing.pricing.loading')}
            </Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="info" action={<Button onClick={reload}>{t('shared.retry')}</Button>} sx={{ mb: 3 }}>
            {t('landing.pricing.loadError')}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="stretch">
          {hasCatalog && activePlans.length > 0
            ? activePlans.map(renderCatalogPlan)
            : fallbackPlans.map((plan) => (
            <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: 1,
                  p: 4,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: `1px solid ${plan.featured ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: plan.featured
                    ? varAlpha(theme.vars.palette.primary.mainChannel, 0.04)
                    : 'background.paper',
                  boxShadow: plan.featured
                    ? `0 16px 40px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`
                    : 'none',
                }}
              >
                {plan.featured && (
                  <Chip
                    label={t('landing.pricing.featured')}
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontWeight: 700,
                    }}
                  />
                )}

                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {plan.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 3 }}>
                  {plan.description}
                </Typography>

                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {plan.price}
                  </Typography>
                  {plan.period && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {plan.period}
                    </Typography>
                  )}
                </Stack>

                <Stack spacing={1.25} sx={{ mb: 4, flexGrow: 1 }}>
                  {plan.features.map((feat) => (
                    <Stack key={feat} direction="row" spacing={1} alignItems="center">
                      <Box
                        component={Icon}
                        icon="solar:check-circle-bold"
                        sx={{ color: 'primary.main', flexShrink: 0, width: 20, height: 20 }}
                      />
                      <Typography variant="body2">{feat}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant={plan.featured ? 'contained' : 'outlined'}
                  onClick={handleFallbackClick}
                  sx={{ textTransform: 'none', boxShadow: 'none' }}
                >
                  {plan.ctaLabel}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
