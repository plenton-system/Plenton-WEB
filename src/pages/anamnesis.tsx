import { CONFIG } from 'src/config-global';
import { useTranslation } from 'react-i18next';

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
