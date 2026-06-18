import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { NoIndex } from 'src/components/seo';

import { PublicAnamnesisView } from 'src/sections/public-anamnesis/view/public-anamnesis-view';

// ----------------------------------------------------------------------

export default function Page() {
    const { t } = useTranslation();
    return (
        <>
            <title>{`${t('pages.anamnesis')} - ${CONFIG.appName}`}</title>
            <NoIndex />

            <PublicAnamnesisView />
        </>
    );
}
