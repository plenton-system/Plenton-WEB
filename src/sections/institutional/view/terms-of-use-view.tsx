import Link from '@mui/material/Link';
import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { LegalDocument } from '../components/legal-document';
import { PublicPageLayout } from '../components/public-page-layout';

import type { LegalSection } from '../components/legal-document';

// ----------------------------------------------------------------------

export function TermsOfUseView() {
  const { t } = useTranslation();
  const contactLink = (
    <Link href={`mailto:${CONFIG.contactEmail}`} underline="hover">
      {CONFIG.contactEmail}
    </Link>
  );
  const privacyLink = (
    <Link href="/privacidade" underline="hover">
      {t('institutional.terms.privacyLink')}
    </Link>
  );

  const sections: LegalSection[] = [
    {
      id: 'aceitacao',
      heading: t('institutional.terms.sections.acceptance.heading'),
      blocks: [
        {
          type: 'paragraph',
          text: (
            <>
              {t('institutional.terms.sections.acceptance.before', { appName: CONFIG.appName })}{' '}
              {privacyLink}.
            </>
          ),
        },
        { type: 'paragraph', text: t('institutional.terms.sections.acceptance.after') },
      ],
    },
    {
      id: 'plataforma',
      heading: t('institutional.terms.sections.platform.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.platform.p1', { appName: CONFIG.appName }) },
      ],
    },
    {
      id: 'cadastro',
      heading: t('institutional.terms.sections.account.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.account.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.terms.sections.account.b1'),
            t('institutional.terms.sections.account.b2'),
            t('institutional.terms.sections.account.b3'),
          ],
        },
      ],
    },
    {
      id: 'uso-plataforma',
      heading: t('institutional.terms.sections.use.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.use.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.terms.sections.use.b1'),
            t('institutional.terms.sections.use.b2'),
            t('institutional.terms.sections.use.b3'),
            t('institutional.terms.sections.use.b4'),
            t('institutional.terms.sections.use.b5'),
          ],
        },
      ],
    },
    {
      id: 'responsabilidades-usuario',
      heading: t('institutional.terms.sections.responsibilities.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.responsibilities.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.terms.sections.responsibilities.b1'),
            t('institutional.terms.sections.responsibilities.b2'),
            t('institutional.terms.sections.responsibilities.b3'),
            t('institutional.terms.sections.responsibilities.b4'),
          ],
        },
      ],
    },
    {
      id: 'planos-assinaturas',
      heading: t('institutional.terms.sections.plans.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.plans.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.terms.sections.plans.b1'),
            t('institutional.terms.sections.plans.b2'),
            t('institutional.terms.sections.plans.b3'),
          ],
        },
      ],
    },
    {
      id: 'periodo-teste',
      heading: t('institutional.terms.sections.trial.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.trial.p1') }],
    },
    {
      id: 'cancelamento',
      heading: t('institutional.terms.sections.cancellation.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.cancellation.p1') }],
    },
    {
      id: 'propriedade-intelectual',
      heading: t('institutional.terms.sections.intellectual.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.intellectual.p1', { appName: CONFIG.appName }) },
      ],
    },
    {
      id: 'disponibilidade',
      heading: t('institutional.terms.sections.availability.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.availability.p1') }],
    },
    {
      id: 'limitacao-responsabilidade',
      heading: t('institutional.terms.sections.liability.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.terms.sections.liability.p1', { appName: CONFIG.appName }) },
      ],
    },
    {
      id: 'suspensao',
      heading: t('institutional.terms.sections.suspension.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.suspension.p1') }],
    },
    {
      id: 'alteracoes-termos',
      heading: t('institutional.terms.sections.changes.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.changes.p1') }],
    },
    {
      id: 'lei-aplicavel',
      heading: t('institutional.terms.sections.law.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.terms.sections.law.p1') }],
    },
    {
      id: 'contato',
      heading: t('institutional.terms.sections.contact.heading'),
      blocks: [
        {
          type: 'paragraph',
          text: (
            <>
              {t('institutional.terms.sections.contact.before')} {contactLink}.
            </>
          ),
        },
      ],
    },
  ];

  return (
    <PublicPageLayout
      eyebrow={t('institutional.terms.eyebrow')}
      title={t('institutional.terms.title')}
      description={t('institutional.terms.description', { appName: CONFIG.appName })}
    >
      <LegalDocument
        lastUpdated={t('institutional.terms.lastUpdated')}
        disclaimer={t('institutional.terms.disclaimer')}
        intro={t('institutional.terms.intro', { appName: CONFIG.appName })}
        sections={sections}
      />
    </PublicPageLayout>
  );
}
