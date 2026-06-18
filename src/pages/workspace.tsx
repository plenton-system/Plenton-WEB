import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { WorkspaceView } from 'src/sections/workspace/view';

// ----------------------------------------------------------------------

export default function Page() {
    const { t } = useTranslation();
    return (
        <>
            <title>{`${t('pages.workspace')} - ${CONFIG.appName}`}</title>

            <WorkspaceView />
        </>
    );
}
