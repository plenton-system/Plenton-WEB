import { useTranslation } from 'react-i18next';

import Link from '@mui/material/Link';

import { CONFIG } from 'src/config-global';

import { LegalDocument } from '../components/legal-document';
import { PublicPageLayout } from '../components/public-page-layout';

import type { LegalSection } from '../components/legal-document';

// ----------------------------------------------------------------------

export function PrivacyPolicyView() {
  const { t } = useTranslation();
  const contactLink = (
    <Link href={`mailto:${CONFIG.contactEmail}`} underline="hover">
      {CONFIG.contactEmail}
    </Link>
  );

  const sections: LegalSection[] = [
    {
      id: 'quem-somos',
      heading: t('institutional.privacy.sections.about.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.about.p1', { appName: CONFIG.appName }) },
        { type: 'paragraph', text: t('institutional.privacy.sections.about.p2') },
      ],
    },
    {
      id: 'dados-coletados',
      heading: t('institutional.privacy.sections.collected.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.collected.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.privacy.sections.collected.b1'),
            t('institutional.privacy.sections.collected.b2'),
            t('institutional.privacy.sections.collected.b3'),
            t('institutional.privacy.sections.collected.b4'),
            t('institutional.privacy.sections.collected.b5'),
          ],
        },
      ],
    },
    {
      id: 'finalidade',
      heading: t('institutional.privacy.sections.purpose.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.purpose.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.privacy.sections.purpose.b1'),
            t('institutional.privacy.sections.purpose.b2'),
            t('institutional.privacy.sections.purpose.b3'),
            t('institutional.privacy.sections.purpose.b4'),
            t('institutional.privacy.sections.purpose.b5'),
            t('institutional.privacy.sections.purpose.b6'),
          ],
        },
      ],
    },
    {
      id: 'dados-pacientes',
      heading: t('institutional.privacy.sections.patients.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.patients.p1', { appName: CONFIG.appName }) },
        { type: 'paragraph', text: t('institutional.privacy.sections.patients.p2') },
      ],
    },
    {
      id: 'compartilhamento',
      heading: t('institutional.privacy.sections.sharing.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.sharing.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.privacy.sections.sharing.b1'),
            t('institutional.privacy.sections.sharing.b2'),
            t('institutional.privacy.sections.sharing.b3'),
            t('institutional.privacy.sections.sharing.b4'),
          ],
        },
        { type: 'paragraph', text: t('institutional.privacy.sections.sharing.p2') },
      ],
    },
    {
      id: 'cookies',
      heading: t('institutional.privacy.sections.cookies.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.privacy.sections.cookies.p1') }],
    },
    {
      id: 'seguranca',
      heading: t('institutional.privacy.sections.security.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.privacy.sections.security.p1') }],
    },
    {
      id: 'retencao',
      heading: t('institutional.privacy.sections.retention.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.privacy.sections.retention.p1') }],
    },
    {
      id: 'direitos-titular',
      heading: t('institutional.privacy.sections.rights.heading'),
      blocks: [
        { type: 'paragraph', text: t('institutional.privacy.sections.rights.intro') },
        {
          type: 'bullets',
          items: [
            t('institutional.privacy.sections.rights.b1'),
            t('institutional.privacy.sections.rights.b2'),
            t('institutional.privacy.sections.rights.b3'),
            t('institutional.privacy.sections.rights.b4'),
            t('institutional.privacy.sections.rights.b5'),
            t('institutional.privacy.sections.rights.b6'),
          ],
        },
        {
          type: 'paragraph',
          text: (
            <>
              {t('institutional.privacy.sections.rights.contactBefore')} {contactLink}.{' '}
              {t('institutional.privacy.sections.rights.contactAfter')}
            </>
          ),
        },
      ],
    },
    {
      id: 'alteracoes',
      heading: t('institutional.privacy.sections.changes.heading'),
      blocks: [{ type: 'paragraph', text: t('institutional.privacy.sections.changes.p1') }],
    },
    {
      id: 'contato',
      heading: t('institutional.privacy.sections.contact.heading'),
      blocks: [
        {
          type: 'paragraph',
          text: (
            <>
              {t('institutional.privacy.sections.contact.before')} {contactLink}.
            </>
          ),
        },
      ],
    },
  ];

  return (
    <PublicPageLayout
      eyebrow={t('institutional.privacy.eyebrow')}
      title={t('institutional.privacy.title')}
      description={t('institutional.privacy.description', { appName: CONFIG.appName })}
    >
      <LegalDocument
        lastUpdated={t('institutional.privacy.lastUpdated')}
        disclaimer={t('institutional.privacy.disclaimer')}
        intro={t('institutional.privacy.intro', { appName: CONFIG.appName })}
        sections={sections}
      />
    </PublicPageLayout>
  );
}
