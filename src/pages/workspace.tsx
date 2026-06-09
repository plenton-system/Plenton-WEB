import { CONFIG } from 'src/config-global';

import { WorkspaceView } from 'src/sections/workspace/view';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <title>{`Workspace - ${CONFIG.appName}`}</title>

            <WorkspaceView />
        </>
    );
}
