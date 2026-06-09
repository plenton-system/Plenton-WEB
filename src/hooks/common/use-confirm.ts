import { useContext } from 'react';

import { ConfirmContext, type ConfirmOptions } from 'src/contexts/confirm-context';

// ----------------------------------------------------------------------

export function useConfirm(): (opts: ConfirmOptions) => Promise<boolean> {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm deve ser usado dentro do ConfirmProvider');
    return ctx.confirm;
}
