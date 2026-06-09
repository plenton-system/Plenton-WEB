import { CONFIG } from 'src/config-global';

import { AnamnesisView } from 'src/sections/anamnesis/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Anamnese - ${CONFIG.appName}`}</title>

            <AnamnesisView />
        </>
    );
}
