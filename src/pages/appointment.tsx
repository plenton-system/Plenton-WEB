import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { AppointmentView } from 'src/sections/appointment/view';

// ----------------------------------------------------------------------

export default function Page() {
    const { t } = useTranslation();
    return (
        <>
            <title>{`${t('pages.appointment')} - ${CONFIG.appName}`}</title>

            <AppointmentView />
        </>
    );
}
