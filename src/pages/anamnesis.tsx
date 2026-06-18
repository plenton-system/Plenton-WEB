import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { AnamnesisView } from 'src/sections/anamnesis/view';

// ----------------------------------------------------------------------

export default function Page() {
    const { t } = useTranslation();
    return (
        <>
            <title>{`${t('pages.anamnesis')} - ${CONFIG.appName}`}</title>

            <AnamnesisView />
        </>
    );
}
