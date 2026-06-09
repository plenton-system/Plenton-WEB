import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { RequireAuth } from './components/require-auth';

// ----------------------------------------------------------------------

export const LandingPage = lazy(() => import('src/pages/landing'));
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const PatientPage = lazy(() => import('src/pages/patient'));
export const AppointmentPage = lazy(() => import('src/pages/appointment'));
export const AnamnesisPage = lazy(() => import('src/pages/anamnesis'));
export const WorkspacePage = lazy(() => import('src/pages/workspace'));
export const FoodPage = lazy(() => import('src/pages/food'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
export const SubscriptionCheckoutPage = lazy(() => import('src/pages/subscription-checkout'));
export const SubscriptionPendingPage = lazy(() => import('src/pages/subscription-pending'));
export const SubscriptionSuccessPage = lazy(() => import('src/pages/subscription-success'));
export const SubscriptionCancelPage = lazy(() => import('src/pages/subscription-cancel'));
export const SubscriptionExpiredPage = lazy(() => import('src/pages/subscription-expired'));
export const SettingsSubscriptionPage = lazy(() => import('src/pages/settings-subscription'));

export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const PublicAnamnesisPage = lazy(() => import('src/pages/public-anamnesis'));
export const PrivacyPolicyPage = lazy(() => import('src/pages/privacy-policy'));
export const TermsOfUsePage = lazy(() => import('src/pages/terms-of-use'));
export const ContactPage = lazy(() => import('src/pages/contact'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  // -------------------------
  // Landing (público, sem layout)
  // -------------------------
  {
    element: (
      <Suspense fallback={renderFallback()}>
        <Outlet />
      </Suspense>
    ),
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'public/:tenantId/anamnesis/:token', element: <PublicAnamnesisPage /> },
      { path: 'subscription/success', element: <SubscriptionSuccessPage /> },
      { path: 'subscription/cancel', element: <SubscriptionCancelPage /> },
      { path: 'subscription/expired', element: <SubscriptionExpiredPage /> },

      // Páginas públicas institucionais
      { path: 'privacidade', element: <PrivacyPolicyPage /> },
      { path: 'termos', element: <TermsOfUsePage /> },
      { path: 'contato', element: <ContactPage /> },

      // Compatibilidade com links antigos
      { path: 'politica-de-privacidade', element: <Navigate to="/privacidade" replace /> },
      { path: 'termos-de-uso', element: <Navigate to="/termos" replace /> },
    ],
  },

  // -------------------------
  // Auth (público)
  // -------------------------
  {
    element: (
      <AuthLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </AuthLayout>
    ),
    children: [
      { path: 'sign-in', element: <SignInPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // -------------------------
  // App (autenticado)
  // -------------------------
  {
    element: (
      <RequireAuth>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </RequireAuth>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'patient', element: <PatientPage /> },
      { path: 'appointment', element: <AppointmentPage /> },
      { path: 'workspace', element: <WorkspacePage /> },
      { path: 'food', element: <FoodPage /> },
      { path: 'anamnesis', element: <AnamnesisPage /> },
      { path: 'subscription/checkout', element: <SubscriptionCheckoutPage /> },
      { path: 'subscription/pending', element: <SubscriptionPendingPage /> },
      { path: 'settings/subscription', element: <SettingsSubscriptionPage /> },
    ],
  },

  // -------------------------
  // 404
  // -------------------------
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
