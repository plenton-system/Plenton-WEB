import { CONFIG } from 'src/config-global';

import { NoIndex } from 'src/components/seo';

import { PublicAnamnesisView } from 'src/sections/public-anamnesis/view/public-anamnesis-view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Anamnese - ${CONFIG.appName}`}</title>
            <NoIndex />

            <PublicAnamnesisView />
        </>
    );
}
